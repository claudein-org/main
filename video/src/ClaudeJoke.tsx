import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import z from "zod"
import ClaudeCode from "./ClaudeCode"

// Timing (frames at 30fps, total 600 = 20s)
const Q_TYPE: [number, number] = [30, 120]
const THINK: [number, number] = [150, 370]
const A_TYPE: [number, number] = [390, 470]
const LAUGH_START = 490

const THINKING_SYMBOLS = ['+', '✦', '✧', '⊹', '◆', '✺', '⋆']
const THINKING_MESSAGES = [
    'thinking with high effort',
    'thinking more with high effort',
    'still thinking with high effort',
    'thinking even harder with high effort',
]

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

function Thinking({ from, to }: { from: number; to: number }) {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const active = frame >= from && frame < to
    const done = frame >= to
    const effectiveFrame = done ? to - 1 : frame
    const elapsed = 42 + Math.floor((effectiveFrame - from) / fps)
    const symbol = THINKING_SYMBOLS[Math.floor((effectiveFrame - from) / 5) % THINKING_SYMBOLS.length]
    const msgIdx = Math.min(Math.floor((effectiveFrame - from) / 45), THINKING_MESSAGES.length - 1)
    return (
        <div style={{ color: '#DAAA3F', fontSize: '2.5cqw' }}>
            <div style={{ visibility: frame >= from ? 'visible' : 'hidden' }}>
                <span style={{ display: 'inline-block', width: '1.5cqw', textAlign: 'center' }}>
                    {active ? symbol : '✓'}
                </span>
                {' '}Thinking… ({elapsed}s · {THINKING_MESSAGES[msgIdx]})
            </div>
            <div style={{ visibility: done ? 'visible' : 'hidden' }}>
                {'  '}Thought for {elapsed}s
            </div>
        </div>
    )
}

type Props = z.infer<typeof Props>
export const Props = z.object({
    q: z.string(),
    a: z.string(),
})

export function ClaudeJoke({ q, a }: Props) {
    const frame = useCurrentFrame()

    const laughing = frame >= LAUGH_START

    const easing = Easing.out(Easing.cubic)

    const ctx = Math.min(
        99,
        Math.floor(interpolate(frame, THINK, [0, 99], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }))
    )
    const tok = Math.floor(
        interpolate(frame, THINK, [0, 9871234], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })
    )
    const cost = Math.round(
        interpolate(frame, THINK, [0, 2847.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }) * 100
    ) / 100

    const input = <span style={{ color: '#d97757' }}>&gt; </span>
    const output = <span style={{ color: '#ffffff' }}>● </span>

    return (
        <AbsoluteFill>
            <ClaudeCode laughing={laughing} ctx={ctx} tok={tok} cost={cost}>
                <div style={{ whiteSpace: 'pre-wrap', visibility: frame >= Q_TYPE[0] ? 'visible' : 'hidden' }}>
                    {input}
                    <Typed text={q} from={Q_TYPE[0]} to={Q_TYPE[1]} />
                </div>
                <Thinking from={THINK[0]} to={THINK[1]} />
                <div style={{ visibility: frame >= A_TYPE[0] ? 'visible' : 'hidden' }}>
                    {output}
                    <Typed text={a} from={A_TYPE[0]} to={A_TYPE[1]} />
                </div>
            </ClaudeCode>
        </AbsoluteFill>
    )
}
