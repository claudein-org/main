import { btn } from "@/css/style.css"
import { app } from "@/lib/app"
import { cx } from "@/styled-system/css"

interface Props { }
export default function LoginButton({ }: Props) {
    return <a className={cx(btn({ color: "claude" }))} target="_blank" href={app.google}>Sign in with Google</a>
}