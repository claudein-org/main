import { auth } from "./auth"
import { env } from "./env"
import { links } from "./links"

const DOMAIN = 'claudein.org'

const googleParams = new URLSearchParams({
    response_type: "code",
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('google'),
    scope: "openid email",
})

const linkedinParams = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    redirect_uri: auth.getRedirectUri('linkedin'),
    scope: "w_member_social",
})


export const app = {
    ...links,
    google: `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`,
    linkedin: `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams}`
}

export const https = (path: string) => `https://${DOMAIN}${path}`
