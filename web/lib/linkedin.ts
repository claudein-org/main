import { proto } from '@claudein.org/common'
import ky from 'ky'
import z from 'zod'
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

    interface ShareMedia {
        status: 'READY',
        description?: Text,
        media?: string,
        originalUrl?: string,
        title?: Text,
    }

    interface ShareContent {
        shareCommentary: Text,
        shareMediaCategory: 'NONE' | 'IMAGE' | 'ARTICLE' | 'VIDEO',
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

    type Recipe = 'urn:li:digitalmediaRecipe:feedshare-image' | 'urn:li:digitalmediaRecipe:feedshare-video'
    interface RegisterBinary {
        registerUploadRequest: {
            recipes: [Recipe],
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


    interface Author {
        access_token: string,
        author_urn: string
    }

    export async function post({ access_token, author_urn }: Author, asset: proto.Asset) {
        const postHandler: { [key in proto.Asset['type']]: (args: Extract<proto.Asset, { type: key }>) => ReturnType<typeof share> } = {
            async post({ text }) {
                return await share(access_token, {
                    author: urnPerson(author_urn),
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: { text },
                            shareMediaCategory: 'NONE',
                            media: [],
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                })
            },

            // LinkedIn's UGC API has no native article type, so we share the
            // rendered markdown as the post's commentary text.
            async article({ markdown }) {
                return await share(access_token, {
                    author: urnPerson(author_urn),
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: { text: markdown },
                            shareMediaCategory: 'NONE',
                            media: [],
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                })
            },

            async image({ base64, title, description }) {
                const { asset } = await uploadBinary(access_token, {
                    registerUploadRequest: {
                        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                        owner: urnPerson(author_urn),
                        serviceRelationships: [{
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent'
                        }]
                    }
                }, new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))]))

                return await share(access_token, {
                    author: urnPerson(author_urn),
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: { text: description ?? '' },
                            shareMediaCategory: 'IMAGE',
                            media: [{
                                status: 'READY',
                                description: description ? { text: description } : undefined,
                                media: asset,
                                title: title ? { text: title } : undefined,
                            }],
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                })
            },

            async video({ base64, title, description }) {
                const { asset } = await uploadBinary(access_token, {
                    registerUploadRequest: {
                        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
                        owner: urnPerson(author_urn),
                        serviceRelationships: [{
                            relationshipType: 'OWNER',
                            identifier: 'urn:li:userGeneratedContent'
                        }]
                    }
                }, new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))]))

                return await share(access_token, {
                    author: urnPerson(author_urn),
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        'com.linkedin.ugc.ShareContent': {
                            shareCommentary: { text: description ?? '' },
                            shareMediaCategory: 'VIDEO',
                            media: [{
                                status: 'READY',
                                description: description ? { text: description } : undefined,
                                media: asset,
                                title: title ? { text: title } : undefined,
                            }],
                        }
                    },
                    visibility: {
                        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                    }
                })
            }
        }

        function handle<T extends proto.Asset['type']>(asset: Extract<proto.Asset, { type: T }>) {
            return postHandler[asset.type]!(asset)
        }

        return await handle(asset)
    }
}


