import { proto } from '@claudein.org/common'
import ky from 'ky'
import { db } from './db'
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
export namespace linkedin {
    const BASE = 'https://api.linkedin.com/v2'
    const POST = `${BASE}/ugcPosts`

    function headers(access_token: string) {
        return {
            Authorization: `Bearer ${access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
        }
    }

    interface Text {
        text: string
    }

    interface Share {
        author: string,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': ShareContent
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    }


    async function share(access_token: string, body: Share) {
        const res = await ky.post(POST, {
            headers: headers(access_token),
            json: body
        })

        const urn = res.headers.get('X-RestLi-Id')
        return { urn }
    }

    interface ShareContent {
        shareCommentary: Text,
        shareMediaCategory: 'NONE' | 'IMAGE' | 'ARTICLE'
        media: ShareMedia[]
    }

    interface ShareMedia {
        status: 'READY',
        description?: Text,
        media?: string,
        originalUrl?: string,
        title?: Text,
    }


    interface UploadImage {
        access_token: string,
        authorUrn: string,
        image: Blob,
    }


    async function uploadImage({ access_token, authorUrn, image }: UploadImage) {
        const { value } = await ky
            .post(`${BASE}/rest/images?action=initializeUpload`, {
                headers: restHeaders(access_token),
                json: { initializeUploadRequest: { owner: authorUrn } },
                hooks: {
                    beforeError: [async e => {
                        const body = await e.response.text().catch(() => '')
                        console.error('LinkedIn initializeUpload error body:', body)
                        return e
                    }]
                },
            })
            .json<{ value: { uploadUrl: string; image: string } }>()

        await ky.put(value.uploadUrl, {
            headers: { 'Content-Type': image.type },
            body: image,
        })

        return value.image
    }

    interface Publish {
        access_token: string,
        authorUrn: string,
        text: string,
        imageUrn?: string,
    }

    async function publish({ access_token, authorUrn, text, imageUrn }: Publish) {
        const body: Record<string, unknown> = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            visibility: 'PUBLIC',
            commentary: text,
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
        }

        if (imageUrn) {
            body.content = { media: { id: imageUrn } }
        }

        const response = await ky.post(`${BASE}/rest/posts`, {
            headers: restHeaders(access_token),
            json: body,
        })
        const urn = response.headers.get('x-restli-id')
        return urn ? `https://www.linkedin.com/feed/update/${urn}/` : undefined
    }

    interface Post {
        access_token: string,
        author_urn: string,
        post: proto.Post
    }

    function mimeType(src: string) {
        const ext = src.split('.').pop()?.toLowerCase()
        return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    }

    export async function post({ access_token, author_urn, post }: Post) {
        const imageUrn = post.image ? await uploadImage({ access_token, authorUrn: author_urn, image: new Blob([Buffer.from(post.image.base64, 'base64')], { type: mimeType(post.image.src) }) }) : undefined
        return await publish({ access_token, authorUrn: author_urn, text: post.text ?? '', imageUrn })
    }

    export async function main() {
        const { access_token, author_urn } = await db
            .selectFrom('linkedin')
            .select(['access_token', 'author_urn'])
            .where('user_id', '=', 1)
            .executeTakeFirstOrThrow()

        const urn = await share(access_token, {
            author: `urn:li:person:${author_urn}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: 'Hello, LinkedIn!' },
                    shareMediaCategory: 'NONE',
                    media: [],
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        })

        console.log('LinkedIn post created with URN:', urn.urn)
    }
}


if (import.meta.main) {
    await linkedin.main().catch(err => {
        console.dir(err, { depth: null })
    })
    process.exit(0)
}