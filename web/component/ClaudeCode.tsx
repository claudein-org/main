import { align, col, gap, row, width } from "@/css/layout.css"
import { muted, terminalSep, terminalStatusBar } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import Terminal from "./Terminal"

interface Props {
    children?: React.ReactNode
}
export default function ClaudeCode({ children }: Props) {
    return <div className={cx(width[900])}>
        <Terminal>
            <div className={cx(row, gap.sm, align.center)}>
                <img style={{ width: "128px" }} src="/claudecode-color.svg" alt="" />
                <div className={cx(col)}>
                    <p style={{ fontSize: "1.1em", fontWeight: "bold" }}>
                        Claude Code <span className={cx(muted)}>v3.14</span>
                    </p>
                    <p>Sonnet 6.7 with high effort · Claude Pro</p>
                    <p>~/ClaudeIn.org</p>
                </div>
            </div>

            <div className={terminalSep} />
            {/*
                EXAMPLE USAGE:

                <p><span className={terminalPrompt}>&gt;</span> post to LinkedIn about ClaudeIn</p>

                <p className={terminalIndent}>I'll post to your LinkedIn now.</p>

                <div className={cx(col, gap.xs)}>
                    <p><span className={terminalTool}>●</span> Bash(claudein post my-post.yml)</p>
                    <p className={cx(terminalIndent, terminalSuccess)}>✓ Published · est. 2–3k impressions</p>
                </div>

                <p><span className={terminalPrompt}>&gt;</span> <span className={terminalComment}>▌</span></p>
            */}

            <div className={terminalStatusBar}>
                <span>Sonnet 6.7 · ctx 1% | tok 0.9k | $0.001</span>
                <span>claudein.org</span>
            </div>
        </Terminal>
    </div>
}
