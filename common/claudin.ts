import { readFile, writeFile } from "fs/promises"
import { stringify } from 'yaml'
import z from "zod"

namespace yml {
    export type Image = z.infer<typeof Image>
    export const Image = z.object({
        src: z.string(),
    })

    export type Post = z.infer<typeof Post>
    export const Post = z.object({
        post_id: z.number().int(),
        date: z.iso.datetime(),
        text: z.string().optional(),
        images: z.array(Image).optional(),
    })

    export type Posts = z.infer<typeof Posts>
    export const Posts = z.object({
        posts: z.array(Post),
    })
}

namespace ws {
    type Image = z.infer<typeof Image>
    const Image = yml.Image.extend({
        base64: z.string(),
    })

    type Post = z.infer<typeof Post>
    const Post = yml.Post.extend({
        images: z.array(Image).optional(),
    })

    type Posts = z.infer<typeof Posts>
    const Posts = yml.Posts.extend({
        posts: z.array(Post),
    })

    async function i2i(image: yml.Image): Promise<Image> {
        const data = await readFile(image.src)
        return {
            ...image,
            base64: data.toString('base64'),
        }
    }

    async function p2p(post: yml.Post): Promise<Post> {
        return {
            ...post,
            images: post.images ? await Promise.all(post.images.map(i2i)) : undefined,
        }
    }

    export async function ps2ps({ posts }: yml.Posts): Promise<Posts> {
        return {
            posts: await Promise.all(posts.map(p2p))
        }
    }
}

if (import.meta.main) {
    const schema = yml.Posts.toJSONSchema()
    await writeFile('claudein.schema.yml', stringify(schema))
}