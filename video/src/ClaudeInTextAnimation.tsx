import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const BG_PATH =
  'M 13.11,2 L 2.885,2 A 0.88,0.88 0 0,0 2,2.866 l 0,10.268 a 0.88,0.88 0 0,0 0.885,0.866 l 10.226,0 a 0.882,0.882 0 0,0 0.889,-0.866 L 14,2.865 a 0.88,0.88 0 0,0 -0.889,-0.864 z'
const N_PATH =
  'M 12.225,12.225 l -1.778,0 L 10.447,9.44 c 0,-0.664 -0.012,-1.519 -0.925,-1.519 c -0.926,0 -1.068,0.724 -1.068,1.47 l 0,2.834 L 6.676,12.225 L 6.676,6.498 l 1.707,0 l 0,0.783 l 0.024,0 c 0.348,-0.594 0.996,-0.95 1.684,-0.925 c 1.802,0 2.135,1.185 2.135,2.728 l -0.000999999999999,3.14 z'
const I_PATH = 'M 5.559,12.225 l -1.78,0 L 3.779,6.498 l 1.78,0 l 0,5.727 z'
const SPARK_PATH =
  'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z'

// Spark visual center in SVG space (viewBox "2 2 12 12")
const SPARK_CX = 4.38, SPARK_CY = 4.57
const LAND_FRAME = 18

export function ClaudeInTextAnimation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spark falls with a small bounce on landing
  const fall = spring({ frame, fps, config: { damping: 11, stiffness: 160, mass: 0.5 } })
  const sparkY = interpolate(fall, [0, 1], [-9, 0])

  // Shine burst expands from landing point
  const ring1Opacity = interpolate(frame, [LAND_FRAME, LAND_FRAME + 6, LAND_FRAME + 22], [0, 0.6, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease),
  })
  const ring1R = interpolate(frame, [LAND_FRAME, LAND_FRAME + 22], [0.1, 1.8], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease),
  })

  const ring2Opacity = interpolate(frame, [LAND_FRAME + 4, LAND_FRAME + 10, LAND_FRAME + 30], [0, 0.35, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease),
  })
  const ring2R = interpolate(frame, [LAND_FRAME + 4, LAND_FRAME + 30], [0.2, 2.8], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease),
  })

  // Spark briefly brightens on impact
  const sparkScale = interpolate(frame, [LAND_FRAME, LAND_FRAME + 5, LAND_FRAME + 14], [1, 1.35, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease),
  })

  return (
    <svg width="800" height="800" viewBox="2 2 12 12" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" fill="#FFFFFF" />

      {/* Static logo: blue background + letterforms */}
      <path fill="#0A66C2" d={BG_PATH} />
      <path fill="#FFFFFF" d={N_PATH} />
      <path fill="#FFFFFF" d={I_PATH} />

      {/* Shine rings at resting spark position */}
      <circle cx={SPARK_CX} cy={SPARK_CY} r={ring1R} fill="#D97757" opacity={ring1Opacity} />
      <circle cx={SPARK_CX} cy={SPARK_CY} r={ring2R} fill="#D97757" opacity={ring2Opacity} />

      {/* Spark falls then scales on impact */}
      <g transform={`translate(0,${sparkY})`}>
        <g transform={`translate(${SPARK_CX},${SPARK_CY}) scale(${sparkScale}) translate(${-SPARK_CX},${-SPARK_CY})`}>
          <g transform="translate(3.278,3.292) scale(0.116)">
            <path fill="#D97757" d={SPARK_PATH} />
          </g>
        </g>
      </g>
    </svg>
  )
}
