---
description: Sync init.sql with MySQL server schema — write migration plan to migration.sql
allowed-tools: [Read, Write, mcp__mysql__mysql_query]
---

# Sync init.sql → migration.sql

Compare `init.sql` (desired schema) against the live MySQL server schema and write the minimal migration needed to bring the server in sync. **Do not execute any DDL.** Write the plan to `migration.sql`.

## Steps

### 1. Read the desired schema

Read `init.sql` to extract all tables with their columns, types, nullability, defaults, primary keys, unique constraints, and indexes.

### 2. Read the live schema

Run these queries against the MySQL server:

**Columns:**
```sql
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, ORDINAL_POSITION
```

**Indexes:**
```sql
SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE,
       GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME
```

### 3. Diff

For each table in `init.sql`, compare against the live schema:

- **Missing table** → `CREATE TABLE ...` (full definition from init.sql)
- **Extra table** (exists in DB but not in init.sql) → `DROP TABLE ...` with a safety comment
- **Missing column** → `ALTER TABLE ... ADD COLUMN ...`
- **Extra column** → `ALTER TABLE ... DROP COLUMN ...` with a safety comment
- **Type mismatch** → `ALTER TABLE ... MODIFY COLUMN ...`
- **Nullability mismatch** → `ALTER TABLE ... MODIFY COLUMN ...`
- **Default mismatch** → `ALTER TABLE ... MODIFY COLUMN ...`
- **Primary key mismatch** → `ALTER TABLE ... DROP PRIMARY KEY, ADD PRIMARY KEY (...)`
- **Missing unique constraint** → `ALTER TABLE ... ADD UNIQUE (...)`
- **Extra unique constraint** → `ALTER TABLE ... DROP INDEX ...`
- **Missing index** → `CREATE INDEX ...`
- **Extra index** (non-constraint) → `DROP INDEX ... ON ...`

Ignore foreign key constraint differences — they are secondary to column/index correctness.

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
