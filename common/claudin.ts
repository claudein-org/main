import { createHash } from "crypto"
import z from "zod"

const Image = z.object({
    src: z.string(),
    base64: z.string()
})

export type Post = z.infer<typeof Post>
const Post = z.object({
    text: z.string().optional(),
    images: z.array(Image).optional(),
})

export const Claudin = z.object({
    posts: z.array(Post)
})

export function hash(post: Post): bigint {
    const digest = createHash("sha256").update(JSON.stringify(post)).digest()
    return digest.readBigUInt64BE(0)
}