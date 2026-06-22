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

export function hash(post: Post) {
    // TODO: fast hash on the entire post, extract the first bigint, hash is for collision detection, not for security.
}