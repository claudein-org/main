import z from "zod"

const Env = z.object({
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    DB_PASS: z.string(),
})


export const env = Env.parse(process.env)