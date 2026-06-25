'use client'

import { Player } from '@remotion/player'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { cx } from '@/styled-system/css'
import {
    terminalComment,
    terminalIndent,
    terminalPrompt,
    terminalSuccess,
    terminalTool,
} from '@/css/style.css'
import ClaudeCode from './ClaudeCode'
import LinkedInPost from './LinkedInPost'

const FPS = 30
const DURATION = 620

// ─── Timing keyframes (absolute frames at 30fps) ─────────────────────────────
const S1_IN:      [number, number] = [0, 25]
const S1_CMD1:    [number, number] = [25, 55]      // "/claudein" types
const S1_RESP1:   [number, number] = [70, 115]     // "What do you want me to write?"
const S1_CMD2:    [number, number] = [130, 220]    // long user message
const S1_TOOL:    [number, number] = [235, 265]    // tool call appears
const S1_SUCCESS = 280                             // success line
const S1_CURSOR  = 300                             // final blinking cursor
const S1_OUT:     [number, number] = [355, 405]    // fade out

const S2_IN:       [number, number] = [375, 420]   // fade in
const S2_COUNTERS: [number, number] = [435, 555]   // likes/comments/reposts
const S2_OUT:      [number, number] = [575, 620]   // fade out

const USER_MSG =
    'Write a viral post and also add a short animated ClaudeIn logo, do your best, make no mistakes.'

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

// ─── Blinking block cursor ────────────────────────────────────────────────────
function Cursor({ from }: { from: number }) {
    const frame = useCurrentFrame()
    if (frame < from) return null
    const on = Math.floor((frame - from) / 15) % 2 === 0
    return (
        <span className={terminalComment} style={{ opacity: on ? 1 : 0 }}>▌</span>
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
    const scale = interpolate(frame, [S1_IN[0], S1_OUT[0]], [0.97, 1.03], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
    })

    return (
        <AbsoluteFill
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                opacity,
            }}
        >
            <div style={{ transform: `scale(${scale})`, width: '100%', maxWidth: '760px' }}>
                <ClaudeCode>
                    {frame >= S1_CMD1[0] && (
                        <p>
                            <span className={terminalPrompt}>&gt;</span>{' '}
                            <Typed text="/claudein" from={S1_CMD1[0]} to={S1_CMD1[1]} />
                            {frame < S1_RESP1[0] && <Cursor from={S1_CMD1[1]} />}
                        </p>
                    )}

                    {frame >= S1_RESP1[0] && (
                        <p className={terminalIndent}>
                            <Typed
                                text="What do you want me to write?"
                                from={S1_RESP1[0]}
                                to={S1_RESP1[1]}
                            />
                        </p>
                    )}

                    {frame >= S1_CMD2[0] && (
                        <p>
                            <span className={terminalPrompt}>&gt;</span>{' '}
                            <Typed text={USER_MSG} from={S1_CMD2[0]} to={S1_CMD2[1]} />
                            {frame < S1_TOOL[0] && <Cursor from={S1_CMD2[1]} />}
                        </p>
                    )}

                    {frame >= S1_TOOL[0] && (
                        <>
                            <p className={terminalIndent}>
                                <Typed
                                    text="On it! Creating your viral post with the ClaudeIn logo animation..."
                                    from={S1_TOOL[0]}
                                    to={S1_TOOL[0] + 18}
                                />
                            </p>
                            <p>
                                <span className={terminalTool}>●</span>{' '}
                                <Typed
                                    text="Bash(claudein write --viral --with-animation)"
                                    from={S1_TOOL[0] + 8}
                                    to={S1_TOOL[1]}
                                />
                            </p>
                        </>
                    )}

                    {frame >= S1_SUCCESS && (
                        <p className={cx(terminalIndent, terminalSuccess)}>
                            ✓ Published · 🚀 ClaudeIn logo animation added
                        </p>
                    )}

                    {frame >= S1_CURSOR && (
                        <p>
                            <span className={terminalPrompt}>&gt;</span>{' '}
                            <Cursor from={S1_CURSOR} />
                        </p>
                    )}
                </ClaudeCode>
            </div>
        </AbsoluteFill>
    )
}

// ─── LinkedIn post content ────────────────────────────────────────────────────
function PostContent() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p>I just published a LinkedIn post without opening my browser. 🤯</p>
            <p>
                All I did was ask Claude Code to write a viral post. It used the{' '}
                <strong>/claudein</strong> skill — drafted the content, added the
                animated ClaudeIn logo, and published in seconds.
            </p>
            <p>
                ✍️ Drafted the post<br />
                🎨 Created the logo animation<br />
                📤 Published to LinkedIn
            </p>
            <p>
                This is <strong>ClaudeIn</strong>.
            </p>
            <p>
                → <code>npm install -g @claudein.org/cli</code><br />
                → Connect once at claudein.org
            </p>
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
        <AbsoluteFill
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                opacity,
                transform: `translateY(${translateY}px)`,
            }}
        >
            <LinkedInPost likes={likes} comments={comments} reposts={reposts}>
                <PostContent />
            </LinkedInPost>
        </AbsoluteFill>
    )
}

// ─── Root Remotion composition ────────────────────────────────────────────────
function DemoComposition() {
    return (
        <AbsoluteFill style={{ background: '#F3F2EF' }}>
            <Scene1 />
            <Scene2 />
        </AbsoluteFill>
    )
}

// ─── Exported component ───────────────────────────────────────────────────────
interface Props { }
export default function Demo({ }: Props) {
    return (
        <Player
            component={DemoComposition}
            durationInFrames={DURATION}
            compositionWidth={960}
            compositionHeight={580}
            fps={FPS}
            style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}
            autoPlay
            loop
        />
    )
}
