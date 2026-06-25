import { Easing, interpolate, useCurrentFrame } from 'remotion'
import ClaudeCode from './ClaudeCode'
import { ClaudeInTextAnimation } from './ClaudeInTextAnimation'
import LinkedInPost from './LinkedInPost'

const Fill = ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, ...style }}>{children}</div>
)

const FPS = 30

// ─── Timing keyframes (absolute frames at 30fps) ─────────────────────────────
const S1_IN: [number, number] = [0, 25]
const S1_CMD1: [number, number] = [25, 55]
const S1_RESP1: [number, number] = [70, 115]
const S1_CMD2: [number, number] = [130, 210]
const S1_THINKING: [number, number] = [215, 295]
const S1_TOOL: [number, number] = [295, 325]
const S1_SUCCESS = 340
const S1_CURSOR = 355
const S1_OUT: [number, number] = [375, 420]

const S2_IN: [number, number] = [395, 435]
const S2_COUNTERS: [number, number] = [450, 565]
const S2_OUT: [number, number] = [580, 620]

// ─── Typed text – reveals characters over [from, to] frames ──────────────────
function Typed({ text, from, to }: { text: string; from: number; to: number }) {
    const frame = useCurrentFrame()
    if (frame < from) return null
    const n = Math.floor(
        interpolate(frame, [from, to], [0, text.length], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
        })
    )
    return <>{text.slice(0, n)}</>
}

// ─── Claude Code thinking indicator (amber text, blue left border) ────────────
const THINKING_SYMBOLS = ['+', '✦', '✧', '⊹', '◆', '✺', '⋆']
const THINKING_MESSAGES = [
    'thinking with high effort',
    'thinking more with high effort',
    'still thinking with high effort',
]

function Thinking({ from, to, startSeconds = 20 }: { from: number; to: number; startSeconds?: number }) {
    const frame = useCurrentFrame()
    if (frame < from || frame >= to) return null
    const elapsed = startSeconds + Math.floor((frame - from) / FPS)
    const symbol = THINKING_SYMBOLS[Math.floor((frame - from) / 5) % THINKING_SYMBOLS.length]
    const msgIdx = Math.min(Math.floor((frame - from) / 35), THINKING_MESSAGES.length - 1)
    return (
        <div style={{ paddingLeft: '0.75rem', color: '#DAAA3F' }}>
            {symbol} Actioning… ({elapsed}s · {THINKING_MESSAGES[msgIdx]})
        </div>
    )
}

// ─── Blinking block cursor ────────────────────────────────────────────────────
function Cursor({ from }: { from: number }) {
    const frame = useCurrentFrame()
    if (frame < from) return null
    const on = Math.floor((frame - from) / 15) % 2 === 0
    return (
        <span style={{ color: '#768390', opacity: on ? 1 : 0 }}>▌</span>
    )
}

// ─── Scene 1: ClaudeCode chat animation ──────────────────────────────────────
function Scene1() {
    const frame = useCurrentFrame()
    const opacity = interpolate(
        frame,
        [...S1_IN, ...S1_OUT],
        [0, 1, 1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    )
    const input = <span style={{ color: '#d97757' }}>&gt; </span>
    const output = <span style={{ color: '#ffffff' }}>● </span>
    return (
        <Fill style={{ opacity }}>
            <ClaudeCode>
                {frame >= S1_CMD1[0] && (
                    <div>
                        {input}
                        <Typed text="/claudein" from={S1_CMD1[0]} to={S1_CMD1[1]} />
                        {frame < S1_RESP1[0] && <Cursor from={S1_CMD1[1]} />}
                    </div>
                )}

                {frame >= S1_RESP1[0] && (
                    <div>
                        {output}
                        <Typed
                            text="What do you want me to write?"
                            from={S1_RESP1[0]}
                            to={S1_RESP1[1]}
                        />
                    </div>
                )}

                {frame >= S1_CMD2[0] && (
                    <div>
                        {input}
                        <Typed text={'Write a viral post and also add a short animated ClaudeIn logo, do your best, make no mistakes.'} from={S1_CMD2[0]} to={S1_CMD2[1]} />
                        {frame >= S1_CMD2[1] && frame < S1_THINKING[0] && <Cursor from={S1_CMD2[1]} />}
                    </div>
                )}

                <Thinking from={S1_THINKING[0]} to={S1_THINKING[1]} />

                {frame >= S1_TOOL[0] && (
                    <>
                        <p style={{ paddingLeft: '1.5rem' }}>
                            <Typed
                                text="On it! Creating your viral post with the ClaudeIn logo animation..."
                                from={S1_TOOL[0]}
                                to={S1_TOOL[0] + 18}
                            />
                        </p>
                        <p>
                            <span style={{ color: '#6CB6FF' }}>●</span>{' '}
                            <Typed
                                text="Bash(claudein write --viral --with-animation)"
                                from={S1_TOOL[0] + 8}
                                to={S1_TOOL[1]}
                            />
                        </p>
                    </>
                )}

                {frame >= S1_SUCCESS && (
                    <p style={{ paddingLeft: '1.5rem', color: '#57AB5A' }}>
                        ✓ Published · 🚀 ClaudeIn logo animation added
                    </p>
                )}

                {frame >= S1_CURSOR && (
                    <p>
                        <span style={{ color: '#d97757' }}>&gt;</span>{' '}
                        <Cursor from={S1_CURSOR} />
                    </p>
                )}
            </ClaudeCode>
        </Fill>
    )
}

// ─── LinkedIn post content ────────────────────────────────────────────────────
function PostContent() {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p>I just published a LinkedIn post with ClaudeIn. 🤯</p>
            <div style={{ width: '100%', aspectRatio: '4/5' }}>
                <ClaudeInTextAnimation />
            </div>
            <p style={{ color: '#0a66c2' }}>
                #ClaudeCode #AI #LinkedIn #Productivity
            </p>
        </div>
    )
}

// ─── Scene 2: LinkedIn post with animated engagement counters ─────────────────
function Scene2() {
    const frame = useCurrentFrame()
    const opacity = interpolate(
        frame,
        [...S2_IN, ...S2_OUT],
        [0, 1, 1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    )
    const translateY = interpolate(frame, S2_IN, [20, 0], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
        easing: Easing.out(Easing.cubic),
    })
    const easing = Easing.out(Easing.cubic)
    const likes = Math.floor(
        interpolate(frame, S2_COUNTERS, [0, 847], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
            easing,
        })
    )
    const comments = Math.floor(
        interpolate(frame, S2_COUNTERS, [0, 124], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
            easing,
        })
    )
    const reposts = Math.floor(
        interpolate(frame, S2_COUNTERS, [0, 58], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
            easing,
        })
    )

    return (
        <Fill style={{ opacity, transform: `translateY(${translateY}px)` }}>
            <LinkedInPost likes={likes} comments={comments} reposts={reposts}>
                {/* <PostContent /> */}
            </LinkedInPost>
        </Fill>
    )
}

// ─── Root Remotion composition ────────────────────────────────────────────────
export function DemoComposition() {
    return (
        <Fill style={{ background: '#F3F2EF', fontSize: 32 }}>
            <Scene1 />
            <Scene2 />
        </Fill>
    )
}
