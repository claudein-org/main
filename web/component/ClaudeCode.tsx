import { width } from "@/css/layout.css"
import { cx } from "@/styled-system/css"
import Terminal from "./Terminal"

interface Props { }
export default function ClaudeCode({ }: Props) {
    return <div className={cx(width[400])}>
        <Terminal>
            <img src="/claudecode-color.svg" alt="" />
            {/* TODO: style like a claude code terminal */}
        </Terminal>
    </div>
}