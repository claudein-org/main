import { proto } from '@claudein.org/common'
import ky from 'ky'
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
export namespace linkedin {
    const BASE = 'https://api.linkedin.com'
    const VERSION = '202501'

    const restHeaders = (access_token: string) => ({
        Authorization: `Bearer ${access_token}`,
        'LinkedIn-Version': VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
    })

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

    export async function post({ access_token, author_urn, post }: Post) {
        const imageUrn = post.image ? await uploadImage({ access_token, authorUrn: author_urn, image: new Blob([Buffer.from(post.image.base64, 'base64')], { type: 'image/*' }) }) : undefined
        return await publish({ access_token, authorUrn: author_urn, text: post.text ?? '', imageUrn })
    }
}
