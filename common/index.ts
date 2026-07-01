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

export interface Folder {
    type: 'folder'
    name: string
    description: string
    children?: Array<Folder | File>
}

export interface File {
    type: 'file'
    name: string
    description: string
}

export type FSNode = Folder | File
export const claudein = {
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
} as const satisfies Folder

type Join<Prefix extends string, Name extends string> =
    Prefix extends '' ? Name : `${Prefix}/${Name}`

type PathsOf<T extends FSNode, Prefix extends string = ''> =
    T extends { name: infer N extends string }
    ? T extends { type: 'file' }
    ? Join<Prefix, N>
    : T extends { type: 'folder'; children?: infer C }
    ? C extends readonly FSNode[]
    ? Join<Prefix, N> | PathsFromChildren<C, Join<Prefix, N>>
    : Join<Prefix, N>
    : never
    : never

type PathsFromChildren<T extends readonly FSNode[], Prefix extends string> =
    T extends readonly [infer Head extends FSNode, ...infer Tail extends FSNode[]]
    ? PathsOf<Head, Prefix> | PathsFromChildren<Tail, Prefix>
    : never

type Path = PathsOf<typeof claudein>

export const FS = {
    root: 'claudein',
    claudein_yml: 'claudein/claudein.yml',
    articles: 'claudein/articles',
    media: 'claudein/media',
} as const satisfies Record<string, Path>


export type WithPath = (File | Folder) & { path: string[] }

// Flatten f and all its descendants into a list of entries, each annotated
// with its path (as name segments) from root down to that entry.
export function tree(f: Folder, root: string[] = []): WithPath[] {
    const path = [...root, f.name]
    const children = (f.children ?? []).flatMap<WithPath>(child =>
        child.type === 'folder'
            ? tree(child, path)
            : [{ ...child, path: [...path, child.name] }]
    )
    return [{ ...f, path }, ...children]
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

    export type YML = z.infer<typeof YML>
    export const YML = z.object({
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

    // The full brand bundle streamed to the web app over the websocket.
    export type Bundle = z.infer<typeof Bundle>
    export const Bundle = z.object({
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