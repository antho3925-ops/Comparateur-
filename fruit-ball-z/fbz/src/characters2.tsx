import React from 'react';
import {Arm, blinkAt, Eye, INK, Mood, Mouth, Shadow, SW, useUid} from './parts';

/* ============================== KIWIKOLO (kiwi, façon Piccolo) ============================== */
const KIWI_BODY = 'M0,-430 C112,-432 172,-338 170,-236 C168,-134 112,-72 0,-72 C-112,-72 -168,-134 -170,-236 C-172,-338 -112,-432 0,-430 Z';
// duvet : petits poils le long du contour (ellipse approchée)
const FUZZ = Array.from({length: 54}, (_, i) => {
	const a = (i / 54) * Math.PI * 2;
	return [Math.cos(a) * 170, -251 + Math.sin(a) * 180, a] as const;
});
// graines noires en cercle autour du visage
const SEEDS = Array.from({length: 18}, (_, i) => {
	const a = (i / 18) * Math.PI * 2;
	return [Math.cos(a) * 112, -246 + Math.sin(a) * 124, (a * 180) / Math.PI] as const;
});

export const Kiwikolo: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; squash?: number; shadow?: boolean; armL?: number; armR?: number;
	darken?: number; cape?: number; crossed?: boolean; fingers?: number; armLen?: number; point?: number;
}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'angry', look = [0, 0], lean = 0, squash = 0,
	shadow = true, armL = 20, armR = 20, darken = 0, cape = 0.4, crossed, fingers = 0, armLen = 120, point = 0,
}) => {
	const gid = useUid('kiwg');
	const fid = useUid('kiwf');
	const did = useUid('kiwd');
	const blink = mood === 'shock' ? 0 : blinkAt(frame, 17);
	const skin = '#D8EE90';
	const anger = mood === 'angry' ? 0.6 : mood === 'determined' ? 0.8 : 0;
	const k = 1 - darken;
	// cape qui ondule (deux pans)
	const wv = (i: number) => Math.sin(frame * 0.18 + i) * (12 + cape * 40);
	const capeL = `M-150,-318 C-210,-250 ${-250 + wv(0)},-150 ${-280 + wv(1)},4 L${-120 + wv(2) * 0.5},10 C-140,-120 -130,-220 -110,-300 Z`;
	const capeR = `M150,-318 C210,-250 ${250 + wv(3)},-150 ${280 + wv(4)},4 L${120 + wv(5) * 0.5},10 C140,-120 130,-220 110,-300 Z`;
	const sx = scale * (flip ? -1 : 1) * (1 + squash * 0.12);
	const sy = scale * (1 - squash * 0.12);
	// fingers = 1 : deux doigts sur le front ; point = 1 : bras tendu droit devant (tir)
	let armRAngle = fingers > 0 ? armR * (1 - fingers) + 225 * fingers : armR;
	let armRLen = fingers > 0 ? armLen * (1 - fingers) + 160 * fingers : armLen;
	if (point > 0) { armRAngle = armRAngle * (1 - point) + 92 * point; armRLen = armRLen * (1 - point) + 210 * point; }
	const ant = (s: number) => {
		const w = Math.sin(frame * 0.2 + s) * 6;
		return `M${s * 34},-424 Q${s * 44},-480 ${s * 74 + w},-528`;
	};
	return (
		<g transform={`translate(${x},${y}) rotate(${lean}) scale(${sx},${sy})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="38%" cy="32%" r="78%">
					<stop offset="0" stopColor="#B08A58" />
					<stop offset="0.55" stopColor="#7A5530" />
					<stop offset="1" stopColor="#3E2812" />
				</radialGradient>
				<radialGradient id={fid} cx="50%" cy="50%" r="55%">
					<stop offset="0" stopColor="#F4FBD0" />
					<stop offset="0.42" stopColor="#D8EE90" />
					<stop offset="0.62" stopColor="#8ED43A" />
					<stop offset="1" stopColor="#5BAA22" />
				</radialGradient>
				<filter id={did} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.05} 0 ${darken * 0.02}  0 0 0 1 0`} />
				</filter>
			</defs>
			{shadow && <Shadow w={160} />}
			{/* longue cape blanche (derrière) */}
			<path d={capeL} fill="#F4F1EA" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<path d={capeR} fill="#E2DDD2" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			{/* jambes : pantalon violet + chaussures marron */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M${s * 55},-95 L${s * 64},-24`} stroke={INK} strokeWidth={34 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 55},-95 L${s * 64},-24`} stroke="#5B2C83" strokeWidth={34} strokeLinecap="round" />
					<ellipse cx={s * 74} cy={-14} rx={44} ry={22} fill="#6B3A1E" stroke={INK} strokeWidth={SW} />
				</g>
			))}
			{/* deux fines antennes */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={ant(s)} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
					<path d={ant(s)} stroke="#7A5530" strokeWidth={7} fill="none" strokeLinecap="round" />
				</g>
			))}
			{/* bras gauche (derrière) */}
			{!crossed && <Arm sx={-150} sy={-230} angle={armL} len={armLen} side={-1} color="#7A5530" glove="#7A5530" handR={30} width={26} fist />}
			{/* corps kiwi duveteux */}
			<g filter="url(#soft)">
				{FUZZ.map(([fx, fy, a], i) => (
					<path key={i} d={`M${fx},${fy} l${Math.cos(a + 0.4) * 16},${Math.sin(a + 0.4) * 16}`} stroke="#5A3C1E" strokeWidth={6} strokeLinecap="round" />
				))}
				<path d={KIWI_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
			</g>
			{/* face ouverte : chair verte, graines noires en cercle */}
			<ellipse cx={0} cy={-246} rx={146} ry={158} fill={`url(#${fid})`} stroke="#4A3018" strokeWidth={6} />
			{Array.from({length: 18}, (_, i) => {
				const a = (i / 18) * Math.PI * 2;
				return <path key={i} d={`M${Math.cos(a) * 96},${-246 + Math.sin(a) * 106} L${Math.cos(a) * 138},${-246 + Math.sin(a) * 150}`} stroke="#E8F7B0" strokeWidth={3} opacity={0.6} />;
			})}
			{SEEDS.map(([sx2, sy2, r], i) => (
				<ellipse key={i} cx={sx2} cy={sy2} rx={6} ry={11} fill="#14100A" transform={`rotate(${r + 90},${sx2},${sy2})`} />
			))}
			{/* ceinture bleue */}
			<path d="M-160,-150 Q0,-112 160,-150 L150,-112 Q0,-76 -150,-112 Z" fill="#2F5FB3" stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
			<path d="M60,-118 q30,30 10,70 q-22,-14 -26,-62 Z" fill="#2F5FB3" stroke={INK} strokeWidth={SW * 0.7} strokeLinejoin="round" />
			{/* épaulettes blanches */}
			{[-1, 1].map((s) => (
				<g key={s} transform={`translate(${s * 140},-322) rotate(${s * 20})`}>
					<path d="M-62,14 Q-60,-44 0,-44 Q60,-44 62,14 Q0,28 -62,14 Z" fill="#F4F1EA" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
					<path d="M-38,-16 Q0,-32 38,-16" stroke="#FFFFFF" strokeWidth={6} fill="none" />
				</g>
			))}
			{/* regard sévère */}
			<Eye x={-44} y={-282} rx={32} ry={36} side={-1} look={look} blink={blink} anger={anger} skin={skin} iris="#3A2412" pupil={mood === 'shock' ? 0.6 : 0.8} />
			<Eye x={44} y={-282} rx={32} ry={36} side={1} look={look} blink={blink} anger={anger} skin={skin} iris="#3A2412" pupil={mood === 'shock' ? 0.6 : 0.8} />
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * 12},${-318 + (anger ? 10 : 0)} Q${s * 46},${-338} ${s * 82},${-330 - (anger ? 14 : 0)}`} stroke="#3E2812" strokeWidth={14} strokeLinecap="round" fill="none" />
			))}
			<Mouth x={0} y={-196} w={96} open={mouth} mood={mood} scale={0.8} />
			{/* bras croisés */}
			{crossed && (
				<g>
					<path d="M-150,-232 Q-90,-150 40,-176" stroke={INK} strokeWidth={26 + SW * 2} strokeLinecap="round" fill="none" />
					<path d="M-150,-232 Q-90,-150 40,-176" stroke="#7A5530" strokeWidth={26} strokeLinecap="round" fill="none" />
					<path d="M150,-232 Q90,-180 -40,-198" stroke={INK} strokeWidth={26 + SW * 2} strokeLinecap="round" fill="none" />
					<path d="M150,-232 Q90,-180 -40,-198" stroke="#7A5530" strokeWidth={26} strokeLinecap="round" fill="none" />
					{[[46, -176], [-46, -198]].map(([hx, hy], i) => (
						<g key={i}>
							<circle cx={hx} cy={hy} r={26} fill="#7A5530" stroke={INK} strokeWidth={SW * 0.9} />
							<path d={`M${hx - 12},${hy - 26} l0,-8 M${hx + 12},${hy - 26} l0,-8`} stroke="#5B2C83" strokeWidth={10} />
						</g>
					))}
				</g>
			)}
			{/* bras droit (devant) */}
			{!crossed && <Arm sx={150} sy={-230} angle={armRAngle} len={armRLen} side={1} color="#7A5530" glove="#7A5530" handR={30} width={26} fist={fingers < 0.5 && point < 0.5} />}
		</g>
	);
};

/** Position de la main droite de Kiwikolo (repère du monde) pour la pose `fingers` ou `point`. */
export const kiwiHand = (x: number, y: number, scale: number, pose: 'fingers' | 'point', flip = false): [number, number] => {
	const [ang, len] = pose === 'fingers' ? [225, 160] : [92, 210];
	const a = (ang * Math.PI) / 180;
	const lx = 150 + Math.sin(a) * len;
	const ly = -230 + Math.cos(a) * len;
	return [x + lx * scale * (flip ? -1 : 1), y + ly * scale];
};

/** Fissures sur l'armure de Raditz, à poser avec le même placement que <Raditz> (repère local). */
export const ArmorCrack: React.FC<{x: number; y: number; scale: number; lean?: number; p: number}> = ({x, y, scale, lean = 0, p}) => (
	<g transform={`translate(${x},${y}) rotate(${lean}) scale(${scale})`} opacity={Math.min(1, p * 2)}>
		<path d={`M6,-330 L-20,-300 L12,-280 L-30,-250 M-20,-300 L-64,-316 M12,-280 L60,-300 L84,-272 M-30,-250 L-60,-236`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round"
			strokeDasharray={400} strokeDashoffset={400 * (1 - p)} />
		<path d="M-40,-268 L-24,-288 L-6,-262 Z M30,-294 L48,-310 L52,-284 Z" fill="#20242A" opacity={p > 0.6 ? 0.9 : 0} />
	</g>
);
