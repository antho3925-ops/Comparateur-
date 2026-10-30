import React from 'react';
import {random} from 'remotion';
import {Arm, blinkAt, Eye, INK, Mouth, Shadow, SW, useUid} from './parts';

const mix = (a: string, b: string, k: number) => {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
	const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

/* ============================== LITCHEEZER (litchi, façon Freezer) ============================== */
// silhouette fine en forme de goutte ; `form` (0 -> 1) l'élargit pour la deuxième forme
// même silhouette que l'ép.4 (LTZ_BODY de characters4.tsx), posée sur des jambes ; `form` l'élargit
const litBody = (k: number) => {
	const w = 1 + k * 0.28;
	return `M0,-560 C${78 * w},-562 ${128 * w},-500 ${132 * w},-410 C${138 * w},-300 ${128 * w},-200 0,-150 C${-128 * w},-200 ${-138 * w},-300 ${-132 * w},-410 C${-128 * w},-500 ${-78 * w},-562 0,-560 Z`;
};
// écailles de la peau de litchi (deuxième forme) : centres d'une grille décalée
const SCALES = (() => {
	const out: Array<[number, number, number]> = [];
	for (let row = 0; row < 12; row++) {
		for (let col = -6; col <= 6; col++) {
			const x = col * 38 + (row % 2) * 19;
			const y = -556 + row * 36;
			out.push([x, y, row * 13 + col]);
		}
	}
	return out;
})();
// épines : point d'ancrage, angle, longueur max
const SPINES: Array<[number, number, number, number]> = [
	[-122, -360, -62, 120], [-136, -300, -84, 96], [122, -360, 62, 120], [136, -300, 84, 96],
	[-46, -552, -22, 130], [0, -566, 0, 160], [46, -552, 22, 130],
];

export const Litcheezer: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number;
	look?: [number, number]; lean?: number; shadow?: boolean; form?: number; armL?: number; armR?: number;
	flick?: number; darken?: number; brow?: number; tail?: number; crack?: number;
}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, look = [0, 0], lean = 0, shadow = true, form = 0,
	armL = 20, armR = 20, flick = 0, darken = 0, brow = 0, tail = 1, crack = 0,
}) => {
	const gid = useUid('litg');
	const cid = useUid('litc');
	const did = useUid('litd');
	const blink = blinkAt(frame, 17);
	const base = mix('#F7C6D9', '#D4567E', form * 0.85);
	const dark = mix('#B87C98', '#7A1E3E', form);
	const skin = mix('#F2B8CE', '#C9486E', form * 0.85);
	const k = 1 - darken;
	const w = 1 + form * 0.28;
	const sw = Math.sin(frame * 0.09) * 18 * tail;
	const tailD = `M${60 * w},-200 C${260 * w},-170 ${330 + sw},-300 ${300 + sw * 1.4},-420 C${280 + sw * 1.4},-520 ${200 + sw * 1.6},-560 ${170 + sw * 1.6},-500`;
	const armRA = armR * (1 - flick) + 92 * flick;
	return (
		<g transform={`translate(${x},${y}) rotate(${lean}) scale(${scale * (flip ? -1 : 1)},${scale})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="36%" cy="28%" r="80%">
					<stop offset="0" stopColor={mix('#FFFFFF', '#F2A0B8', form * 0.7)} />
					<stop offset="0.45" stopColor={base} />
					<stop offset="1" stopColor={dark} />
				</radialGradient>
				<clipPath id={cid}><path d={litBody(form)} /></clipPath>
				<filter id={did} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.05} 0 0  0 0 0 1 0`} />
				</filter>
			</defs>
			{shadow && <Shadow w={140 * w} />}
			{/* longue queue qui ondule derrière lui */}
			<path d={tailD} stroke={INK} strokeWidth={(44 + form * 14) + SW * 2} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke={base} strokeWidth={44 + form * 14} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke="#FFFFFF" strokeOpacity={0.35 * (1 - form * 0.6)} strokeWidth={8} fill="none" strokeLinecap="round" transform="translate(-6,-6)" />
			{/* jambes fines, pieds violets */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M${s * 42 * w},-176 L${s * 50 * w},-26`} stroke={INK} strokeWidth={20 + form * 12 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 42 * w},-176 L${s * 50 * w},-26`} stroke={skin} strokeWidth={20 + form * 12} strokeLinecap="round" />
					<ellipse cx={s * 58 * w} cy={-16} rx={36 * w} ry={18} fill="#6A2A7A" stroke={INK} strokeWidth={SW} />
				</g>
			))}
			{/* petites cornes noires */}
			{[-1, 1].map((s) => (
				<path key={s} transform={`translate(${s * 70},-520) scale(${1 + form * 0.6}) translate(${-s * 70},520)`} d={`M${s * 70},-520 Q${s * 120},-570 ${s * 150},-640 Q${s * 112},-600 ${s * 96},-500 Z`} fill={mix('#F4EEF6', '#5A2A40', form)} stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
			))}
			{/* épines qui percent (deuxième forme) */}
			{SPINES.map(([sx, sy, a, L], i) => {
				const p = Math.max(0, Math.min(1, form * 1.6 - i * 0.06));
				if (p <= 0) return null;
				const l = L * p;
				return (
					<g key={i} transform={`translate(${sx * w},${sy}) rotate(${a})`}>
						<path d={`M-22,10 Q-10,${-l * 0.5} 0,${-l} Q10,${-l * 0.5} 22,10 Z`} fill="#F4E6EA" stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
						<path d={`M-8,0 Q-4,${-l * 0.5} 0,${-l * 0.85}`} stroke="#B8566E" strokeWidth={5} fill="none" />
					</g>
				);
			})}
			{/* bras gauche (derrière) */}
			<Arm sx={-104 * w} sy={-300} angle={armL} len={110 + form * 20} side={-1} color={skin} glove={base} handR={22 + form * 8} width={20 + form * 10} />
			{/* corps : coque nacrée, puis peau de litchi rugueuse */}
			<g filter="url(#soft)">
				<path d={litBody(form)} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * (1.2 + form * 0.4)} strokeLinejoin="round" />
			</g>
			{form > 0 && (
				<g clipPath={`url(#${cid})`} opacity={Math.min(1, form * 1.3)}>
					{SCALES.map(([sx, sy, s]) => {
						const r = 17 + random(`ls${s}`) * 5;
						return (
							<g key={s} transform={`translate(${sx * w},${sy})`}>
								<path d={`M0,${-r} L${r * 0.9},${-r * 0.3} L${r * 0.6},${r * 0.8} L${-r * 0.6},${r * 0.8} L${-r * 0.9},${-r * 0.3} Z`} fill={mix(base, '#FFFFFF', 0.12)} stroke={mix(dark, INK, 0.4)} strokeWidth={4} strokeLinejoin="round" />
								<circle cx={0} cy={-r * 0.25} r={3.5} fill={mix(dark, INK, 0.3)} />
							</g>
						);
					})}
				</g>
			)}
			{/* fissures pendant la transformation */}
			{crack > 0 && (
				<g opacity={crack}>
					{['M-90,-480 L-60,-440 L-80,-400 L-46,-370', 'M86,-490 L58,-450 L80,-412', 'M-110,-300 L-76,-280 L-90,-240', 'M106,-310 L74,-270 L94,-236', 'M-20,-550 L0,-516 L-14,-480'].map((d, i) => (
						<g key={i}>
							<path d={d} stroke="#FFF2F8" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#blur3)" />
							<path d={d} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					))}
				</g>
			)}
			{/* reflets nacrés (s'éteignent avec la peau rugueuse) */}
			<g opacity={1 - form * 0.75}>
				<path d="M-92,-470 C-112,-400 -110,-330 -84,-270" stroke="#FFFFFF" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.6} />
				<ellipse cx={-56} cy={-516} rx={20} ry={11} fill="#FFFFFF" opacity={0.9} transform="rotate(-30,-56,-516)" />
				<path d="M100,-450 C112,-390 110,-330 96,-280" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
			</g>
			{/* gemmes violettes sur le crâne et aux épaules (comme l'ép.4) */}
			<ellipse cx={0} cy={-532} rx={44} ry={20} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
			<ellipse cx={-14} cy={-538} rx={14} ry={6} fill="#E6C8FF" opacity={0.85} />
			{[-1, 1].map((s) => (
				<g key={s}>
					<ellipse cx={s * 112 * w} cy={-322} rx={30} ry={22} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
					<ellipse cx={s * 112 * w - 8} cy={-328} rx={9} ry={5} fill="#E6C8FF" opacity={0.85} />
				</g>
			))}
			{/* yeux plissés, iris rouges */}
			<Eye x={-42} y={-440} rx={30} ry={22} side={-1} look={look} blink={blink} anger={0.45 + form * 0.2} skin={skin} iris="#C0103A" pupil={0.7} />
			<Eye x={42} y={-440} rx={30} ry={22} side={1} look={look} blink={blink} anger={0.45 + form * 0.2} skin={skin} iris="#C0103A" pupil={0.7} />
			{/* sourcil levé (moquerie) */}
			{brow > 0 && <path d={`M14,${-472 - brow * 26} Q50,${-490 - brow * 30} 82,${-472 - brow * 18}`} stroke="#5A1A30" strokeWidth={9} fill="none" strokeLinecap="round" />}
			{/* sourire inquiétant ou bouche qui parle */}
			{mouth >= 0.06 ? (
				<Mouth x={0} y={-372} w={78 + form * 20} open={mouth} mood="sneer" scale={0.6 + form * 0.1} />
			) : form < 0.5 ? (
				<g>
					<path d="M-52,-386 Q0,-344 52,-386" stroke="#5A2A6A" strokeWidth={9} fill="none" strokeLinecap="round" />
					<path d="M-52,-386 l-8,-8 M52,-386 l8,-8" stroke="#5A2A6A" strokeWidth={6} strokeLinecap="round" />
				</g>
			) : (
				<g>
					<path d="M-60,-388 Q-6,-334 66,-396 Q10,-354 -60,-388 Z" fill="#4A0C1C" stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
					<path d="M-44,-380 L-38,-370 L-30,-376 L-22,-366 L-12,-372 L-2,-364 L8,-372 L20,-366 L32,-378 L46,-386" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinejoin="round" />
				</g>
			)}
			{/* bras droit (devant), qui peut faire une pichenette */}
			<Arm sx={104 * w} sy={-300} angle={armRA} len={110 + form * 20 + flick * 40} side={1} color={skin} glove={base} handR={22 + form * 8} width={20 + form * 10} fist={flick > 0.5} />
			{flick > 0.5 && (() => {
				const a = (armRA * Math.PI) / 180;
				const L = 110 + form * 20 + flick * 40;
				const hx = 104 * w + Math.sin(a) * L, hy = -300 + Math.cos(a) * L;
				return <path d={`M${hx + 10},${hy - 6} q24,-18 30,-40`} stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />;
			})()}
		</g>
	);
};

/** Main droite de Litcheezer (repère du monde) en pichenette, pour placer l'impact. */
export const litFlickHand = (x: number, y: number, scale: number, form: number): [number, number] => {
	const w = 1 + form * 0.28;
	const a = (92 * Math.PI) / 180;
	const L = 150 + form * 20;
	return [x + (104 * w + Math.sin(a) * L) * scale, y + (-300 + Math.cos(a) * L) * scale];
};

/* ============================== VEINES DORÉES DE POMGOKU ============================== */
const POM_BODY = 'M0,-372 C55,-430 192,-410 180,-255 C170,-122 96,-62 0,-82 C-96,-62 -170,-122 -180,-255 C-192,-410 -55,-430 0,-372 Z';
const VEINS = [
	'M-150,-150 L-118,-196 L-132,-232 L-96,-262 L-104,-300',
	'M-118,-196 L-80,-200',
	'M150,-160 L120,-190 L134,-230 L100,-262 L110,-310',
	'M134,-230 L168,-246',
	'M-60,-100 L-40,-130 L-60,-150',
	'M50,-96 L36,-130 L60,-150 L52,-176',
	'M-30,-380 L-48,-350 L-30,-330',
	'M40,-386 L58,-352 L40,-330',
];

/** À superposer sur Pomgoku (mêmes x, y, scale) : veines de lumière dorée, `p` 0 -> 1. */
export const PomVeins: React.FC<{x: number; y: number; scale: number; lean?: number; frame: number; p: number}> = ({x, y, scale, lean = 0, frame, p}) => {
	const cid = useUid('pvc');
	if (p <= 0) return null;
	const flick = 0.75 + 0.25 * Math.sin(frame * 0.9) * Math.sin(frame * 0.37);
	return (
		<g transform={`translate(${x},${y}) rotate(${lean}) scale(${scale})`}>
			<clipPath id={cid}><path d={POM_BODY} /></clipPath>
			<g clipPath={`url(#${cid})`} opacity={flick}>
				{VEINS.map((d, i) => {
					const q = Math.max(0, Math.min(1, p * 1.6 - i * 0.08));
					return (
						<g key={i} opacity={q}>
							<path d={d} stroke="#FFD23F" strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#blur8)" opacity={0.8} />
							<path d={d} stroke="#FFF6C0" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					);
				})}
			</g>
		</g>
	);
};

/** Aura dorée en flammes autour d'un personnage (pieds en x, y). */
export const GoldAura: React.FC<{x: number; y: number; scale: number; frame: number; p: number; h?: number}> = ({x, y, scale, frame, p, h = 520}) => {
	if (p <= 0) return null;
	const n = 14;
	return (
		<g transform={`translate(${x},${y}) scale(${scale})`} opacity={p}>
			<ellipse cx={0} cy={-h * 0.48} rx={300} ry={h * 0.62} fill="#FFD23F" opacity={0.28} filter="url(#blur20)" />
			{Array.from({length: n}, (_, i) => {
				const s = i / (n - 1) * 2 - 1;
				const ph = frame * 0.5 + i * 1.7;
				const L = h * (0.7 + 0.3 * Math.abs(Math.sin(ph))) * (1 - Math.abs(s) * 0.35);
				const bx = s * 230;
				const tip = bx * 0.7 + Math.sin(ph * 1.3) * 26;
				return <path key={i} d={`M${bx - 40},0 Q${bx - 50},${-L * 0.55} ${tip},${-L} Q${bx + 50},${-L * 0.55} ${bx + 40},0 Z`} fill={i % 2 ? '#FFE27A' : '#FFC21F'} opacity={0.5} />;
			})}
			{Array.from({length: 10}, (_, i) => {
				const yy = -((frame * 9 + i * 97) % h);
				return <circle key={i} cx={(random(`ga${i}`) - 0.5) * 380} cy={yy} r={6 + random(`gb${i}`) * 6} fill="#FFFBE0" opacity={0.8} />;
			})}
		</g>
	);
};
