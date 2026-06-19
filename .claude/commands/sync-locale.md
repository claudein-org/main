---
description: Sync i18n/he.ts with i18n/en.ts (en.ts is ground truth)
allowed-tools: [Read, Edit, Write, Bash]
---

# Sync i18n/en.tsx → i18n/he.tsx

`en.ts` is the ground truth for all locale keys. 

## Goal

Ensure `he.ts` has an explicit Hebrew translation for every key defined in `en.ts`. 
All string values in `he.ts` must be in Hebrew — never English.

- Make sure all strings in `he.ts` are a correct translation of their English counterparts.
- If missing, translate and add.

## Steps

1. Read `i18n/en.ts` and `i18n/he.ts`.
2. Parse the full shape of the `en` object — every leaf string value.
4. Translate every untranslated key into natural, idiomatic Hebrew. Use the English value as the source.
6. Write the updated file.
7. Run `bunx tsc --noEmit` to confirm it type-checks.
8. Report a short summary: how many keys were already in Hebrew, how many were newly translated, how many stale keys were removed.
