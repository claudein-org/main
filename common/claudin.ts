import z from "zod"

export namespace yml {
    export type Image = z.infer<typeof Image>
    export const Image = z.object({
        src: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
    })

    const Base = z.object({
        created: z.iso.datetime(),
        post_id: z.number().int(),
    })

    export const PostText = Base.extend({
        type: z.literal('text'),
        text: z.string(),
    })

    export const PostImage = Base.extend({
        type: z.literal('image'),
        text: z.string().optional(),
        image: Image,
    })

    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion('type', [PostText, PostImage])

    export type Posts = z.infer<typeof Posts>
    export const Posts = z.object({ posts: z.array(Post) })
}

export namespace proto {
    const PostImageSchema = yml.PostImage.extend({
        image: yml.Image.extend({
            base64: z.string(),
        })
    })

    export type Image = yml.Image & { base64: string }

    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion('type', [yml.PostText, PostImageSchema])

    export type Payload = z.infer<typeof Payload>
    export const Payload = z.object({
        posts: z.array(Post),
    })
}

