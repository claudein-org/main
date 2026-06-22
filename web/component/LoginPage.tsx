import { align, col, justify } from "@/css/layout.css"
import { cx } from "@/styled-system/css"
import LoginButton from "./LoginButton"
import Reload from "./Reload"

interface Props { }
export default function LoginPage({ }: Props) {
    return <main className={cx(col, align.center, justify.center)}>
        <Reload />
        <LoginButton />
    </main>
}