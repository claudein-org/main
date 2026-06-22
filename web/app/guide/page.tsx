import { align, col, gap, row, textAlign } from "@/css/layout.css"
import { } from "@/css/style.css"
import { cx } from "@/styled-system/css"

const steps = [
    {
        label: "install",
        body: <>run <code>npm install -g @claudein/cli</code> to get the cli tool.</>,
    },
    {
        label: "connect",
        body: <>run <code>claudein start</code> — it opens your browser so you can sign in with Google and connect your LinkedIn account.</>,
    },
    {
        label: "post",
        body: <>tell Claude Code what to post: <code>post this to linkedin</code>. done.</>,
    },
]

export default async function page() {
    return <main>
        <div className={cx(col, align.center, gap.sm, textAlign.center)}>
            <h1 className={cx()}>how to use <span className={cx()}>claude</span><span className={cx()}>in</span></h1>
            <p className={cx()}>three steps to post to linkedin from claude code.</p>
        </div>

        <div className={cx()}>
            {steps.map(({ label, body }, i) => (
                <div key={label} className={cx(row, gap.md, align.center)}>
                    <span className={cx()}> {i + 1}</span>
                    <div className={cx(col, gap.xs)}>
                        <span className={cx()}> {label}</span>
                        <p className={cx()}> {body}</p>
                    </div>
                </div>
            ))}
        </div>

        <footer>
            <a href="/privacy.txt">privacy</a>
        </footer>
    </main>
}
