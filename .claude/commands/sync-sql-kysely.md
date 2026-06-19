---
description: Sync web/init.sql table definitions into web/lib/db.ts (init.sql is ground truth)
allowed-tools: [Read, Edit, Write, Bash]
---

# Sync web/init.sql → web/lib/db.ts

Read `web/init.sql` and update `web/lib/db.ts` to match, keeping `init.sql` as the ground truth.

## Rules

- The SQL schema defines the authoritative column names, types, and nullability.
- For each table in `schema.sql`, ensure there is a matching Kysely interface in `web/lib/db.ts`.
- Use `Generated<string>` for `UUID DEFAULT gen_random_uuid()` columns, `Generated<number>` for `SERIAL` columns, and `Generated<Date>` for `TIMESTAMPTZ DEFAULT now()` / `TIMESTAMP DEFAULT now()` columns.
- Map SQL types to TypeScript: `TEXT`/`VARCHAR` → `string`, `UUID` → `string`, `INT`/`INTEGER` → `number`, `NUMERIC`/`DECIMAL` → `number`, `BOOLEAN` → `boolean`, `TIMESTAMPTZ`/`TIMESTAMP`/`DATE` → `Date`.
- `NOT NULL` without a default → required field. Nullable or has DEFAULT (non-Generated) → field may be `| null` per existing convention.
- Add new tables to the `DB` interface at the bottom of the file.
- Remove interfaces and `DB` entries for tables that no longer exist in `schema.sql`.
- Ignore `ALTER TABLE`, `CREATE INDEX`, `ENABLE ROW LEVEL SECURITY`, and other non-column DDL — only `CREATE TABLE` columns drive the interface.
- Preserve all existing imports and exports unrelated to removed tables. Do not reformat unrelated code.

## Steps

1. Read `web/supabase/schema.sql` and `web/lib/db.ts`.
2. For each `CREATE TABLE` in `schema.sql`, diff its columns against the corresponding interface in `web/lib/db.ts`.
3. Apply the minimal edits needed to bring `web/lib/db.ts` in sync — add missing tables, update changed columns, and remove interfaces/DB entries for tables that no longer exist in `schema.sql`.
4. Report a short summary: which tables were added, updated, removed, or already in sync.
