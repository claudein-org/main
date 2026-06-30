import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@/lib/env'
import { SPACE_ACCESS_KEY } from '@/lib/settings'

const BUCKET = 'claudein'
const REGION = 'nyc3'
const ENDPOINT = `https://${REGION}.digitaloceanspaces.com`

function client() {
    return new S3Client({
        region: REGION,
        endpoint: ENDPOINT,
        credentials: {
            accessKeyId: SPACE_ACCESS_KEY,
            secretAccessKey: env.SPACE_SECRET_KEY,
        },
        forcePathStyle: false,
    })
}

export async function storeMedia(id: string, base64: string, contentType: string): Promise<string> {
    const body = Buffer.from(base64, 'base64')
    await client().send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: id,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
    }))
    return `https://${BUCKET}.${REGION}.cdn.digitaloceanspaces.com/${id}`
}

export async function deleteMedia(id: string): Promise<void> {
    try {
        await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: id }))
    } catch {}
}
