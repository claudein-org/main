import { Easing, Html5Audio, interpolate, staticFile, useCurrentFrame } from 'remotion'
import ClaudeCode from './ClaudeCode'
import ClaudeInDashboard, { PointerCursor } from './ClaudeInDashboard'
import LinkedInPost from './LinkedInPost'
import { ClaudeInTextAnimation } from './ClaudeInTextAnimation'

const FPS = 30

// ─── Timing keyframes ─────────────────────────────────────────────────────────
// Scene 0: logo
const L_IN: [number, number] = [0, 25]
const L_OUT: [number, number] = [42, 65]

// Scene 1: Claude Code
const S1_IN: [number, number] = [55, 80]
const S1_CMD1: [number, number] = [80, 120]
const S1_RESP1: [number, number] = [138, 210]
const S1_CMD2: [number, number] = [245, 355]
const S1_THINKING: [number, number] = [370, 510]
const S1_TOOL: [number, number] = [510, 555]
const S1_SUCCESS = 572
const S1_CURSOR = 632
const S1_OUT: [number, number] = [660, 700]

// Scene 2: Dashboard
const S2_IN: [number, number] = [680, 720]
const S2_PAN: [number, number] = [730, 840]
const S2_SETTLE = 850
const S2_CLICK: [number, number] = [878, 908]
const S2_POSTED = 920
const S2_OUT: [number, number] = [950, 990]

// Scene 3: LinkedIn
const S3_IN: [number, number] = [970, 1005]
const S3_COUNTERS: [number, number] = [1025, 1175]
const S3_OUT: [number, number] = [1175, 1210]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lerp(frame: number, range: [number, number], output: [number, number], ease?: (t: number) => number) {
    return interpolate(frame, range, output, {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease,
    })
}

function Typed({ text, from, to }: { text: string; from: number; to: number }) {
    const frame = useCurrentFrame()
    if (frame < from) return null
    const n = Math.floor(lerp(frame, [from, to], [0, text.length]))
    return <>{text.slice(0, n)}</>
}

const THINKING_SYMBOLS = ['+', '✦', '✧', '⊹', '◆', '✺', '⋆']
const THINKING_MESSAGES = [
    'thinking with high effort',
    'thinking more with high effort',
    'still thinking with high effort',
]

function Thinking({ from, to, startSeconds = 18 }: { from: number; to: number; startSeconds?: number }) {
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

function Cursor({ from }: { from: number }) {
    const frame = useCurrentFrame()
    if (frame < from) return null
    const on = Math.floor((frame - from) / 15) % 2 === 0
    return <span style={{ color: '#768390', opacity: on ? 1 : 0 }}>▌</span>
}

const Fill = ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, ...style }}>{children}</div>
)

// ─── Scene 0: ClaudeIn logo fade ──────────────────────────────────────────────
const BG_PATH = 'M 13.11,2 L 2.885,2 A 0.88,0.88 0 0,0 2,2.866 l 0,10.268 a 0.88,0.88 0 0,0 0.885,0.866 l 10.226,0 a 0.882,0.882 0 0,0 0.889,-0.866 L 14,2.865 a 0.88,0.88 0 0,0 -0.889,-0.864 z'
const N_PATH = 'M 12.225,12.225 l -1.778,0 L 10.447,9.44 c 0,-0.664 -0.012,-1.519 -0.925,-1.519 c -0.926,0 -1.068,0.724 -1.068,1.47 l 0,2.834 L 6.676,12.225 L 6.676,6.498 l 1.707,0 l 0,0.783 l 0.024,0 c 0.348,-0.594 0.996,-0.95 1.684,-0.925 c 1.802,0 2.135,1.185 2.135,2.728 l -0.000999999999999,3.14 z'
const I_PATH = 'M 5.559,12.225 l -1.78,0 L 3.779,6.498 l 1.78,0 l 0,5.727 z'
const SPARK_PATH = 'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z'
const SPARK_CX = 4.38, SPARK_CY = 4.57

function SceneLogo() {
    const frame = useCurrentFrame()
    const opacity = interpolate(frame, [...L_IN, ...L_OUT], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const scale = interpolate(frame, [...L_IN, ...L_OUT], [0.6, 1, 1, 1.15], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
    })

    return (
        <Fill style={{ opacity, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <svg width="140" height="140" viewBox="2 2 12 12" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="12" height="12" fill="#FFFFFF" />
                    <path fill="#0A66C2" d={BG_PATH} />
                    <path fill="#FFFFFF" d={N_PATH} />
                    <path fill="#FFFFFF" d={I_PATH} />
                    <g transform={`translate(${SPARK_CX},${SPARK_CY}) scale(1) translate(${-SPARK_CX},${-SPARK_CY})`}>
                        <g transform="translate(3.278,3.292) scale(0.116)">
                            <path fill="#D97757" d={SPARK_PATH} />
                        </g>
                    </g>
                </svg>
                <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                    <span style={{ color: '#D97757' }}>claude</span>
                    <span style={{ color: '#0A66C2' }}>in</span>
                </div>
            </div>
        </Fill>
    )
}

// ─── Scene 1: Claude Code ──────────────────────────────────────────────────────
function Scene1() {
    const frame = useCurrentFrame()
    const opacity = interpolate(frame, [...S1_IN, ...S1_OUT], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const cameraScale = interpolate(
        frame,
        [0, S1_CMD1[1], S1_RESP1[1], S1_CMD2[1], S1_TOOL[0], S1_SUCCESS],
        [2.3, 2.1, 1.85, 1.65, 1.5, 1.4],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    )
    const input = <span style={{ color: '#d97757' }}>&gt; </span>
    const output = <span style={{ color: '#ffffff' }}>● </span>

    return (
        <Fill style={{ opacity }}>
            <div style={{ width: '100%', height: '100%', transform: `scale(${cameraScale})`, transformOrigin: 'top left' }}>
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
                            <Typed text="What should we make today?" from={S1_RESP1[0]} to={S1_RESP1[1]} />
                        </div>
                    )}
                    {frame >= S1_CMD2[0] && (
                        <div>
                            {input}
                            <Typed text="A viral post about ClaudeIn" from={S1_CMD2[0]} to={S1_CMD2[1]} />
                            {frame >= S1_CMD2[1] && frame < S1_THINKING[0] && <Cursor from={S1_CMD2[1]} />}
                        </div>
                    )}
                    <Thinking from={S1_THINKING[0]} to={S1_THINKING[1]} />
                    {frame >= S1_TOOL[0] && (
                        <>
                            <p style={{ paddingLeft: '1.5rem' }}>
                                <Typed
                                    text="Writing your viral ClaudeIn post now..."
                                    from={S1_TOOL[0]}
                                    to={S1_TOOL[0] + 15}
                                />
                            </p>
                            <p>
                                <span style={{ color: '#6CB6FF' }}>●</span>{' '}
                                <Typed
                                    text='Write(post="A viral post about ClaudeIn")'
                                    from={S1_TOOL[0] + 6}
                                    to={S1_TOOL[1]}
                                />
                            </p>
                        </>
                    )}
                    {frame >= S1_SUCCESS && (
                        <p style={{ paddingLeft: '1.5rem', color: '#57AB5A' }}>
                            ✓ Done · post added to your dashboard
                        </p>
                    )}
                    {frame >= S1_CURSOR && (
                        <p>
                            <span style={{ color: '#d97757' }}>&gt;</span>{' '}
                            <Cursor from={S1_CURSOR} />
                        </p>
                    )}
                </ClaudeCode>
            </div>
        </Fill>
    )
}

// ─── Scene 2: Dashboard ────────────────────────────────────────────────────────
// Layout: 2-column grid, 4 cards → bottom-right card is target.
// At 1080×1350, the browser chrome is ~32px, sidebar ~14rem≈224px, leaving
// main ≈ 856px wide. Grid 2-col with 1rem gap → each card ≈ 420px.
// Top-right card y-offset from grid top ≈ 0, bottom-right ≈ card-height + gap.
// We scroll the grid down by ~220px to bring the bottom cards into view.

const GRID_SCROLL_TARGET = 200   // translateY we animate scrollY to
// Approximate position of the "LinkedIn" button in the bottom-right card,
// relative to the dashboard's top-left corner (including browser chrome).
const BTN_X = 750   // approx center-x of LinkedIn btn in the right column
const BTN_Y = 680   // approx y when scroll = GRID_SCROLL_TARGET

function Scene2() {
    const frame = useCurrentFrame()
    const opacity = interpolate(frame, [...S2_IN, ...S2_OUT], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const scrollY = lerp(frame, S2_PAN, [0, GRID_SCROLL_TARGET], Easing.inOut(Easing.cubic))

    // Pointer starts off-screen (bottom-right), moves to button
    const ptrX = lerp(frame, S2_CLICK, [1080, BTN_X], Easing.out(Easing.cubic))
    const ptrY = lerp(frame, S2_CLICK, [1350, BTN_Y], Easing.out(Easing.cubic))

    const clicking = frame >= S2_CLICK[1] && frame < S2_CLICK[1] + 12
    const ptrScale = clicking ? lerp(frame, [S2_CLICK[1], S2_CLICK[1] + 6], [1, 0.8]) : 1

    const highlightLast = frame >= S2_SETTLE
    const buttonState: 'idle' | 'posting' | 'posted' =
        frame >= S2_POSTED ? 'posted' : frame >= S2_CLICK[1] ? 'posting' : 'idle'

    return (
        <Fill style={{ opacity }}>
            <ClaudeInDashboard
                scrollY={scrollY}
                highlightLast={highlightLast}
                buttonState={buttonState}
            />
            {frame >= S2_CLICK[0] && (
                <PointerCursor
                    style={{
                        left: ptrX,
                        top: ptrY,
                        transform: `scale(${ptrScale})`,
                        transformOrigin: 'top left',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                    }}
                />
            )}
        </Fill>
    )
}

// ─── Scene 3: LinkedIn post ────────────────────────────────────────────────────
function PostContent() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', width: '100%' }}>
            <p>A viral post about ClaudeIn 🚀</p>
            <p>I just discovered the easiest way to stay consistent on LinkedIn.</p>
            <p>No agency. No scheduling tool. Just Claude Code + ClaudeIn.</p>
            <p>You describe what you want. Your AI writes, previews, and posts — right from your terminal.</p>
            <ClaudeInTextAnimation />
            <p style={{ color: '#0a66c2' }}>#ClaudeCode #AI #LinkedIn #Productivity #ClaudeIn</p>
        </div>
    )
}

function Scene3() {
    const frame = useCurrentFrame()
    const opacity = interpolate(frame, [...S3_IN, ...S3_OUT], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const translateY = lerp(frame, S3_IN, [20, 0], Easing.out(Easing.cubic))
    const cameraScale = lerp(frame, [S3_COUNTERS[0], S3_COUNTERS[0] + 45], [1, 1.9], Easing.out(Easing.cubic))

    const easing = Easing.out(Easing.cubic)
    const likes = Math.floor(interpolate(frame, S3_COUNTERS, [0, 847], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }))
    const comments = Math.floor(interpolate(frame, S3_COUNTERS, [0, 124], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }))
    const reposts = Math.floor(interpolate(frame, S3_COUNTERS, [0, 58], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing }))

    return (
        <Fill style={{ opacity, transform: `translateY(${translateY}px)` }}>
            <div style={{ width: '100%', height: '100%', transform: `scale(${cameraScale})`, transformOrigin: 'bottom left' }}>
                <LinkedInPost likes={likes} comments={comments} reposts={reposts}>
                    <PostContent />
                </LinkedInPost>
            </div>
        </Fill>
    )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export function ViralPostComposition() {
    return (
        <Fill style={{ background: '#F3F2EF', fontSize: 32 }}>
            <Html5Audio src={staticFile('music.mp3')} />
            <SceneLogo />
            <Scene1 />
            <Scene2 />
            <Scene3 />
        </Fill>
    )
}
