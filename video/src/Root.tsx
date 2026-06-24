import {Composition} from 'remotion';
import {LogoAnimation} from './LogoAnimation';
import {LinkedInLogoAnimation} from './LinkedInLogoAnimation';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="LogoAnimation"
        component={LogoAnimation}
        durationInFrames={120}
        fps={30}
        width={600}
        height={600}
      />
      <Composition
        id="LinkedInLogo"
        component={LinkedInLogoAnimation}
        durationInFrames={90}
        fps={30}
        width={800}
        height={800}
      />
    </>
  );
}
