import z from "zod"

type Env = z.infer<typeof Env>
const Env = z.object({

    DB_USER: z.string(),
    DB_PASS: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_NAME: z.string(),

    COOKIE_SECRET: z.string(),
    LINKEDIN_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    META_CLIENT_SECRET: z.string(),
    INSTAGRAM_CLIENT_SECRET: z.string(),
})

const DUMMY: Env = {
    DB_USER: "",
    DB_PASS: "",
    DB_HOST: "",
    DB_PORT: 0,
    DB_NAME: "",

    COOKIE_SECRET: "",
    LINKEDIN_CLIENT_SECRET: "",
    GOOGLE_CLIENT_SECRET: "",
    META_CLIENT_SECRET: "",
    INSTAGRAM_CLIENT_SECRET: "",
}

const BUILD = process.env.NEXT_PHASE === "phase-production-build"
export const env = BUILD
    ? DUMMY
    : Env.parse(process.env)