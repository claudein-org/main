export { links } from './links'

import z from "zod"

type Platform = z.infer<typeof Platform>
const Platform = z.enum(['LinkedIn', 'Facebook', 'Instagram', 'YouTube'])
export const PlatformEnum: { [key in Platform]: number } = {
    LinkedIn: 1,
    Facebook: 2,
    Instagram: 3,
    YouTube: 4,
}


export namespace yml {
    const BasicMedia = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
    })

    export const Image = BasicMedia.extend({
        type: z.literal('image'),
        src: z.string().regex(/.*\.(jpg|jpeg|png)$/),
    })

    export const Video = BasicMedia.extend({
        type: z.literal('video'),
        src: z.string().regex(/.*\.(mp4|mkv|avi)$/),
    })

    export type Media = z.infer<typeof Media>
    export const Media = z.discriminatedUnion('type', [Image, Video])

    const BasePost = z.object({
        created: z.iso.date(),
        platforms: z.array(Platform),
    })

    export const PostText = BasePost.extend({
        type: z.literal('text'),
        text: z.string(),
    })

    export const PostMedia = BasePost.extend({
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
    const Image = yml.Image.extend({ base64: z.string() })
    const Video = yml.Video.extend({ base64: z.string() })

    export type Media = z.infer<typeof Media>
    const Media = z.discriminatedUnion('type', [Image, Video])

    const PostMedia = yml.PostMedia.extend({ media: Media })

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