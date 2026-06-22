import { links } from "./links"

const DOMAIN = 'claudein.org'
export const app = {
    ...links,
}

export const https = (path: string) => `https://${DOMAIN}${path}`
