export namespace auth {
    const PROD = process.env.NODE_ENV === 'production'
    const DOMAIN = PROD ? 'claudein.org' : 'localhost:3000'

    export function getRedirectUri(provider: 'google' | 'linkedin' | 'facebook' | 'instagram') {
        return `https://${DOMAIN}/auth/${provider}/`
    }
}