import { config } from "dotenv"
import z from "zod"

const Env = z.object({
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),

    DB_USER: z.string(),
    DB_PASS: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_NAME: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    COOKIE_SECRET: z.string(),
})

function load() {
    try {
        return Env.parse(process.env)
    } catch {
        config()
        return Env.parse(process.env)
    }
}

export const env = load()