// scripts/src/queryDocs.ts

import { createClient } from '@supabase/supabase-js';
import { embed } from './geminiEmbed';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE = 'docs_embeddings';

async function listByPackage(pkg: string, limit = 10) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('file_path,package_name,updated_at')
    .eq('package_name', pkg)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  console.log(`\n📦  Files in package "${pkg}":`);
  console.table(data);
}

async function semanticSearch(pkg: string, query: string, limit = 10) {
  console.log(`\n🔍 Embedding query: "${query}"…`);
  const qEmb = await embed(query);
  console.log('🧠 Query embedding obtained');

  if (pkg === '*') {
    console.log('🌍 Global search (all packages)…');
    const { data, error } = await supabase.rpc('match_docs', {
      query_embedding: qEmb,
      k: limit,
    });
    if (error) throw error;
    console.log(`\n🎯 Top ${limit} global results for "${query}":`);
    console.table(
      data.map((r: any) => ({
        package_name: r.package_name,
        function_name: r.function_name,
        file_path: r.file_path,
        similarity: r.similarity,
      })),
    );
  } else {
    console.log(`📦 Package search in "${pkg}"…`);
    const { data, error } = await supabase.rpc('match_docs_in_package', {
      query_embedding: qEmb,
      pkg_name: pkg,
      k: limit,
    });
    if (error) throw error;
    console.log(`\n🎯 Top ${limit} results for "${query}" in "${pkg}":`);
    console.table(
      data.map((r: any) => ({
        package_name: r.package_name,
        function_name: r.function_name,
        file_path: r.file_path,
        similarity: r.similarity,
      })),
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const pkg = args[0];
  const query = args[1];

  if (!pkg) {
    console.error(
      '❌ Usage:\n 1) List files:          ts-node queryDocs.ts <packageName>\n 2) Package search:     ts-node queryDocs.ts <packageName> "your question"\n 3) Global search:      ts-node queryDocs.ts "*" "your question"',
    );
    process.exit(1);
  }

  if (query) {
    await semanticSearch(pkg, query);
  } else if (pkg === '*') {
    console.error('❌ "*" can only be used with a query for global search.');
    process.exit(1);
  } else {
    await listByPackage(pkg);
  }

  console.log('\n✅ Done');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
