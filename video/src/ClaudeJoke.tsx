import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import z from "zod"
import ClaudeCode from "./ClaudeCode"
/*
1. Type faster.
2. Add laugh.mp3 when Claude starts laughing.
3. Fix Claude eyes when it laughs, they should be more visible (maybe like >.<)
4. Use the funky.mp3 bg music as the background music for the video.
*/

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
    const n = Math.floor(
        interpolate(frame, [from, to], [0, text.length], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
        })
    )
    const typing = frame >= from && frame < to
    const caretOn = Math.floor(frame / 15) % 2 === 0
    return (
        <>
            {text.slice(0, n)}
            <span style={{ visibility: typing && caretOn ? 'visible' : 'hidden' }}>▋</span>
            <span style={{ visibility: 'hidden' }}>{text.slice(n)}</span>
        </>
    )
}

function Thinking({ from, to }: { from: number; to: number }) {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const active = frame >= from && frame < to
    const done = frame >= to
    const effectiveFrame = Math.max(from, Math.min(frame, to - 1))
    const elapsed = 42 + Math.floor((effectiveFrame - from) / fps)
    const symbol = THINKING_SYMBOLS[Math.floor((effectiveFrame - from) / 5) % THINKING_SYMBOLS.length]
    const msgIdx = Math.min(Math.floor((effectiveFrame - from) / 45), THINKING_MESSAGES.length - 1)
    return (
        <div style={{ color: '#DAAA3F', fontSize: '2.5cqw', whiteSpace: 'nowrap', visibility: frame >= from ? 'visible' : 'hidden', display: 'flex', gap: '1cqw', alignItems: 'center' }}>
            <div style={{ width: '1.5cqw', textAlign: 'center', height: '1.1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{active ? symbol : '✓'}</div>
            <div>Thinking… ({elapsed}s · {THINKING_MESSAGES[msgIdx]})</div>
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
