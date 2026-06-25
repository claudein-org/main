import { align, col, gap, row, width } from "@/css/layout.css"
import { muted } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Terminal from "./Terminal"

interface Props { }
export default function ClaudeCode({ }: Props) {
    return <div className={cx(width[900])}>
        <Terminal>
            <div className={cx(row, gap.sm, align.center)}>
                <img style={{
                    width: "128px",
                }}
                    src="/claudecode-color.svg" alt=""
                />
                <div className={cx(col)}>
                    <p
                        style={{
                            fontSize: "1.1em",
                            fontWeight: "bold",
                        }}
                        className={cx()}>Claude Code <span className={cx(muted)}>v3.14</span></p>
                    <p>Sonnet 6.7 with high effort · Claude Pro</p>
                    <p>~/ClaudeIn.org</p>
                </div>
            </div>
            {/* TODO: style like a claude code terminal */}
        </Terminal>
    </div>
}