import React from 'react';
import {random} from 'remotion';
import {INK, SW} from './parts';

export const W = 1080;
export const H = 1920;
export const GROUND = 1260;

const lerpColor = (a: string, b: string, t: number) => {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
	const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

/** Arbre fruitier : contour unifié (tous les traits d'abord, puis les remplissages). */
export const Tree: React.FC<{x: number; y: number; s: number; frame: number; seed: number; dark: number; stump?: boolean}> = ({x, y, s, frame, seed, dark, stump}) => {
	const blobs: Array<[number, number, number]> = [[-120, -420, 120], [0, -500, 140], [120, -420, 120], [-60, -320, 110], [70, -320, 110], [0, -400, 120]];
	const sway = Math.sin(frame * 0.05 + seed) * 1.6;
	const leaf = lerpColor('#4FAE3B', '#1F3A2A', dark);
	const leaf2 = lerpColor('#7CCB4E', '#2A4A33', dark);
	const trunk = lerpColor('#7A4A22', '#2A1B12', dark);
	if (stump) {
		return (
			<g transform={`translate(${x},${y}) scale(${s})`}>
				<path d="M-40,0 L-34,-90 L-10,-70 L4,-110 L18,-76 L36,-96 L42,0 Z" fill={trunk} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			</g>
		);
	}
	const apples: Array<[number, number]> = [[-140, -400], [-40, -520], [80, -470], [140, -380], [-70, -300], [40, -330], [-10, -420]];
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={0} rx={170} ry={26} fill="#000" opacity={0.18} filter="url(#blur8)" />
			<path d="M-34,0 C-30,-120 -26,-200 -60,-300 L-20,-290 C-6,-240 0,-200 6,-260 L30,-300 C20,-200 26,-120 36,0 Z" fill={trunk} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<g transform={`rotate(${sway},0,-260)`}>
				{blobs.map(([bx, by, r], i) => <circle key={`o${i}`} cx={bx} cy={by} r={r} fill={INK} stroke={INK} strokeWidth={SW * 2} />)}
				{blobs.map(([bx, by, r], i) => <circle key={`f${i}`} cx={bx} cy={by} r={r} fill={leaf} />)}
				{blobs.map(([bx, by, r], i) => <circle key={`h${i}`} cx={bx - r * 0.25} cy={by - r * 0.3} r={r * 0.55} fill={leaf2} opacity={0.7} />)}
				{apples.map(([ax, ay], i) => (
					<g key={`a${i}`} transform={`translate(${ax},${ay + Math.sin(frame * 0.08 + i) * 2})`}>
						<circle r={18} fill={lerpColor('#E2352B', '#4A1A1A', dark)} stroke={INK} strokeWidth={5} />
						<circle cx={-6} cy={-6} r={5} fill="#FFFFFF" opacity={0.6} />
						<path d="M0,-18 l3,-9" stroke={INK} strokeWidth={4} />
					</g>
				))}
			</g>
		</g>
	);
};

const Bird: React.FC<{x: number; y: number; frame: number; s: number}> = ({x, y, frame, s}) => {
	const f = Math.sin(frame * 0.6) * 18;
	return (
		<path transform={`translate(${x},${y}) scale(${s})`} d={`M-30,${f * 0.4} Q-15,${-14 - f} 0,0 Q15,${-14 - f} 30,${f * 0.4}`} fill="none" stroke="#3A2A1A" strokeWidth={6} strokeLinecap="round" />
	);
};

const Cloud: React.FC<{x: number; y: number; s: number; color: string}> = ({x, y, s, color}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill={color} />)}
	</g>
);

/** Verger complet. dark = 0 (soleil doré) -> 1 (ciel d'orage). */
export const Orchard: React.FC<{frame: number; dark: number; destroyed?: boolean; birds?: boolean; leaves?: boolean}> = ({frame, dark, destroyed, birds = true, leaves = true}) => {
	const skyTop = lerpColor('#6FC3F0', '#120C26', dark);
	const skyMid = lerpColor('#FFE6A6', '#3A1E3E', dark);
	const skyLow = lerpColor('#FFB65C', '#6A2A2A', dark);
	const g1 = lerpColor('#9DD45E', '#2C3B22', dark);
	const g2 = lerpColor('#6DB443', '#22311B', dark);
	const field = lerpColor('#7CC24E', '#26351D', dark);
	const field2 = lerpColor('#4E9A2F', '#162312', dark);
	return (
		<g>
			<defs>
				<linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor={skyTop} />
					<stop offset="0.55" stopColor={skyMid} />
					<stop offset="1" stopColor={skyLow} />
				</linearGradient>
				<radialGradient id="sunglow">
					<stop offset="0" stopColor="#FFF6C8" stopOpacity={1} />
					<stop offset="0.3" stopColor="#FFD86A" stopOpacity={0.8} />
					<stop offset="1" stopColor="#FFB040" stopOpacity={0} />
				</radialGradient>
				<linearGradient id="field" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor={field} />
					<stop offset="1" stopColor={field2} />
				</linearGradient>
			</defs>
			<rect width={W} height={GROUND + 40} fill="url(#sky)" />
			{/* soleil + rayons */}
			<g opacity={(1 - dark) ** 2}>
				<circle cx={800} cy={560} r={360} fill="url(#sunglow)" />
				<g transform={`translate(800,560) rotate(${frame * 0.3})`} opacity={0.22}>
					{Array.from({length: 12}, (_, i) => (
						<path key={i} transform={`rotate(${i * 30})`} d="M-30,0 L0,-900 L30,0 Z" fill="#FFF1B0" />
					))}
				</g>
				<circle cx={800} cy={560} r={105} fill="#FFE88A" stroke="#F5B53A" strokeWidth={8} />
			</g>
			<Cloud x={200 + frame * 0.4} y={300} s={1.3} color={lerpColor('#FFFFFF', '#3B2E4A', dark)} />
			<Cloud x={620 + frame * 0.25} y={180} s={0.9} color={lerpColor('#FFF7E6', '#352842', dark)} />
			<Cloud x={-40 + frame * 0.3} y={720} s={0.8} color={lerpColor('#FFF1D6', '#3B2E4A', dark)} />
			{birds && dark < 0.5 && [0, 1, 2].map((i) => (
				<Bird key={i} x={((frame * (3 + i) + i * 300) % 1400) - 150} y={420 + i * 60 + Math.sin(frame * 0.05 + i) * 20} frame={frame + i * 7} s={0.8 - i * 0.15} />
			))}
			{/* collines */}
			<path d={`M0,1150 Q200,1040 420,1120 T820,1090 T1080,1110 L1080,${GROUND + 40} L0,${GROUND + 40} Z`} fill={g1} stroke={INK} strokeWidth={6} />
			<path d={`M0,1210 Q260,1130 540,1200 T1080,1180 L1080,${GROUND + 40} L0,${GROUND + 40} Z`} fill={g2} stroke={INK} strokeWidth={6} />
			<Tree x={560} y={1235} s={0.62} frame={frame} seed={2} dark={dark} stump={destroyed} />
			{/* champ */}
			<rect y={GROUND} width={W} height={H - GROUND} fill="url(#field)" />
			<path d={`M0,${GROUND} Q540,${GROUND - 20} 1080,${GROUND}`} stroke={INK} strokeWidth={6} fill="none" />
			<Tree x={130} y={1330} s={1.05} frame={frame} seed={0} dark={dark} stump={false} />
			<Tree x={970} y={1310} s={0.95} frame={frame} seed={4} dark={dark} stump={false} />
			{/* fleurs */}
			{Array.from({length: 18}, (_, i) => {
				const fx = random(`fx${i}`) * W;
				const fy = GROUND + 60 + random(`fy${i}`) * 600;
				const c = ['#FFFFFF', '#FFE04A', '#FF8FB1'][i % 3];
				return (
					<g key={i} transform={`translate(${fx},${fy}) scale(${0.6 + (fy - GROUND) / 900})`}>
						{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} r={7} fill={lerpColor(c, '#333344', dark)} />)}
						<circle r={5} fill={lerpColor('#F5A623', '#333', dark)} />
					</g>
				);
			})}
		</g>
	);
};

/** Herbes du premier plan qui ondulent. */
export const Grass: React.FC<{frame: number; dark: number; y?: number; wind?: number}> = ({frame, dark, y = H, wind = 1}) => {
	const c1 = lerpColor('#3E8E2A', '#132011', dark);
	const c2 = lerpColor('#5DB33A', '#1C2C17', dark);
	return (
		<g>
			{Array.from({length: 42}, (_, i) => {
				const x = (i / 41) * (W + 60) - 30;
				const h = 90 + random(`g${i}`) * 110;
				const sw = Math.sin(frame * 0.09 * wind + i * 0.7) * 22 * wind;
				return <path key={i} d={`M${x - 16},${y} Q${x + sw * 0.4},${y - h * 0.6} ${x + sw},${y - h} Q${x + 4},${y - h * 0.5} ${x + 16},${y} Z`} fill={i % 2 ? c1 : c2} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
			})}
		</g>
	);
};

/** Feuilles qui virevoltent. */
export const FallingLeaves: React.FC<{frame: number; n?: number; speed?: number; dark?: number; windX?: number}> = ({frame, n = 8, speed = 1, dark = 0, windX = 0.6}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const sp = (0.7 + random(`ls${i}`) * 0.6) * speed;
			const p = (random(`lp${i}`) * H + frame * 3.2 * sp) % (H + 200);
			const x = (random(`lx${i}`) * W + frame * windX * sp * 4 + Math.sin(frame * 0.05 + i) * 60) % (W + 100);
			return (
				<g key={i} transform={`translate(${x - 50},${p - 100}) rotate(${frame * 3 * sp + i * 40}) scale(${0.8 + random(`lz${i}`) * 0.6})`}>
					<path d="M0,0 C10,-16 34,-16 44,0 C34,14 10,14 0,0 Z" fill={lerpColor(i % 2 ? '#5DB33A' : '#E8A93A', '#2A3A22', dark)} stroke={INK} strokeWidth={3} />
				</g>
			);
		})}
	</g>
);

/** Cratère avec bourrelet de terre. */
export const Crater: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0.5}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse rx={330} ry={84} fill="#2A1A10" stroke={INK} strokeWidth={SW} />
		<ellipse cy={10} rx={260} ry={52} fill="#140B06" />
		<ellipse cy={6} rx={200} ry={40} fill="#FF8A2A" opacity={glow * 0.5} filter="url(#blur20)" />
		{Array.from({length: 16}, (_, i) => {
			const a = (i / 16) * Math.PI * 2;
			return <ellipse key={i} cx={Math.cos(a) * 335} cy={Math.sin(a) * 86} rx={44} ry={22} fill="#5A3A22" stroke={INK} strokeWidth={5} />;
		})}
	</g>
);

/** Nuage de poussière/fumée : bulles qui grossissent. */
export const Dust: React.FC<{x: number; y: number; t: number; n?: number; seed?: string; color?: string; spread?: number; opacity?: number}> = ({x, y, t, n = 26, seed = 'd', color = '#B9A58C', spread = 1, opacity = 1}) => (
	<g opacity={opacity}>
		{Array.from({length: n}, (_, i) => {
			const a = random(`${seed}a${i}`) * Math.PI - Math.PI;
			const dist = (120 + random(`${seed}r${i}`) * 520) * spread * (1 - Math.exp(-t * 3));
			const r = (60 + random(`${seed}s${i}`) * 110) * (0.4 + t * 1.2);
			const cx = x + Math.cos(a) * dist * 1.4;
			const cy = y + Math.sin(a) * dist * 0.7 - t * 80;
			const shade = random(`${seed}c${i}`) > 0.5;
			return (
				<g key={i}>
					<circle cx={cx} cy={cy} r={r + 6} fill={INK} opacity={0.35} />
					<circle cx={cx} cy={cy} r={r} fill={shade ? color : lerpColor(color, '#FFFFFF', 0.25)} />
					<circle cx={cx - r * 0.25} cy={cy - r * 0.3} r={r * 0.45} fill="#FFFFFF" opacity={0.18} />
				</g>
			);
		})}
	</g>
);

export {lerpColor};
