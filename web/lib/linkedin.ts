import ky from 'ky'

export namespace linkedin {
    const BASE = 'https://api.linkedin.com'
    const VERSION = '202501'

    const restHeaders = (accessToken: string) => ({
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
    })

    export async function getAuthorUrn(accessToken: string): Promise<string> {
        const { sub } = await ky
            .get(`${BASE}/v2/userinfo`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            .json<{ sub: string }>()
        return sub
    }

    interface UploadImage {
        accessToken: string,
        authorUrn: string,
        image: Blob,
    }

    export async function uploadImage({ accessToken, authorUrn, image }: UploadImage) {
        const { value } = await ky
            .post(`${BASE}/rest/images?action=initializeUpload`, {
                headers: restHeaders(accessToken),
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
        accessToken: string,
        authorUrn: string,
        text: string,
        imageUrn?: string,
    }

    export async function publish({ accessToken, authorUrn, text, imageUrn }: Publish) {
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

        await ky.post(`${BASE}/rest/posts`, {
            headers: restHeaders(accessToken),
            json: body,
        })
    }
}
