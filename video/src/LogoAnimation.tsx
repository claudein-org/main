import {useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';

const CX = 340, CY = 340;

const NODES: [number, number][] = [
  [340, 170], [460, 220], [510, 340], [460, 460],
  [340, 510], [220, 460], [170, 340], [220, 220],
];

// Each octagon edge: sqrt(120²+50²) = 130, total = 8×130
const RING_PERIMETER = 1040;

export function LogoAnimation() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const sp = (delay: number, stiffness = 150, damping = 16) =>
    spring({frame: frame - delay, fps, config: {stiffness, damping}});

  const fade = (t0: number, t1: number) =>
    interpolate(frame, [t0, t1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const bgOpacity = fade(0, 12);
  const centerScale = sp(5, 400, 26);

  // Spark petals: main (cardinal) then diagonal
  const mainPetalScales = [0, 1, 2, 3].map(i => sp(10 + i * 8, 130, 14));
  const diagPetalScales = [0, 1, 2, 3].map(i => sp(25 + i * 8, 130, 14));

  // Spokes radiate outward
  const spokeProgress = NODES.map((_, i) =>
    interpolate(frame, [50 + i * 2, 64 + i * 2], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    })
  );

  // Octagon ring draws clockwise from top
  const ringProgress = interpolate(frame, [58, 88], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const nodeScales = NODES.map((_, i) => sp(70 + i * 3, 220, 17));

  return (
    <svg width="600" height="600" viewBox="40 40 600 600" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="600" height="600" rx="64" fill="#F4F1E9" opacity={bgOpacity} />

      {/* Spokes */}
      <g stroke="#1668B0" strokeWidth="1.5" opacity="0.35">
        {NODES.map(([nx, ny], i) => (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={CX + (nx - CX) * spokeProgress[i]}
            y2={CY + (ny - CY) * spokeProgress[i]}
          />
        ))}
      </g>

      {/* Octagon ring */}
      <polyline
        points="340,170 460,220 510,340 460,460 340,510 220,460 170,340 220,220 340,170"
        fill="none"
        stroke="#1668B0"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.85"
        strokeDasharray={RING_PERIMETER}
        strokeDashoffset={(1 - ringProgress) * RING_PERIMETER}
      />

      {/* Main petals (cardinal directions) */}
      {[0, 90, 180, 270].map((angle, i) => (
        <g key={angle} transform={`translate(${CX},${CY}) rotate(${angle}) scale(${mainPetalScales[i]})`}>
          <path d="M0,0 Q-34,-59.5 0,-170 Q34,-59.5 0,0 Z" fill="#C9603F" />
        </g>
      ))}

      {/* Diagonal petals (shorter) */}
      {[45, 135, 225, 315].map((angle, i) => (
        <g key={angle} transform={`translate(${CX},${CY}) rotate(${angle}) scale(${diagPetalScales[i]})`}>
          <path d="M0,0 Q-22,-38.5 0,-110 Q22,-38.5 0,0 Z" fill="#E0875F" />
        </g>
      ))}

      {/* Center dot */}
      <g transform={`translate(${CX},${CY}) scale(${centerScale})`}>
        <circle cx="0" cy="0" r="16" fill="#A8502F" />
      </g>

      {/* Network nodes */}
      {NODES.map(([nx, ny], i) => (
        <g key={i} transform={`translate(${nx},${ny}) scale(${nodeScales[i]})`}>
          <circle cx="0" cy="0" r="13" fill="#1668B0" stroke="#F4F1E9" strokeWidth="4" />
        </g>
      ))}
    </svg>
  );
}
