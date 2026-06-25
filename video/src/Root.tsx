import { Composition } from 'remotion'
import { LinkedInLogoAnimation } from './LinkedInLogoAnimation'
import { ClaudeInTextAnimation } from './ClaudeInTextAnimation'
import { DemoComposition } from './DemoComposition'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="LinkedInLogo"
        component={LinkedInLogoAnimation}
        durationInFrames={90}
        fps={30}
        width={800}
        height={800}
      />
      <Composition
        id="ClaudeInText"
        component={ClaudeInTextAnimation}
        durationInFrames={100}
        fps={30}
        width={800}
        height={800}
      />
      <Composition
        id="Demo"
        component={DemoComposition}
        durationInFrames={1100}
        fps={30}
        width={1080}
        height={1350}
      />
    </>
  )
}
