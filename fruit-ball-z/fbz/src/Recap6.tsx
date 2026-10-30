import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {Episode5} from './Episode5';

// plans clés de l'ép.5 : vaisseau qui s'ouvre, village en ruines, Litcheezer en contre-plongée, il esquive les coups
const RECAP_SHOTS = [300, 380, 1050, 1440];

/** « Précédemment » : plans de l'ép.5 en accéléré (x2), filtre sépia et lignes de balayage. */
export const Recap6: React.FC<{f: number; from: number; to: number}> = ({f, from, to}) => {
	const len = (to - from) / RECAP_SHOTS.length;
	const i = Math.min(RECAP_SHOTS.length - 1, Math.floor((f - from) / len));
	const local = f - from - i * len;
	const ep5 = Math.round(RECAP_SHOTS[i] + local * 2);
	const scan = (f * 37) % 1920;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(1.3) contrast(1.05)'}}>
				<Freeze frame={ep5}><Episode5 recap /></Freeze>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 7px)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: scan, height: 40, background: 'rgba(255,255,255,0.08)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 48%, rgba(8,4,10,0.7) 100%)'}} />
			<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
				<span style={{fontFamily: 'Bangers', fontSize: 96, letterSpacing: 3, color: '#FFD23F', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>PRÉCÉDEMMENT...</span>
			</div>
			<div style={{position: 'absolute', top: 250, right: 70, fontFamily: 'Luckiest Guy', fontSize: 64, color: '#FFFFFF', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', opacity: f % 20 < 14 ? 1 : 0.3}}>▶▶ x2</div>
			<AbsoluteFill style={{background: '#FFFFFF', opacity: local < 3 && i > 0 ? 0.7 - local * 0.22 : 0}} />
		</AbsoluteFill>
	);
};
