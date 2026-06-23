import z from "zod"

export namespace yml {
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

export namespace ws {
    export type Image = z.infer<typeof Image>
    export const Image = yml.Image.extend({
        base64: z.string(),
    })

    export type Post = z.infer<typeof Post>
    export const Post = yml.Post.extend({
        images: z.array(Image).optional(),
    })

    export type Posts = z.infer<typeof Posts>
    export const Posts = yml.Posts.extend({
        posts: z.array(Post),
    })
}

