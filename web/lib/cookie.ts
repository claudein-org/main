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
                sameSite: "lax",
            })
        }
    }

    export async function get(): Promise<Partial<Cookies>> {
        const store = await cookies()
        return Object.fromEntries(
            Object.entries(parser).map(([k, parse]) => {
                const raw = store.get(k)?.value
                if (!raw) return [k, undefined]
                const unsigned = unsign(raw, env.COOKIE_SECRET)
                if (!unsigned) return [k, undefined]
                return [k, parse(unsigned)]
            }),
        )
    }
}