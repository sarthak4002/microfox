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
const PACKAGES_DIR = path.resolve(__dirname, '../../../packages');
const DOCS_TABLE = 'docs_embeddings';

// initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getGitLastModified(filePath: string): Date {
  const out = execSync(`git log -1 --format=%ct -- "${filePath}"`, {
    cwd: PACKAGES_DIR,
  })
    .toString()
    .trim();
  return new Date(Number(out) * 1000);
}

async function getExistingDocs() {
  const { data, error } = await supabase
    .from(DOCS_TABLE)
    .select('id,file_path,updated_at');
  if (error) throw error;
  return data! as Array<{ id: string; file_path: string; updated_at: string }>;
}

function walkDocs(): Array<{
  packageName: string;
  filePath: string;
  fullPath: string;
  mtime: Date;
  content: string;
  functionName: string;
}> {
  const results: Array<any> = [];
  for (const pkg of fs.readdirSync(PACKAGES_DIR)) {
    const docsDir = path.join(PACKAGES_DIR, pkg, 'docs');
    if (!fs.existsSync(docsDir)) continue;
    for (const file of fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))) {
      const fullPath = path.join(docsDir, file);
      const mtime = getGitLastModified(fullPath);
      results.push({
        packageName: pkg,
        filePath: path.relative(PACKAGES_DIR, fullPath),
        functionName: file.replace('.md', ''),
        fullPath,
        mtime,
        content: fs.readFileSync(fullPath, 'utf-8'),
      });
    }
  }
  return results;
}

async function main() {
  console.log('⏳ fetching existing docs from DB…');
  const existing = await getExistingDocs();
  const existingMap = new Map(existing.map(r => [r.file_path, r]));

  console.log('⏳ scanning filesystem…');
  const localDocs = walkDocs();
  const localPaths = new Set(localDocs.map(d => d.filePath));

  // 1) Deleted files → delete from DB
  const toDelete = existing.filter(r => !localPaths.has(r.file_path));
  if (toDelete.length) {
    console.log(`🗑  deleting ${toDelete.length} removed docs…`);
    for (const row of toDelete) {
      await supabase.from(DOCS_TABLE).delete().eq('id', row.id);
    }
  }

  // 2) New or updated files → upsert
  const upserts: Array<any> = [];
  for (const doc of localDocs) {
    const dbRow = existingMap.get(doc.filePath);
    const isNew = !dbRow;
    const isStale = dbRow && new Date(dbRow.updated_at) < doc.mtime;
    if (isNew || isStale) {
      console.log(`${isNew ? '✨ new' : '♻️ updating'} → ${doc.filePath}`);
      const text = fs.readFileSync(doc.fullPath, 'utf-8');
      const embedding = await embed(text);
      console.log('successfully generated embedding for ', doc.filePath);
      upserts.push({
        package_name: doc.packageName,
        function_name: doc.functionName,
        file_path: doc.filePath,
        embedding,
        content: doc.content,
        updated_at: new Date().toISOString(),
      });
    }
  }
  if (upserts.length) {
    const { data, error } = await supabase
      .from(DOCS_TABLE)
      .upsert(upserts, { onConflict: 'file_path' });
    if (error) {
      console.error(error);
    }
    console.log(`✅ upserted ${upserts.length} docs.`);
  } else {
    console.log('✅ no new or changed docs to upsert.');
  }
}

main()
  .then(() => console.log('🎉 done!'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
