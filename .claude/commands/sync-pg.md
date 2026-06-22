---
description: Sync init.sql with the Postgres server schema — write migration plan to migration.sql
allowed-tools: [Read, Write, Bash]
---

# Sync init.sql → migration.sql

Compare `web/init.sql` (desired schema) against the live Postgres server schema and write the minimal migration needed to bring the server in sync. **Do not execute any DDL.** Write the plan to `migration.sql`.

## Connecting

There is no Postgres MCP. Query the live database with `psql`, using the connection details from `web/.env` (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`). The DigitalOcean managed cluster requires SSL, so always pass `sslmode=require`:

```bash
set -a; source web/.env; set +a
PGPASSWORD="$DB_PASS" psql \
  "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require" \
  -tAF $'\t' -c "<query>"
```

`-tA` gives tuples-only, unaligned output and `-F $'\t'` makes columns tab-separated for easy parsing.

## Steps

### 1. Read the desired schema

Read `web/init.sql` to extract all tables with their columns, types, nullability, defaults, primary keys, unique constraints, and indexes.

### 2. Read the live schema

Run these queries against the Postgres server (schema `public`):

**Columns:**
```sql
SELECT table_name, column_name, data_type, character_maximum_length,
       is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

**Indexes & constraints:**
```sql
SELECT t.relname AS table_name,
       i.relname AS index_name,
       ix.indisunique AS is_unique,
       ix.indisprimary AS is_primary,
       array_to_string(array_agg(a.attname ORDER BY x.ord), ',') AS columns
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN unnest(ix.indkey) WITH ORDINALITY AS x(attnum, ord) ON true
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = x.attnum
WHERE t.relkind = 'r' AND t.relnamespace = 'public'::regnamespace
GROUP BY t.relname, i.relname, ix.indisunique, ix.indisprimary
ORDER BY t.relname, i.relname;
```

### 3. Diff

For each table in `init.sql`, compare against the live schema:

- **Missing table** → `CREATE TABLE ...` (full definition from init.sql)
- **Extra table** (exists in DB but not in init.sql) → `DROP TABLE ...` with a safety comment
- **Missing column** → `ALTER TABLE ... ADD COLUMN ...`
- **Extra column** → `ALTER TABLE ... DROP COLUMN ...` with a safety comment
- **Type mismatch** → `ALTER TABLE ... ALTER COLUMN ... TYPE ...` (add a `USING` clause if the cast isn't implicit)
- **Nullability mismatch** → `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL` / `DROP NOT NULL`
- **Default mismatch** → `ALTER TABLE ... ALTER COLUMN ... SET DEFAULT ...` / `DROP DEFAULT`
- **Primary key mismatch** → `ALTER TABLE ... DROP CONSTRAINT <pk>, ADD PRIMARY KEY (...)`
- **Missing unique constraint** → `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE (...)`
- **Extra unique constraint** → `ALTER TABLE ... DROP CONSTRAINT ...`
- **Missing index** → `CREATE INDEX ...`
- **Extra index** (non-constraint) → `DROP INDEX ...`

Ignore foreign key constraint differences — they are secondary to column/index correctness. Postgres auto-creates an index named `<table>_pkey` for each primary key; treat that as the PK, not an extra index.

### 4. Write migration.sql

Write `migration.sql` at the project root with:
- A header comment showing the date and a one-line summary of what changed
- Each statement on its own, separated by a blank line
- A short `-- reason:` comment before each statement explaining why it's needed
- Destructive statements (DROP TABLE, DROP COLUMN) preceded by a `-- DANGER:` warning comment
- If nothing needs to change, write a single comment: `-- No migration needed. Schemas are in sync.`

### 5. Report

After writing the file, print a short summary:
- Tables added / removed
- Columns added / modified / removed, grouped by table
- Indexes added / removed
