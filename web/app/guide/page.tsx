import { align, col, gap, pageCentered, row, textAlign, w } from "@/css/layout.css"
import { color, font, muted, stepNum, tracking } from "@/css/style.css"
import { cx } from "@/styled-system/css"

const steps = [
    {
        label: "install",
        body: <>run <code>npm install -g @claudein/cli</code> to get the cli tool.</>,
    },
    {
        label: "connect",
        body: <>run <code>cin start posts.yml</code> — it opens your browser so you can sign in with Google and connect your LinkedIn account.</>,
    },
    {
        label: "post",
        body: <>tell Claude Code what to post: <code>post this to linkedin</code>. done.</>,
    },
]

export default async function page() {
    return <main>
        <div className={pageCentered}>
            <div className={cx(col, align.center, gap.sm, textAlign.center, w.content)}>
                <h1 className={cx(font.size.hero, font.weight.bold, tracking.tight)}>
                    how to use <span className={cx(color.claude)}>claude</span><span className={cx(color.linkedin)}>in</span>
                </h1>
                <p className={cx(muted)}>three steps to post to linkedin from claude code.</p>
            </div>

            <div className={cx(col, gap.lg, w.content)}>
                {steps.map(({ label, body }, i) => (
                    <div key={label} className={cx(row, gap.md, align.center)}>
                        <div className={stepNum}>{i + 1}</div>
                        <div className={cx(col, gap.xs)}>
                            <span className={cx(font.weight.bold, font.size.lg)}>{label}</span>
                            <p className={cx(muted)}>{body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <footer>
            <a href="/privacy.txt">privacy</a>
        </footer>
    </main>
}
