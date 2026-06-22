/*
 * Tool: auto-generates type-safe path links from the Next.js app directory.
 * Run: bun tools/app.ts
 * Output: lib/links.ts  (auto-generated — do not edit manually)
 *
 * To add a new dynamic segment [param], add it to `configure.params` below.
 * If the type is a custom import (not number/string/boolean), add `from`.
 */

import { readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

// ─── Configuration ────────────────────────────────────────────────────────────

interface ParamConfig {
    type: string   // TypeScript type expression
    from?: string  // import path for the type (omit for number / string / boolean)
}

const configure = {
    params: {
        port: { type: 'number' },
    } as Record<string, ParamConfig>,
}

// ─── Tree ─────────────────────────────────────────────────────────────────────

interface Node {
    segment: string
    isDynamic: boolean
    param?: string      // "lang" from "[lang]"
    isLeaf: boolean     // a page.tsx / route.ts exists at this exact path
    children: Map<string, Node>
}

function makeNode(segment: string): Node {
    const isDynamic = /^\[(?!\.\.\.)/.test(segment) && segment.endsWith(']')
    return {
        segment,
        isDynamic,
        param: isDynamic ? segment.slice(1, -1) : undefined,
        isLeaf: false,
        children: new Map(),
    }
}

function buildTree(appDir: string): { root: Map<string, Node>; rootIsLeaf: boolean } {
    const root = new Map<string, Node>()
    let rootIsLeaf = false

    function walk(dir: string): string[] {
        const out: string[] = []
        for (const entry of readdirSync(dir)) {
            const full = join(dir, entry)
            if (statSync(full).isDirectory()) out.push(...walk(full))
            else if (/^(page|route)\.(tsx?|jsx?)$/.test(entry)) out.push(full)
        }
        return out
    }

    for (const file of walk(appDir)) {
        const segs = file.slice(appDir.length + 1).split('/').slice(0, -1)

        if (segs.length === 0) { rootIsLeaf = true; continue }

        let cur = root
        for (let i = 0; i < segs.length; i++) {
            if (!cur.has(segs[i])) cur.set(segs[i], makeNode(segs[i]))
            const n = cur.get(segs[i])!
            if (i === segs.length - 1) n.isLeaf = true
            cur = n.children
        }
    }

    return { root, rootIsLeaf }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(nodes: Map<string, Node>): void {
    for (const n of nodes.values()) {
        if (n.isDynamic && n.param && !(n.param in configure.params)) {
            throw new Error(
                `Dynamic segment "[${n.param}]" has no type configured.\n` +
                `  → Add  ${n.param}: { type: '...' }  to configure.params in tools/app.ts.`
            )
        }
        validate(n.children)
    }
}

// ─── Code Generation ──────────────────────────────────────────────────────────

const INDENT = '    '
const ind = (n: number) => INDENT.repeat(n)

/**
 * Build a template literal for a path.
 * @param pathVar  JS variable holding the current base path; null at root
 * @param suffix   accumulated static segments since pathVar, e.g. "/channels"
 * @param extra    the part to append, e.g. "/about" or "/\${cid}"
 */
function tpl(pathVar: string | null, suffix: string, extra: string): string {
    return pathVar
        ? `\`\${${pathVar}}${suffix}${extra}\``
        : `\`${suffix}${extra}\``
}

function genEntries(
    nodes: Map<string, Node>,
    pathVar: string | null,
    suffix: string,
    depth: number,
): string {
    const lines: string[] = []
    for (const [, n] of [...nodes.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        lines.push(`${toId(n.segment)}: ${genValue(n, pathVar, suffix, depth)},`)
    }
    return lines.join(`\n${ind(depth)}`)
}

function genValue(
    n: Node,
    pathVar: string | null,
    suffix: string,
    depth: number,
): string {
    if (n.isDynamic) {
        const p = n.param!
        const type = configure.params[p].type
        const newVar = `$${p}`
        const fullPath = tpl(pathVar, suffix, `/\${${p}}`)

        if (!n.children.size) {
            // Leaf function with no sub-paths — return the path string directly
            return `(${p}: ${type}) => ${fullPath}`
        }

        const inner = genEntries(n.children, newVar, '', depth + 2)
        const retBody = n.isLeaf
            ? `_: ${newVar},\n${ind(depth + 2)}${inner}`
            : inner

        return (
            `(${p}: ${type}) => {\n` +
            `${ind(depth + 1)}const ${newVar} = ${fullPath}\n` +
            `${ind(depth + 1)}return {\n` +
            `${ind(depth + 2)}${retBody}\n` +
            `${ind(depth + 1)}}\n` +
            `${ind(depth)}}`
        )
    } else {
        const newSuffix = `${suffix}/${n.segment}`
        const literal = tpl(pathVar, newSuffix, '')

        if (!n.children.size) return literal  // simple string leaf

        const inner = genEntries(n.children, pathVar, newSuffix, depth + 1)
        const body = n.isLeaf
            ? `_: ${literal},\n${ind(depth + 1)}${inner}`
            : inner

        return `{\n${ind(depth + 1)}${body}\n${ind(depth)}}`
    }
}

function generateLinks(appDir: string): string {
    const { root, rootIsLeaf } = buildTree(appDir)

    validate(root)

    // Collect import statements for custom types
    const imports = new Set<string>()
        ; (function collect(nodes: Map<string, Node>) {
            for (const n of nodes.values()) {
                if (n.isDynamic && n.param) {
                    const cfg = configure.params[n.param]
                    if (cfg?.from) imports.add(`import type { ${cfg.type} } from '${cfg.from}'`)
                }
                collect(n.children)
            }
        })(root)

    const body = genEntries(root, null, '', 1)
    const topBody = rootIsLeaf ? `_: '/',\n${ind(1)}${body}` : body

    const lines = [
        `// AUTO-GENERATED — do not edit manually`,
        `// Run: bun tools/app.ts`,
        ``,
        ...[...imports].sort(),
        ``,
        `export const links = {`,
        `${ind(1)}${topBody}`,
        `}`,
        ``,
    ]

    return lines.join('\n')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a filesystem segment to a valid camelCase JS identifier. */
function toId(segment: string): string {
    return segment
        .replace(/^\[(.+)\]$/, '$1')                                      // [param] → param
        .replace(/[-.]([a-z0-9])/gi, (_, c: string) => c.toUpperCase())  // kebab/dot → camelCase
}

// ─── Entry point ──────────────────────────────────────────────────────────────

if (import.meta.main) {
    // @ts-ignore
    const appDir = join(import.meta.dir, '..', 'app')
    // @ts-ignore
    const outFile = join(import.meta.dir, '..', 'lib', 'links.ts')

    try {
        const code = generateLinks(appDir)
        writeFileSync(outFile, code)
        console.log(`✓ Generated lib/links.ts`)
    } catch (e) {
        console.error(`✗ ${(e as Error).message}`)
        process.exit(1)
    }
}
