import { Easing, interpolate, useCurrentFrame } from 'remotion'

const SPARK_PATH =
  'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z'

const LETTERS = ['C', 'l', 'a', 'u', 'd', 'e', 'I', 'n']
const LETTER_DELAY = 6
const LETTER_DURATION = 10
const SPARK_START = LETTERS.length * LETTER_DELAY + 10

export function ClaudeInTextAnimation() {
  const frame = useCurrentFrame()

  const ease = (t0: number, t1: number, from = 0, to = 1) =>
    interpolate(frame, [t0, t1], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    })

  const sparkScale = ease(SPARK_START, SPARK_START + 20, 0, 1)
  const sparkOpacity = ease(SPARK_START, SPARK_START + 15)

  // "in" tagline fades in after all letters
  const taglineOpacity = ease(SPARK_START + 10, SPARK_START + 25)

  return (
    <svg width="800" height="800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* background */}
      <rect width="100" height="100" fill="#0A66C2" />

      {/* CLAUDEIN letters, centered at y=46 */}
      {LETTERS.map((letter, i) => {
        const t0 = i * LETTER_DELAY
        const opacity = ease(t0, t0 + LETTER_DURATION)
        const slideY = ease(t0, t0 + LETTER_DURATION, 6, 0)
        // total text width ~52 units, start at x=24
        const x = 24 + i * 6.8
        return (
          <g key={i} opacity={opacity} transform={`translate(0,${slideY})`}>
            <text
              x={x}
              y={46}
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize="13"
              fill="#FFFFFF"
            >
              {letter}
            </text>
          </g>
        )
      })}

      {/* tagline */}
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="4.5"
        fill="rgba(255,255,255,0.75)"
        opacity={taglineOpacity}
      >
        Post to LinkedIn with Claude
      </text>

      {/* Claude spark — centered above text */}
      <g
        opacity={sparkOpacity}
        transform={`translate(50,28) scale(${sparkScale}) translate(-50,-28)`}
      >
        {/* spark is ~21.5 wide, ~19.5 tall; center it at 50,28 */}
        <g transform="translate(39.25,18.25) scale(0.55)">
          <path fill="#D97757" d={SPARK_PATH} />
        </g>
      </g>
    </svg>
  )
}
