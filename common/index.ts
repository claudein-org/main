export { links } from './links'
export { PlatformEnum as Platform }

import z from "zod"

type Platform = z.infer<typeof Platform>
const Platform = z.enum(['LinkedIn', 'Facebook', 'Instagram', 'YouTube'])
const PlatformEnum: { [key in Platform]: number } = {
    LinkedIn: 1,
    Facebook: 2,
    Instagram: 3,
    YouTube: 4,
}


export namespace yml {
    const ImgSrc = z.string().regex(/.*\.(jpg|jpeg|png)$/)
    const LogoSrc = z.string().regex(/.*\.(jpg|jpeg|png|svg)$/)
    const VideoSrc = z.string().regex(/.*\.(mp4|mkv|avi)$/)

    export type Brand = z.infer<typeof Brand>
    export const Brand = z.object({
        title: z.string(),
        description: z.string(),
        logo: LogoSrc,

        features: z.array(z.string()),
        images: z.array(ImgSrc),
    })

    const BasicMedia = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
    })

    export const Image = BasicMedia.extend({
        type: z.literal('image'),
        src: ImgSrc,
    })

    export const Video = BasicMedia.extend({
        type: z.literal('video'),
        src: VideoSrc,
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

    export type YML = z.infer<typeof YML>
    export const YML = z.object({
        brand: Brand,
        posts: z.array(Post),
    })
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

    // A media asset (logo / brand image) inlined as base64 with its mime type.
    export type Asset = z.infer<typeof Asset>
    export const Asset = z.object({
        base64: z.string(),
        mime: z.string(),
    })

    export type Brand = z.infer<typeof Brand>
    export const Brand = z.object({
        title: z.string(),
        description: z.string(),
        logo: Asset,
        features: z.array(z.string()),
        images: z.array(Asset),
    })

    // The full brand bundle streamed to the web app over the websocket.
    export type Bundle = z.infer<typeof Bundle>
    export const Bundle = z.object({
        brand: Brand,
        payloads: Payloads,
    })
}

export type PostType = yml.Post['type']
export type MediaType = yml.Media['type']