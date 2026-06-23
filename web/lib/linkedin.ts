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

    export async function uploadImage(
        accessToken: string,
        authorUrn: string,
        data: Buffer,
        mimeType: string,
    ): Promise<string> {
        const { value } = await ky
            .post(`${BASE}/rest/images?action=initializeUpload`, {
                headers: restHeaders(accessToken),
                json: { initializeUploadRequest: { owner: authorUrn } },
            })
            .json<{ value: { uploadUrl: string; image: string } }>()

        await ky.put(value.uploadUrl, {
            headers: { 'Content-Type': mimeType },
            body: data,
        })

        return value.image
    }

    export async function publish(
        accessToken: string,
        authorUrn: string,
        text: string,
        imageUrn?: string,
    ): Promise<void> {
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
