import { Composition } from 'remotion'
import { ClaudeInTextAnimation } from './ClaudeInTextAnimation'
import { ClaudeJoke } from './ClaudeJoke'
import { ClaudeLaughingComposition } from './ClaudeLaughing'
import { DemoComposition } from './DemoComposition'
import { LinkedInLogoAnimation } from './LinkedInLogoAnimation'
import { ViralPostComposition } from './ViralPostComposition'

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
        height={1080}
      />
      <Composition
        id="ViralPost"
        component={ViralPostComposition}
        durationInFrames={1210}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="ClaudeJoke"
        component={ClaudeJoke}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{
          q: "Why do programmers prefer dark mode?",
          a: "Because light attracts bugs.",
        }}
      />
      <Composition
        id="ClaudeLaughing"
        component={ClaudeLaughingComposition}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  )
}
