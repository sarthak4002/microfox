-- 1. Create the extension
create extension if not exists vector;

-- 2. Create the table
create table if not exists docs_embeddings (
    id uuid primary key default gen_random_uuid(),
    package_name text not null,
    function_name text,
    doc_type text not null,
    file_path text not null unique,
    content text not null,
    embedding vector(768), -- Gemini text-embedding-004
    updated_at timestamp with time zone default now()
);

-- 3. Create index using cosine similarity
create index if not exists idx_docs_embeddings_embedding 
on docs_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4. Function: Search docs within a package
create or replace function match_docs_in_package(
    query_embedding vector,
    pkg_name text,
    k int default 5
)
returns table (
    id uuid,
    package_name text,
    function_name text,
    doc_type text,
    file_path text,
    content text,
    similarity float
)
language sql stable
as $$
    select
        id,
        package_name,
        function_name,
        doc_type,
        file_path,
        content,
        1 - (embedding <#> query_embedding) as similarity
    from docs_embeddings
    where package_name = pkg_name
    order by embedding <#> query_embedding
    limit k;
$$;

-- 5. Function: Global search across all packages
create or replace function match_docs(
    query_embedding vector,
    k int default 5
)
returns table (
    id uuid,
    package_name text,
    function_name text,
    doc_type text,
    file_path text,
    content text,
    similarity float
)
language sql stable
as $$
    select
        id,
        package_name,
        function_name,
        doc_type,
        file_path,
        content,
        1 - (embedding <#> query_embedding) as similarity
    from docs_embeddings
    order by embedding <#> query_embedding
    limit k;
$$;
