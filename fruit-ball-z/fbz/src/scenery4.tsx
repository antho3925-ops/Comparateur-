import React from 'react';
import {random} from 'remotion';
import {INK, SW} from './parts';
import {W} from './scenery';

/* Décors de Namek de l'ép.3 (même dessin), avec variantes assombrie et détruite pour l'ép.4. */

/** Arbre de Namek : tronc fin et boule ronde. `burnt` : boule calcinée. */
export const NamekTree: React.FC<{x: number; y: number; s: number; f: number; seed: number; burnt?: boolean}> = ({x, y, s, f, seed, burnt}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${burnt ? -8 + seed : Math.sin(f * 0.05 + seed) * 2})`}>
		<path d="M-10,0 Q-14,-120 -4,-230 L8,-230 Q14,-120 10,0 Z" fill={burnt ? '#3A3A34' : '#6A7A5A'} stroke={INK} strokeWidth={5} />
		{burnt ? (
			<path d="M-50,-250 Q-70,-300 -30,-330 Q0,-360 34,-320 Q70,-300 46,-250 Q0,-236 -50,-250 Z" fill="#2A2622" stroke={INK} strokeWidth={7} />
		) : (
			<>
				<circle cx={0} cy={-290} r={78} fill="#2E8A4A" stroke={INK} strokeWidth={7} />
				<circle cx={-22} cy={-312} r={40} fill="#58B86A" opacity={0.75} />
				<circle cx={-30} cy={-322} r={12} fill="#BFF5C8" opacity={0.6} />
			</>
		)}
	</g>
);

/** Ciel turquoise de Namek, trois soleils. `grey` 0..1 : ciel gris et voilé. */
export const NamekSky: React.FC<{f: number; hz: number; grey?: number; id?: string}> = ({f, hz, grey = 0, id = 'nsky4'}) => (
	<g>
		<defs>
			<linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#2FB8B0" />
				<stop offset="0.6" stopColor="#7FE6D6" />
				<stop offset="1" stopColor="#D6FFF0" />
			</linearGradient>
			<linearGradient id={`${id}g`} x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#3A4048" />
				<stop offset="0.6" stopColor="#6A7078" />
				<stop offset="1" stopColor="#9AA0A4" />
			</linearGradient>
		</defs>
		<rect x={-500} y={-1500} width={W + 1000} height={hz + 1540} fill={`url(#${id})`} />
		{grey > 0 && <rect x={-500} y={-1500} width={W + 1000} height={hz + 1540} fill={`url(#${id}g)`} opacity={grey} />}
		{[[240, 300, 60], [520, 220, 44], [860, 340, 52]].map(([x, y, r], i) => (
			<g key={i} opacity={1 - grey * 0.85}>
				<circle cx={x} cy={y} r={r * 2.4} fill="#FFFBD8" opacity={0.35} filter="url(#blur20)" />
				<circle cx={x} cy={y} r={r} fill="#FFF8D0" stroke="#F2E39A" strokeWidth={6} />
			</g>
		))}
		{[[100, 520, 1.2], [700, 600, 1.0], [400, 760, 0.8]].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${((x + f * (0.6 + i * 0.2)) % 1500) - 200},${y}) scale(${s})`}>
				{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill={grey > 0.5 ? '#B8BCC0' : '#F2FFFA'} opacity={0.85} />)}
			</g>
		))}
	</g>
);

/** Maison ronde namekienne. `ruin` 0..1 : dôme éventré, noirci. */
export const Dome: React.FC<{x: number; y: number; s: number; ruin?: number; seed?: number}> = ({x, y, s, ruin = 0, seed = 0}) => {
	const cut = `M-200,40 L-200,${-120 + random(`dr${seed}`) * 40} L-120,${-160 - random(`dr1${seed}`) * 40} L-60,-110 L0,${-170 - random(`dr2${seed}`) * 30} L50,-100 L110,${-150 - random(`dr3${seed}`) * 40} L200,${-90 - random(`dr4${seed}`) * 40} L200,40 Z`;
	const id = `dome${seed}`;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={4} rx={200} ry={26} fill="#000" opacity={0.2} filter="url(#blur8)" />
			{ruin > 0 && <clipPath id={id}><path d={cut} /></clipPath>}
			<g clipPath={ruin > 0 ? `url(#${id})` : undefined}>
				<path d="M-170,0 C-170,-230 170,-230 170,0 Z" fill={ruin > 0 ? '#9A9488' : '#F3EEDB'} stroke={INK} strokeWidth={SW} />
				{!ruin && <path d="M-120,-40 C-120,-160 40,-200 80,-170" stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />}
				<path d="M-170,0 C-170,-60 170,-60 170,0" stroke="#CFC6AC" strokeWidth={6} fill="none" />
				{[-90, 0, 90].map((wx) => <ellipse key={wx} cx={wx} cy={-100} rx={26} ry={20} fill="#2E4A5A" stroke={INK} strokeWidth={5} />)}
				<path d="M-40,0 L-40,-60 Q0,-90 40,-60 L40,0 Z" fill="#6A4A2A" stroke={INK} strokeWidth={6} />
				{ruin > 0 && <path d="M-170,0 C-170,-230 170,-230 170,0 Z" fill="#1A1410" opacity={0.45} />}
			</g>
			{ruin > 0 && (
				<g>
					{/* gravats et braises */}
					{Array.from({length: 7}, (_, i) => (
						<path key={i} d={`M${-190 + i * 60},${10 + (i % 2) * 6} l${20 + random(`rb${seed}${i}`) * 20},-${14 + random(`rh${seed}${i}`) * 18} l${18},${18} Z`} fill="#7A7468" stroke={INK} strokeWidth={4} />
					))}
					{[-80, 30, 120].map((ex, i) => <circle key={i} cx={ex} cy={-60 - i * 10} r={10} fill="#FF7A2A" opacity={0.6} filter="url(#blur3)" />)}
				</g>
			)}
		</g>
	);
};

/** Colonne de fumée qui monte (boucle continue). */
export const Smoke: React.FC<{x: number; y: number; s: number; f: number; seed: number; color?: string; o?: number}> = ({x, y, s, f, seed, color = '#4A4644', o = 0.75}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		{Array.from({length: 9}, (_, i) => {
			const t = ((f * 0.6 + i * 40 + seed * 17) % 360) / 360;
			const r = 50 + t * 150;
			return <circle key={i} cx={Math.sin(t * 4 + seed + i) * 40 + t * 120} cy={-t * 900} r={r} fill={color} opacity={(1 - t) * 0.9} filter="url(#blur8)" />;
		})}
	</g>
);

/** Cendres / flocons qui tombent. */
export const Ash: React.FC<{f: number; n?: number; color?: string; seed?: string; speed?: number}> = ({f, n = 30, color = '#C8C4C0', seed = 'ash', speed = 1}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const y = ((random(`${seed}y${i}`) * 2100 + f * (2 + random(`${seed}v${i}`) * 3) * speed) % 2100) - 100;
			const x = random(`${seed}x${i}`) * 1180 - 50 + Math.sin(f * 0.04 + i) * 30;
			return <circle key={i} cx={x} cy={y} r={3 + random(`${seed}r${i}`) * 5} fill={color} opacity={0.6} />;
		})}
	</g>
);

/** Rocher de Namek (repère : base au centre). */
export const Rock: React.FC<{x: number; y: number; s: number; flip?: boolean; dark?: number}> = ({x, y, s, flip, dark = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s * (flip ? -1 : 1)},${s})`}>
		<path d="M-300,0 L-280,-160 Q-240,-300 -120,-330 L20,-360 Q160,-340 230,-240 L300,-90 L320,0 Z" fill="#6C7A6C" stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
		<path d="M-250,-150 Q-200,-270 -110,-300 L10,-325" stroke="#9AAA98" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.7} />
		<path d="M-60,-200 L20,-120 L-10,-40 M120,-260 L160,-160" stroke="#3E4A40" strokeWidth={7} fill="none" strokeLinecap="round" />
		{dark > 0 && <path d="M-300,0 L-280,-160 Q-240,-300 -120,-330 L20,-360 Q160,-340 230,-240 L300,-90 L320,0 Z" fill="#0A1014" opacity={dark} />}
	</g>
);
