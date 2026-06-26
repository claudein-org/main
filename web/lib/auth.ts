export namespace auth {
    const PROD = process.env.NODE_ENV === 'production'
    const DOMAIN = PROD ? 'claudein.org' : (process.env.DEV_DOMAIN ?? 'localhost:3000')

    export function getRedirectUri(provider: 'google' | 'linkedin' | 'facebook' | 'instagram' | 'youtube') {
        return `https://${DOMAIN}/auth/${provider}/`
    }
}