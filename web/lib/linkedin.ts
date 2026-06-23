import { readFile } from 'fs/promises'
import ky from 'ky'
import z from 'zod'
import { db } from './db'
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
export namespace linkedin {
    const BASE = 'https://api.linkedin.com/v2'
    const POST = `${BASE}/ugcPosts`
    const REGISTER = `${BASE}/assets?action=registerUpload`

    function headers(access_token: string, more: Record<string, string> = {}) {
        return {
            Authorization: `Bearer ${access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            ...more
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
    interface RegisterBinary {
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
            uploadMechanism: z.object({
                "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": z.object({
                    uploadUrl: z.string()
                })
            })
        })
    })

    async function uploadBinary(access_token: string, body: RegisterBinary, data: Blob) {

        const regRes = await ky.post(REGISTER, {
            headers: headers(access_token),
            json: body
        })

        const {
            value: {
                asset,
                uploadMechanism: {
                    "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
                        uploadUrl
                    } } } } = RegisterResponse.parse(await regRes.json())

        const res = await ky.put(uploadUrl, {
            headers: headers(access_token, {
                'Content-Type': 'application/octet-stream'
            }),
            body: data
        })

        console.log('Upload response status:', res.status)
        return {
            status: res.status,
            asset
        }
    }


    async function registerAndUpload() {

    }

    interface ShareMedia {
        status: 'READY',
        description?: Text,
        media?: string,
        originalUrl?: string,
        title?: Text,
    }



    export async function main() {
        const { access_token, author_urn } = await db
            .selectFrom('linkedin')
            .select(['access_token', 'author_urn'])
            .where('user_id', '=', 1)
            .executeTakeFirstOrThrow()

        // UPLOAD IMAGE
        const data = await readFile('test.jpg')
        const blob = new Blob([data], { type: 'image/*' })
        const res = await uploadBinary(access_token, {
            registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: urnPerson(author_urn),
                serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                }]
            }
        }, blob)

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