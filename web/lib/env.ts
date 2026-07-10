import z from "zod"

type Env = z.infer<typeof Env>
const Env = z.object({

    DB_USER: z.string().min(1),
    DB_PASS: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number(),
    DB_NAME: z.string().min(1),

    COOKIE_SECRET: z.string().min(1),
    LINKEDIN_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    META_CLIENT_SECRET: z.string().min(1),
    INSTAGRAM_CLIENT_SECRET: z.string().min(1),


    SPACE_SECRET_KEY: z.string().min(1),
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

    SPACE_SECRET_KEY: "",
}

const BUILD = process.env.NEXT_PHASE === "phase-production-build"
export const env = BUILD
    ? DUMMY
    : Env.parse(process.env)