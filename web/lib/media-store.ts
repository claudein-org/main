import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

const DIR = '/tmp/claudein-media'

function ensureDir() {
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
}

export function storeMedia(id: string, base64: string, contentType: string): void {
    ensureDir()
    writeFileSync(join(DIR, id), JSON.stringify({ base64, contentType }))
}

export function getMedia(id: string): { base64: string; contentType: string } | undefined {
    const path = join(DIR, id)
    if (!existsSync(path)) return undefined
    try {
        return JSON.parse(readFileSync(path, 'utf-8'))
    } catch {
        return undefined
    }
}

export function deleteMedia(id: string): void {
    try { rmSync(join(DIR, id)) } catch {}
}
