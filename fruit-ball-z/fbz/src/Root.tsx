import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/luckiest-guy';
import '@fontsource/bangers';
import {Episode} from './Episode';
import {Episode2} from './Episode2';
import timeline from './timeline.json';
import timeline2 from './timeline2.json';

const fontHandle = typeof document !== 'undefined' ? delayRender('polices') : null;
if (fontHandle !== null) {
	Promise.all([
		document.fonts.load('80px "Luckiest Guy"', 'ÉÀéèêàç'),
		document.fonts.load('80px "Bangers"', 'FRUIT'),
	]).then(() => continueRender(fontHandle));
}

export const Root: React.FC = () => (
	<>
		<Composition id="Episode1" component={Episode} durationInFrames={timeline.total} fps={30} width={1080} height={1920} />
		<Composition id="Episode2" component={Episode2} durationInFrames={timeline2.total} fps={30} width={1080} height={1920} />
	</>
);
