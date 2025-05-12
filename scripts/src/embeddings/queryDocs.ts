// scripts/src/queryDocs.ts

import { createClient } from '@supabase/supabase-js';
import { embed } from './geminiEmbed';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE = 'docs_embeddings';

async function listByPackage(pkg: string, docType?: string, limit = 10) {
  const query = supabase
    .from(TABLE)
    .select('file_path,package_name,function_name,doc_type,updated_at')
    .eq('package_name', pkg)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (docType) {
    query.eq('doc_type', docType);
  }

  const { data, error } = await query;
  if (error) throw error;

  console.log(`\n📦  Files in package "${pkg}"${docType ? ` with doc_type "${docType}"` : ''}:`);
  console.table(
    data!.map((r: any) => ({
      package_name: r.package_name,
      function_name: r.function_name,
      doc_type: r.doc_type,
      file_path: r.file_path.split('/').slice(-3).join('/'),
    }))
  );
}

async function semanticSearch(pkg: string, query: string, docType?: string, limit = 10) {
  console.log(`\n🔍 Embedding query: "${query}"…`);
  const qEmb = await embed(query);
  console.log('🧠 Query embedding obtained');

  const fnName = pkg === '*' ? 'match_docs' : 'match_docs_in_package';
  const rpcArgs: any = {
    query_embedding: qEmb,
    k: limit,
    doc_type_filter: docType || null,
  };
  if (pkg !== '*') {
    rpcArgs.pkg_name = pkg;
  }

  console.log(
    pkg === '*'
      ? `🌍 Global search${docType ? ` with doc_type "${docType}"` : ''}…`
      : `📦 Package search in "${pkg}"${docType ? ` with doc_type "${docType}"` : ''}…`
  );

  const { data, error } = await supabase.rpc(fnName, rpcArgs);
  if (error) throw error;

  console.log(
    `\n🎯 Top ${limit} ${pkg === '*' ? 'global' : 'package'} results for "${query}"${docType ? ` with doc_type "${docType}"` : ''}:`
  );
  console.table(
    (data as any[]).map(r => ({
      package_name: r.package_name,
      function_name: r.function_name,
      doc_type: r.doc_type,
      file_path: r.file_path.split('/').slice(-3).join('/'),
      similarity: r.similarity,
    }))
  );
}

async function main() {
  const args = process.argv.slice(2);
  const pkg = args[0];
  const docType = args[1];
  const query = args[2];

  if (!pkg) {
    console.error(
      '❌ Usage:\n' +
      ' 1) List files:          ts-node queryDocs.ts <packageName> [docType]\n' +
      ' 2) Package search:      ts-node queryDocs.ts <packageName> [docType] "your question"\n' +
      ' 3) Global search:       ts-node queryDocs.ts "*" [docType] "your question"'
    );
    process.exit(1);
  }

  if (query) {
    await semanticSearch(pkg, query, docType);
  } else if (pkg === '*') {
    console.error('❌ "*" can only be used with a query for global search.');
    process.exit(1);
  } else {
    await listByPackage(pkg, docType);
  }

  console.log('\n✅ Done');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
