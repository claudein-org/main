export { links } from './links'

import z from "zod"

export namespace yml {
    export const ImageMedia = z.object({
        type: z.literal('image'),
        src: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
    })

    export const VideoMedia = z.object({
        type: z.literal('video'),
        src: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
    })

    export type Media = z.infer<typeof Media>
    export const Media = z.discriminatedUnion('type', [ImageMedia, VideoMedia])

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
    const ImageMedia = yml.ImageMedia.extend({
        base64: z.string(),
        mimeType: z.union([
            z.literal('image/jpeg'),
            z.literal('image/png'),
            z.literal('image/gif')
        ]),
    })

    const VideoMedia = yml.VideoMedia.extend({
        base64: z.string(),
        mimeType: z.union([
            z.literal('video/mp4'),
            z.literal('video/mpeg')
        ]),
    })

    export type Media = z.infer<typeof Media>
    export const Media = z.discriminatedUnion('type', [ImageMedia, VideoMedia])

    const PostMedia = yml.PostMedia.extend({
        media: Media
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