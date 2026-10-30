import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/luckiest-guy';
import '@fontsource/bangers';
import {Episode} from './Episode';
import {Episode2} from './Episode2';
import {Episode3} from './Episode3';
import {Episode4} from './Episode4';
import timeline from './timeline.json';
import timeline2 from './timeline2.json';
import timeline3 from './timeline3.json';
import timeline4 from './timeline4.json';
import {Episode5} from './Episode5';
import timeline5 from './timeline5.json';
import {Episode6} from './Episode6';
import timeline6 from './timeline6.json';

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
		<Composition id="Episode3" component={Episode3} durationInFrames={timeline3.total} fps={30} width={1080} height={1920} />
		<Composition id="Episode4" component={Episode4} durationInFrames={timeline4.total} fps={30} width={1080} height={1920} />
		<Composition id="Episode5" component={Episode5} durationInFrames={timeline5.total} fps={30} width={1080} height={1920} />
		<Composition id="Episode6" component={Episode6} durationInFrames={timeline6.total} fps={30} width={1080} height={1920} />
	</>
);
