import React from 'react';
import {Arm, blinkAt, Eye, INK, Mood, Mouth, Shadow, SW, useUid} from './parts';

/* ============================== LITCHEEZER hors de sa capsule ============================== */
// même dessin que l'ép.4 (characters4.tsx : corps, cornes, gemmes, yeux, queue), avec en plus des jambes,
// les bras croisés, un sourire qui s'élargit (grin) et le haut du corps qui se plie (tilt, étirement du cou)
const LTZ_BODY = 'M0,-560 C78,-562 128,-500 132,-410 C138,-300 128,-200 0,-150 C-128,-200 -138,-300 -132,-410 C-128,-500 -78,-562 0,-560 Z';
const LTZ_SCALES = Array.from({length: 26}, (_, i) => {
	const a = (i * 137.5 * Math.PI) / 180;
	const r = 0.35 + ((i * 41) % 60) / 100;
	return [Math.cos(a) * 110 * r, -360 + Math.sin(a) * 170 * r] as const;
});
const LIMB = '#F7C6D9';

export const Litcheezer: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; shadow?: boolean; armL?: number; armR?: number; darken?: number;
	grin?: number; tilt?: number; aura?: number; tail?: number; crossed?: boolean; finger?: boolean; legs?: number;
}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'sneer', look = [0, 0], lean = 0, shadow = true,
	armL = 20, armR = 20, darken = 0, grin = 0.4, tilt = 0, aura = 0, tail = 1, crossed, finger, legs = 0,
}) => {
	const gid = useUid('litg');
	const hid = useUid('lith');
	const did = useUid('litd');
	const blink = mood === 'shock' ? 0 : blinkAt(frame, 53);
	const skin = '#F7C6D9';
	const k = 1 - darken;
	// queue qui fouette derrière lui (même tracé que l'ép.4, partant du bas du dos)
	const w1 = Math.sin(frame * 0.14) * 50 * tail;
	const w2 = Math.sin(frame * 0.14 - 1.2) * 70 * tail;
	const tailD = `M-60,-200 C-260,-170 ${-330 + w1 * 0.4},-300 ${-300 + w1},-420 C${-280 + w2},-520 ${-200 + w2},-560 ${-170 + w2 * 1.2},-500`;
	// jambes repliées quand il flotte (legs = 1)
	const legA = legs * 28;
	// sourire inquiétant, de plus en plus large (grin 1 = dents visibles)
	const gw = 52 + grin * 30;
	const gy = -376;
	const cy = gy - 8 - grin * 12;
	const smile = `M${-gw},${cy} Q0,${gy + 22 + grin * 18} ${gw},${cy}`;
	return (
		<g transform={`translate(${x},${y}) rotate(${lean}) scale(${scale * (flip ? -1 : 1)},${scale})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="36%" cy="28%" r="82%">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.25" stopColor="#FCE6EF" />
					<stop offset="0.6" stopColor="#F7C6D9" />
					<stop offset="1" stopColor="#B87C98" />
				</radialGradient>
				<linearGradient id={hid} x1="0" x2="1" y1="0" y2="1">
					<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
					<stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
				</linearGradient>
				<filter id={did} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.08} 0 ${darken * 0.03}  0 0 0 1 0`} />
				</filter>
			</defs>
			{shadow && <Shadow w={110} o={0.3} />}
			{aura > 0 && (
				<g opacity={aura}>
					<ellipse cx={0} cy={-330} rx={220 + Math.sin(frame * 0.5) * 8} ry={340 + Math.sin(frame * 0.4) * 10} fill="#B48AFF" opacity={0.3} filter="url(#blur20)" />
					<ellipse cx={0} cy={-330} rx={170} ry={290} fill="#F2E6FF" opacity={0.2} filter="url(#blur20)" />
				</g>
			)}
			<path d={tailD} stroke={INK} strokeWidth={44 + SW * 2} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke={LIMB} strokeWidth={44} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.55} transform="translate(-6,-8)" />
			{/* jambes fines, pieds pointus */}
			{[-1, 1].map((s) => (
				<g key={s} transform={`rotate(${s * -legA},${s * 44},-170)`}>
					<path d={`M${s * 44},-170 L${s * 50},-28`} stroke={INK} strokeWidth={24 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 44},-170 L${s * 50},-28`} stroke={LIMB} strokeWidth={24} strokeLinecap="round" />
					<path d={`M${s * 28},-32 Q${s * 54},-48 ${s * 98},-6 Q${s * 54},4 ${s * 26},-6 Z`} fill="#F4EEF6" stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
				</g>
			))}
			{/* le haut du corps se plie autour de la taille (étirement du cou) */}
			<g transform={`rotate(${tilt},0,-200)`}>
				{[-1, 1].map((s) => (
					<path key={s} d={`M${s * 70},-520 Q${s * 120},-570 ${s * 150},-640 Q${s * 112},-600 ${s * 96},-500 Z`} fill="#F4EEF6" stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
				))}
				{!crossed && <Arm sx={-104} sy={-300} angle={armL} len={95} side={-1} color={LIMB} glove={LIMB} handR={22} width={22} />}
				<g filter="url(#soft)">
					<path d={LTZ_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
				</g>
				{LTZ_SCALES.map(([sx, sy], i) => (
					<path key={i} d={`M${sx - 10},${sy} q10,-9 20,0`} stroke="#D89AB6" strokeWidth={3} fill="none" opacity={0.45} />
				))}
				<path d="M-92,-470 C-112,-400 -110,-330 -84,-270" stroke={`url(#${hid})`} strokeWidth={22} fill="none" strokeLinecap="round" />
				<ellipse cx={-56} cy={-516} rx={20} ry={11} fill="#FFFFFF" opacity={0.9} transform="rotate(-30,-56,-516)" />
				<path d="M100,-450 C112,-390 110,-330 96,-280" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
				<ellipse cx={0} cy={-532} rx={44} ry={20} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
				<ellipse cx={-14} cy={-538} rx={14} ry={6} fill="#E6C8FF" opacity={0.85} />
				{[-1, 1].map((s) => (
					<g key={s}>
						<ellipse cx={s * 112} cy={-322} rx={30} ry={22} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
						<ellipse cx={s * 112 - 8} cy={-328} rx={9} ry={5} fill="#E6C8FF" opacity={0.85} />
					</g>
				))}
				<Eye x={-42} y={-440} rx={30} ry={22} side={-1} look={look} blink={blink} anger={mood === 'shock' ? 0 : mood === 'angry' ? 0.7 : 0.42} skin={skin} iris="#C0204A" pupil={0.7} />
				<Eye x={42} y={-440} rx={30} ry={22} side={1} look={look} blink={blink} anger={mood === 'shock' ? 0 : mood === 'angry' ? 0.7 : 0.42} skin={skin} iris="#C0204A" pupil={0.7} />
				{mouth > 0.06 ? (
					<Mouth x={0} y={-372} w={78} open={mouth} mood={mood} scale={0.6} />
				) : (
					<g>
						{grin > 0.5 && <path d={`${smile} Q0,${gy + 4} ${-gw},${cy} Z`} fill="#3A0A2A" />}
						{grin > 0.5 && <path d={`M${-gw * 0.7},${gy + 4 + grin * 2} Q0,${gy + 10 + grin * 6} ${gw * 0.7},${gy + 4 + grin * 2}`} stroke="#FFFFFF" strokeWidth={5 + grin * 5} fill="none" opacity={0.95} />}
						<path d={smile} stroke="#5A2A6A" strokeWidth={9} fill="none" strokeLinecap="round" />
						<path d={`M${-gw},${cy} l-8,-8 M${gw},${cy} l8,-8`} stroke="#5A2A6A" strokeWidth={6} strokeLinecap="round" />
					</g>
				)}
				{crossed ? (
					<g>
						<path d="M-104,-300 Q-70,-200 40,-236" stroke={INK} strokeWidth={22 + SW * 2} strokeLinecap="round" fill="none" />
						<path d="M-104,-300 Q-70,-200 40,-236" stroke={LIMB} strokeWidth={22} strokeLinecap="round" fill="none" />
						<path d="M104,-300 Q70,-240 -40,-256" stroke={INK} strokeWidth={22 + SW * 2} strokeLinecap="round" fill="none" />
						<path d="M104,-300 Q70,-240 -40,-256" stroke={LIMB} strokeWidth={22} strokeLinecap="round" fill="none" />
						{[[46, -236], [-46, -256]].map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r={22} fill={LIMB} stroke={INK} strokeWidth={SW * 0.8} />)}
					</g>
				) : (
					<g>
						<Arm sx={104} sy={-300} angle={armR} len={95} side={1} color={LIMB} glove={LIMB} handR={22} width={22} />
						{finger && (() => {
							const a = (armR * Math.PI) / 180;
							const hx = 104 + Math.sin(a) * 95, hy = -300 + Math.cos(a) * 95;
							return (
								<g>
									<path d={`M${hx},${hy} l${Math.sin(a) * 44},${Math.cos(a) * 44}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
									<path d={`M${hx},${hy} l${Math.sin(a) * 44},${Math.cos(a) * 44}`} stroke={LIMB} strokeWidth={12} strokeLinecap="round" />
								</g>
							);
						})()}
					</g>
				)}
			</g>
		</g>
	);
};

/** Bout du doigt levé de Litcheezer (repère du monde, sans tilt ni lean). */
export const litFinger = (x: number, y: number, scale: number, armR: number): [number, number] => {
	const a = (armR * Math.PI) / 180;
	return [x + (104 + Math.sin(a) * 139) * scale, y + (-300 + Math.cos(a) * 139) * scale];
};

/* ============================== CAPSULE FLOTTANTE DE LITCHEEZER ============================== */
export const LitPod: React.FC<{x: number; y: number; scale: number; frame: number}> = ({x, y, scale, frame}) => (
	<g transform={`translate(${x},${y + Math.sin(frame * 0.08) * 8}) scale(${scale})`}>
		<ellipse cx={0} cy={120} rx={160} ry={40} fill="#9FD8FF" opacity={0.35} filter="url(#blur20)" />
		<path d="M-170,0 Q-160,110 0,120 Q160,110 170,0 Z" fill="#D8DCE6" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
		<path d="M-150,20 Q0,50 150,20" stroke="#8A90A0" strokeWidth={6} fill="none" />
		<ellipse cx={0} cy={0} rx={172} ry={30} fill="#EEF0F6" stroke={INK} strokeWidth={SW} />
		{[-90, 0, 90].map((bx) => <circle key={bx} cx={bx} cy={74} r={10} fill="#7A3FA0" stroke={INK} strokeWidth={4} />)}
	</g>
);
