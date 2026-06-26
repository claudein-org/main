export { links } from './links'

import z from "zod"

export namespace yml {
    const BasicMedia = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        src: z.string(),
    })

    export const Image = BasicMedia.extend({
        type: z.literal('image'),
    })

    export const Video = BasicMedia.extend({
        type: z.literal('video'),
    })

    export type Media = z.infer<typeof Media>
    export const Media = z.discriminatedUnion('type', [Image, Video])

    const Base = z.object({
        created: z.iso.date(),
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
    const ImageMeta = z.object({
        wpx: z.number(),
        hpx: z.number(),
    })

    const Image = yml.Image.extend({
        base64: z.string(),
        meta: ImageMeta,
    })

    const VideoMeta = ImageMeta.extend({
        durationSec: z.number(),
    })

    const Video = yml.Video.extend({
        base64: z.string(),
        meta: VideoMeta,
    })

    export type Media = z.infer<typeof Media>
    const Media = z.discriminatedUnion('type', [Image, Video])


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