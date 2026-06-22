import { createHash } from "crypto"
import { writeFile } from "fs/promises"
import z from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const Image = z.object({
    src: z.string(),
    base64: z.string()
})

export type Post = z.infer<typeof Post>
const Post = z.object({
    date: z.coerce.date(),
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
    // TODO: export schema
    await writeFile('claudein.schema.json', zodToJsonSchema(Claudin, 'ClaudinSchema'))
}