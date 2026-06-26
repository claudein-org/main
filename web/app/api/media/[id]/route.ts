import { getMedia } from '@/lib/media-store'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const media = getMedia(id)
    if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const buf = Buffer.from(media.base64, 'base64')
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    return new NextResponse(arrayBuffer, {
        headers: { 'Content-Type': media.contentType },
    })
}
