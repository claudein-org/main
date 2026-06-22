import { createHash } from "crypto"
import { writeFile } from "fs/promises"
import { stringify } from 'yaml'
import z from "zod"

const Image = z.object({
    src: z.string(),
    base64: z.string()
})

export type Post = z.infer<typeof Post>
const Post = z.object({
    date: z.iso.datetime(),
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

if (import.meta.main) {
    const schema = Claudin.toJSONSchema()
    await writeFile('claudein.schema.yml', stringify(schema))
}