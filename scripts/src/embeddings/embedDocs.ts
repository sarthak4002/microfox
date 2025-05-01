// scripts/src/embeddings/embedDocs.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { embed } from './geminiEmbed';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 1) Use process.cwd() so it works the same on Windows, macOS, Linux, and in GH Actions:
const PACKAGES_DIR = path.resolve(process.cwd(), '..', 'packages');
const DOCS_TABLE = 'docs_embeddings';

// initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2) Try git timestamp, but fall back to FS mtime if it fails:
function getGitLastModified(fullPath: string): Date {
  try {
    // git expects a repo root, so we run from process.cwd()
    const out = execSync(
      `git log -1 --format=%ct -- "${path.relative(process.cwd(), fullPath)}"`,
      { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .toString()
      .trim();
    const sec = Number(out);
    if (!isNaN(sec)) {
      return new Date(sec * 1000);
    }
  } catch {
    console.log(`Error getting git last modified for ${fullPath}`);
    // ignore errors
  }
  // fallback:
  return fs.statSync(fullPath).mtime;
}

async function getExistingDocs() {
  const { data, error } = await supabase
    .from(DOCS_TABLE)
    .select('id,file_path,updated_at');
  if (error) throw error;
  return data as Array<{ id: string; file_path: string; updated_at: string }>;
}

function walkDocs() {
  const results: Array<{
    packageName: string;
    functionName: string;
    filePath: string;
    fullPath: string;
    mtime: Date;
    content: string;
  }> = [];

  if (!fs.existsSync(PACKAGES_DIR)) {
    console.warn(`⚠️  packages/ directory not found at ${PACKAGES_DIR}`);
    return results;
  }

  for (const pkg of fs.readdirSync(PACKAGES_DIR)) {
    const docsDir = path.join(PACKAGES_DIR, pkg, 'docs');
    if (!fs.existsSync(docsDir)) continue;

    for (const file of fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))) {
      const fullPath = path.join(docsDir, file);
      const mtime = getGitLastModified(fullPath);
      results.push({
        packageName: pkg,
        functionName: file.replace(/\.md$/, ''),
        filePath: path.relative(PACKAGES_DIR, fullPath),
        fullPath,
        mtime,
        content: fs.readFileSync(fullPath, 'utf-8'),
      });
    }
  }

  return results;
}

async function main() {
  console.log('⏳ Fetching existing docs from DB…');
  const existing = await getExistingDocs();
  const existingMap = new Map(existing.map(r => [r.file_path, r]));

  console.log('⏳ Scanning filesystem…');
  const localDocs = walkDocs();
  const localPaths = new Set(localDocs.map(d => d.filePath));

  // 1) Remove deleted files
  const toDelete = existing.filter(r => !localPaths.has(r.file_path));
  if (toDelete.length) {
    console.log(`🗑 Deleting ${toDelete.length} removed docs…`);
    for (const { id } of toDelete) {
      await supabase.from(DOCS_TABLE).delete().eq('id', id);
    }
  }

  // 2) Upsert new/updated files
  const upserts: any[] = [];
  for (const doc of localDocs) {
    const dbRow = existingMap.get(doc.filePath);
    const isNew = !dbRow;
    const isStale = dbRow && new Date(dbRow.updated_at) < doc.mtime;
    if (isNew || isStale) {
      console.log(`${isNew ? '✨ New' : '♻️ Updated'} → ${doc.filePath}`);
      const embedding = await embed(doc.content);
      upserts.push({
        package_name: doc.packageName,
        function_name: doc.functionName,
        file_path: doc.filePath,
        content: doc.content,
        embedding,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (upserts.length) {
    const { error } = await supabase
      .from(DOCS_TABLE)
      .upsert(upserts, { onConflict: 'file_path' });
    if (error) throw error;
    console.log(`✅ Upserted ${upserts.length} docs.`);
  } else {
    console.log('✅ No new or changed docs to upsert.');
  }
}

main()
  .then(() => console.log('🎉 Done!'))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
