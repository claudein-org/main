import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

const CYCLE = 12 // frames per laugh
const TEAR_CYCLE = 28 // frames per teardrop fall

// Eye hole bounds in the 24×24 viewBox
const LEFT_EYE = { x: 6, y: 8.102, w: 1.488, h: 2.847 }
const RIGHT_EYE = { x: 16.51, y: 8.102, w: 1.49, h: 2.847 }

interface Props {
    laughing?: boolean
    size?: number
}

export function ClaudeLaughing({ laughing = true, size = 400 }: Props) {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const cycleFrame = laughing ? frame % CYCLE : 0

    const bounceY = laughing
        ? interpolate(cycleFrame, [0, CYCLE * 0.45, CYCLE], [0, 24, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.inOut(Easing.quad),
          })
        : 0

    const scaleX = laughing
        ? interpolate(cycleFrame, [0, CYCLE * 0.45, CYCLE * 0.65, CYCLE], [1, 1.2, 1.03, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 1

    const scaleY = laughing
        ? interpolate(cycleFrame, [0, CYCLE * 0.45, CYCLE * 0.65, CYCLE], [1, 0.83, 0.98, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 1

    const rotation = laughing ? Math.sin((frame / CYCLE) * Math.PI * 2) * 5 : 0

    // Eyes fully squinted after 0.8 s when laughing
    const squintAmount = laughing
        ? interpolate(frame, [0, fps * 0.8], [0, LEFT_EYE.h], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.inOut(Easing.ease),
          })
        : 0

    // Tears appear ~0.5 s in
    const tearOpacity = laughing
        ? interpolate(frame, [fps * 0.4, fps * 0.75], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 0

    const makeTear = (phase: number) => ({
        cy: LEFT_EYE.y + LEFT_EYE.h + phase * 11,
        rx: 0.18 + phase * 0.12,
        ry: 0.28 + phase * 0.32,
        opacity: tearOpacity * Math.sin(Math.PI * phase),
    })

    const t1 = makeTear((frame % TEAR_CYCLE) / TEAR_CYCLE)
    const t2 = makeTear(((frame + TEAR_CYCLE * 0.5) % TEAR_CYCLE) / TEAR_CYCLE)

    return (
        <div
            style={{
                translate: `0px ${bounceY}px`,
                rotate: `${rotation}deg`,
                width: size,
                height: size,
            }}
        >
            <svg viewBox="0 0 24 24" width={size} height={size} style={{ overflow: 'visible' }}>
                {/* Logo body with squash/stretch anchored at bottom-center */}
                <g transform={`translate(12,20) scale(${scaleX},${scaleY}) translate(-12,-20)`}>
                    <path
                        fill="#d97757"
                        fillRule="evenodd"
                        d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0v-3.1h3V5h17.998zM6 10.949h1.488V8.102H6zm10.51 0H18V8.102h-1.49z"
                        clipRule="evenodd"
                    />
                    {/* Squint overlays: orange rects that fill the eye holes from the bottom up */}
                    <rect
                        x={LEFT_EYE.x}
                        y={LEFT_EYE.y + LEFT_EYE.h - squintAmount}
                        width={LEFT_EYE.w}
                        height={squintAmount}
                        fill="#d97757"
                    />
                    <rect
                        x={RIGHT_EYE.x}
                        y={RIGHT_EYE.y + RIGHT_EYE.h - squintAmount}
                        width={RIGHT_EYE.w}
                        height={squintAmount}
                        fill="#d97757"
                    />
                </g>

                {/* Tears of joy — outside the squash group so they fall straight */}
                {[t1, t2].map((t, i) => (
                    <g key={i}>
                        <ellipse
                            cx={LEFT_EYE.x + LEFT_EYE.w / 2}
                            cy={t.cy}
                            rx={t.rx}
                            ry={t.ry}
                            fill="#5bc0eb"
                            opacity={t.opacity}
                        />
                        <ellipse
                            cx={RIGHT_EYE.x + RIGHT_EYE.w / 2}
                            cy={t.cy}
                            rx={t.rx}
                            ry={t.ry}
                            fill="#5bc0eb"
                            opacity={t.opacity}
                        />
                    </g>
                ))}
            </svg>
        </div>
    )
}

export function ClaudeLaughingComposition() {
    return (
        <AbsoluteFill style={{ background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClaudeLaughing />
        </AbsoluteFill>
    )
}
