import { Composition } from 'remotion'
import { LinkedInLogoAnimation } from './LinkedInLogoAnimation'

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
    </>
  )
}
