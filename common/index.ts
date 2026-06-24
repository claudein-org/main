export { links } from './links'

import z from "zod"


export namespace yml {
    export type Media = z.infer<typeof Media>
    export const Media = z.object({
        type: z.union([z.literal('image'), z.literal('video')]),
        src: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
    })

    const Base = z.object({
        created: z.iso.datetime(),
    })

    export const PostText = Base.extend({
        type: z.literal('text'),
        text: z.string(),
    })

    export const PostMedia = Base.extend({
        type: z.literal('media'),
        text: z.string().optional(),
        media: Media,
    })

    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion('type', [PostText, PostMedia])

    export type Posts = z.infer<typeof Posts>
    export const Posts = z.object({ posts: z.array(Post) })
}

export namespace proto {
    const PostMedia = yml.PostMedia.extend({
        media: yml.Media.extend({
            base64: z.string(),
        })
    })


    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion('type', [yml.PostText, PostMedia])

    export type Payload = z.infer<typeof Payload>
    export const Payload = z.object({
        hash: z.string(),
        post: Post
    })

    export type Payloads = z.infer<typeof Payloads>
    export const Payloads = z.array(Payload)
}



export type PostType = yml.Post['type']
export type MediaType = yml.Media['type']