import { links } from "@claudein.org/common"
import { auth } from "./auth"
import { GOOGLE_CLIENT_ID, INSTAGRAM_APP_ID, LINKEDIN_CLIENT_ID, META_APP_ID } from "./settings"

const DOMAIN = 'claudein.org'

const googleParams = new URLSearchParams({
    response_type: "code",
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('google'),
    scope: "openid email",
})

const linkedinParams = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('linkedin'),
    scope: "openid profile w_member_social",
})

const facebookParams = new URLSearchParams({
    response_type: "code",
    client_id: META_APP_ID,
    redirect_uri: auth.getRedirectUri('facebook'),
    scope: "email,public_profile,pages_manage_posts,pages_show_list,pages_read_engagement",
})

const instagramParams = new URLSearchParams({
    response_type: "code",
    client_id: INSTAGRAM_APP_ID,
    redirect_uri: auth.getRedirectUri('instagram'),
    scope: "instagram_business_basic,instagram_business_content_publish",
})

const youtubeParams = new URLSearchParams({
    response_type: "code",
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: auth.getRedirectUri('youtube'),
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
})

export const app = {
    ...links,
    google: `https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`,
    linkedin: `https://www.linkedin.com/oauth/v2/authorization?${linkedinParams}`,
    facebook: `https://www.facebook.com/v21.0/dialog/oauth?${facebookParams}`,
    instagram: `https://www.instagram.com/oauth/authorize?${instagramParams}`,
    youtube: `https://accounts.google.com/o/oauth2/v2/auth?${youtubeParams}`,
}

export const https = (path: string) => `https://${DOMAIN}${path}`
