---
description: Sync init.sql table definitions into lib/table.ts (init.sql is ground truth)
allowed-tools: [Read, Edit, Write, Bash]
---

# Sync init.sql → lib/table.ts

Read `init.sql` and update `lib/table.ts` to match, keeping `init.sql` as the ground truth.

## Rules

- The SQL schema defines the authoritative column names, types, and nullability.
- For each table in `init.sql`, ensure there is a matching Kysely interface in the `table` namespace in `lib/table.ts`.
- Use `Generated<number>` for `AUTO_INCREMENT PRIMARY KEY` columns and `Generated<Date>` for `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` columns.
- Map SQL types to TypeScript: `VARCHAR`/`TEXT` → `string`, `INT` → `number`, `DECIMAL` → `number`, `BOOLEAN` → `boolean`, `DATE`/`TIMESTAMP` → `Date`, `ENUM('a','b')` → `'a' | 'b'`.
- `NOT NULL` without a default → required field. Nullable or has DEFAULT (non-Generated) → add `| null` or keep as-is per existing convention.
- Add or update Zod schemas (`z.object(...)`) only for tables that already have one — do not invent new Zod schemas.
- Add new tables to the `DB` interface at the bottom of the file.
- Remove interfaces, Zod schemas, and `DB` entries for tables that no longer exist in `init.sql`.
- Preserve all existing enums, imports, and exports unrelated to removed tables. Do not reformat unrelated code.

## Steps

1. Read `init.sql` and `lib/table.ts`.
2. For each `CREATE TABLE` in `init.sql`, diff its columns against the corresponding interface in `lib/table.ts`.
3. Apply the minimal edits needed to bring `lib/table.ts` in sync — add missing tables, update changed columns, and remove interfaces/Zod schemas/DB entries for tables that no longer exist in `init.sql`.
4. Report a short summary: which tables were added, updated, removed, or already in sync.
