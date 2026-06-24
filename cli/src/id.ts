import { proto } from '@claudein.org/common'
import crypto from 'crypto'
import { stableHash } from 'stable-hash'

export function id(post: proto.Post) {
    return crypto
        .createHash('sha256')
        .update(stableHash(post))
        .digest('hex')
}


if (import.meta.main) {
    const post_id = id({
        type: 'text',
        created: new Date().toISOString(),
        text: 'Hello, world!',
    })
    console.log(post_id)
}