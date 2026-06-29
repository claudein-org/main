export { links } from './links'
export { PlatformEnum as Platform }

import z from "zod"

type Platform = z.infer<typeof Platform>
const Platform = z.enum([
    'LinkedIn',
    'Facebook',
    'Instagram',
    'YouTube',
    'DEV.to'
])

const PlatformEnum: { [key in Platform]: number } = {
    LinkedIn: 1,
    Facebook: 2,
    Instagram: 3,
    YouTube: 4,
    'DEV.to': 5,
}

export const PlatformSupport: { [key in Platform]: PostType[] } = {
    LinkedIn: ['text', 'image', 'video'],
    Facebook: ['text', 'image', 'video'],
    Instagram: ['video'],
    YouTube: ['video'],
    'DEV.to': ['article']
}


export namespace yml {
    const ImgSrc = z.string().regex(/.*\.(jpg|jpeg|png)$/)
    const VideoSrc = z.string().regex(/.*\.(mp4|mkv|avi)$/)
    const MD = z.string().regex(/.*\.(md)$/)

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

    const BasePost = z.object({
        created: z.iso.date(),
        platforms: z.array(Platform),
    })

    export const PostText = BasePost.extend({
        type: z.literal('text'),
        text: z.string(),
    })

    export const PostArticle = BasePost.extend({
        type: z.literal('article'),
        src: MD
    })

    export const PostImage = BasePost.extend({
        type: z.literal('image'),
        text: z.string().optional(),
        src: ImgSrc,
    })

    export const PostVideo = BasePost.extend({
        type: z.literal('video'),
        text: z.string().optional(),
        src: VideoSrc,
    })

    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion(
        'type', [
        PostText,
        PostArticle,
        PostImage,
        PostVideo
    ])

    export type Posts = z.infer<typeof Posts>
    export const Posts = z.object({ posts: z.array(Post) })

    export type Brand = z.infer<typeof Brand>
    export const Brand = z.object({
        src: z.literal('brand.md'),
    })

    export type YML = z.infer<typeof YML>
    export const YML = z.object({
        brand: Brand,
        posts: z.array(Post),
    })
}

export namespace proto {
    const Image = yml.Image.extend({ base64: z.string() })
    const Video = yml.Video.extend({ base64: z.string() })

    const PostArticle = yml.PostArticle.extend({ markdown: z.string() })
    const PostImage = yml.PostImage.extend({ image: Image })
    const PostVideo = yml.PostVideo.extend({ video: Video })

    export type Post = z.infer<typeof Post>
    export const Post = z.discriminatedUnion(
        'type', [
        yml.PostText,
        PostArticle,
        PostImage,
        PostVideo
    ])

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
    export const Brand = yml.Brand.extend({
        markdown: z.string(),
    })

    // The full brand bundle streamed to the web app over the websocket.
    export type Bundle = z.infer<typeof Bundle>
    export const Bundle = z.object({
        brand: Brand,
        payloads: Payloads,
    })
}

export type PostType = yml.Post['type']