export { links } from './links'
export { PlatformEnum as Platform }

import z, { ZodType } from "zod"

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

export const PlatformSupport: { [key in Platform]: AssetType[] } = {
    LinkedIn: ['post', 'image', 'video'],
    Facebook: ['post', 'image', 'video'],
    Instagram: ['video'],
    YouTube: ['video'],
    'DEV.to': ['article']
}

interface Folder {
    type: 'folder'
    name: string
    description: string
    children?: Array<Folder | File>
}

interface File {
    type: 'file'
    name: string
    description: string
}

export const claudein: Folder = {
    type: 'folder',
    name: 'claudein',
    description: 'ClaudeIn root folder',
    children: [
        {
            type: 'file',
            name: 'claudein.yml',
            description: 'The main data file for claudein contains all the posts, articles, etc... with reference to the content files (media, articles .md files, etc...)',
        },
        {
            type: 'folder',
            name: 'media',
            description: 'Media files for claudein. This folder contains soft links to relevant media files in the project and actual media files that was created especially for claudein.',
        },
        {
            type: 'folder',
            name: 'articles',
            description: 'A folder that contains .md files, each .md file is a full, self contained short article to be published on supported platforms.',
        },
    ]
}

function touch(f: Folder) {
    // TODO: mkdir f and all subfolders, and touch all files
}

type Path = (File | Folder) & { path: string[] }

function tree(f: Folder, root: string[] = []) {
    // TODO: return a path array of all files and folders in the tree, with their paths
}

export namespace yml {
    const ImageSrc = z.string().regex(/.*\.(jpg|jpeg|png)$/)
    const VideoSrc = z.string().regex(/.*\.(mp4|mkv|avi)$/)
    const MDSrc = z.string().regex(/.*\.(md)$/)

    const BaseAsset = z.object({
        created: z.iso.date(),
        target: z.array(Platform)
    })

    export const Image = BaseAsset.extend({
        type: z.literal('image'),
        title: z.string().optional(),
        description: z.string().optional(),
        src: ImageSrc,
    })

    export const Video = BaseAsset.extend({
        type: z.literal('video'),
        title: z.string().optional(),
        description: z.string().optional(),
        src: VideoSrc,
    })

    export const Post = BaseAsset.extend({
        type: z.literal('post'),
        text: z.string(),
    })

    export const Article = BaseAsset.extend({
        type: z.literal('article'),
        src: MDSrc
    })

    export type Asset = z.infer<typeof Asset>
    export const Asset = z.discriminatedUnion('type', [
        Post,
        Article,
        Image,
        Video
    ])

    export type Brand = z.infer<typeof Brand>
    export const Brand = z.object({
        src: z.literal('brand.md'),
    })

    export type YML = z.infer<typeof YML>
    export const YML = z.object({
        brand: Brand,
        assets: z.array(Asset)
    })
}

export namespace proto {
    export type Post = z.infer<typeof Post>
    export const Post = yml.Post.extend({})

    export type Article = z.infer<typeof Article>
    export const Article = yml.Article.extend({ markdown: z.string() })

    export type Image = z.infer<typeof Image>
    export const Image = yml.Image.extend({ base64: z.string() })

    export type Video = z.infer<typeof Video>
    export const Video = yml.Video.extend({ base64: z.string() })

    export type Asset = z.infer<typeof Asset>
    export const Asset = z.discriminatedUnion('type', [
        Post,
        Article,
        Image,
        Video
    ])

    export type Payload = z.infer<typeof Payload>
    export const Payload = z.object({
        hash: z.string(),
        asset: Asset
    })

    export type Brand = z.infer<typeof Brand>
    export const Brand = yml.Brand.extend({
        markdown: z.string(),
    })

    // The full brand bundle streamed to the web app over the websocket.
    export type Bundle = z.infer<typeof Bundle>
    export const Bundle = z.object({
        brand: Brand,
        payloads: z.array(Payload),
    })
}

export type AssetType = yml.Asset['type']
export const a2a: { [key in AssetType]: ZodType<Extract<proto.Asset, { type: key }>> } = {
    image: proto.Image,
    video: proto.Video,
    post: proto.Post,
    article: proto.Article
}

export type A2A = { [K in AssetType]: (asset: Extract<yml.Asset, { type: K }>) => Promise<z.infer<typeof a2a[K]>> }