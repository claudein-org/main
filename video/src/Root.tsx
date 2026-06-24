import {Composition} from 'remotion';
import {LogoAnimation} from './LogoAnimation';

export function RemotionRoot() {
  return (
    <Composition
      id="LogoAnimation"
      component={LogoAnimation}
      durationInFrames={120}
      fps={30}
      width={600}
      height={600}
    />
  );
}
