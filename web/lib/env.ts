import z from "zod"

type Env = z.infer<typeof Env>
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

const DUMMY: Env = {
    CLIENT_ID: "",
    CLIENT_SECRET: "",
    DB_USER: "",
    DB_PASS: "",
    DB_HOST: "",
    DB_PORT: 0,
    DB_NAME: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    COOKIE_SECRET: ""
}

const BUILD = process.env.NEXT_PHASE === "phase-production-build"
export const env = BUILD
    ? DUMMY
    : Env.parse(process.env)