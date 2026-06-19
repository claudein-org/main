import { sign, unsign } from "cookie-signature"
import { cookies } from "next/headers"
import { env } from "./env"

interface Cookies {
    user_id: number
}

type Key = keyof Cookies

const parser: { [K in Key]: (value: string) => Cookies[K] } = {
    user_id: (val) => Number(val),
}

export namespace cook {
    export async function set(cs: Partial<Cookies>) {
        const store = await cookies()
        for (const [key, value] of Object.entries(cs)) {
            store.set(key, sign(String(value), env.COOKIE_SECRET), {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            })
        }
    }

    export async function get(key: Key): Promise<Cookies[Key] | undefined> {
        const store = await cookies()
        const value = store.get(key)?.value
        if (!value) return undefined
        const unsigned = unsign(value, env.COOKIE_SECRET)
        if (!unsigned) return undefined
        return parser[key](unsigned)
    }
}