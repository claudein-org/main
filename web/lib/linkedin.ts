import ky from 'ky'
import z from 'zod'
import { db } from './db'
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
export namespace linkedin {
    const BASE = 'https://api.linkedin.com/v2'
    const POST = `${BASE}/ugcPosts`
    const REGISTER = `${BASE}/assets?action=registerUpload`

    function headers(access_token: string) {
        return {
            Authorization: `Bearer ${access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
        }
    }

    function urnPerson(urn: string) {
        return `urn:li:person:${urn}`
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

    interface ShareContent {
        shareCommentary: Text,
        shareMediaCategory: 'NONE' | 'IMAGE' | 'ARTICLE'
        media: ShareMedia[]
    }

    async function share(access_token: string, body: Share) {
        const res = await ky.post(POST, {
            headers: headers(access_token),
            json: body
        })

        const urn = res.headers.get('X-RestLi-Id')
        return { urn }
    }

    // UPLOAD IMAGE
    interface RegisterImage {
        registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: string,
            serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
            }]
        }
    }

    const RegisterResponse = z.object({
        value: z.object({
            asset: z.string(),
        })
    })

    async function registerImage(access_token: string, body: RegisterImage) {
        const res = await ky.post(REGISTER, {
            headers: headers(access_token),
            json: body
        })

        return RegisterResponse.parse(await res.json())
    }

    interface ShareMedia {
        status: 'READY',
        description?: Text,
        media?: string,
        originalUrl?: string,
        title?: Text,
    }



    function mimeType(src: string) {
        const ext = src.split('.').pop()?.toLowerCase()
        return ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    }

    export async function main() {
        const { access_token, author_urn } = await db
            .selectFrom('linkedin')
            .select(['access_token', 'author_urn'])
            .where('user_id', '=', 1)
            .executeTakeFirstOrThrow()

        // REGISTER IMAGE
        const res = await registerImage(access_token, {
            registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: urnPerson(author_urn),
                serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                }]
            }
        })

        console.log('Register image response:', res)
        // SHARE POST
        // const urn = await share(access_token, {
        //     author: urnPerson(author_urn),
        //     lifecycleState: 'PUBLISHED',
        //     specificContent: {
        //         'com.linkedin.ugc.ShareContent': {
        //             shareCommentary: { text: 'Hello, LinkedIn!' },
        //             shareMediaCategory: 'NONE',
        //             media: [],
        //         }
        //     },
        //     visibility: {
        //         'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        //     }
        // })

        // console.log('LinkedIn post created with URN:', urn.urn)
    }
}


if (import.meta.main) {
    await linkedin.main().catch(err => {
        console.dir(err, { depth: null })
    })
    process.exit(0)
}