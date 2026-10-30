import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pomgoku} from './characters';
import {Vegenade} from './characters3';
import {GoldAura, Litcheezer, litFlickHand, PomVeins} from './characters6';
import {Recap6} from './Recap6';
import {INK, SharedDefs, SW} from './parts';
import {Dust, H, W} from './scenery';
import {Impact, SpeedLines} from './scenery2';
import timeline from './timeline6.json';
import voices from './voices6.json';

const TL = timeline as any;
const V = voices as Record<string, {mouth: number[]; text: string}>;
const SC = TL.scenes;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const ip = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, {...clamp, easing: e});

/** Ouverture de bouche pour la réplique `k` à l'image `f` (moyenne lissée). */
const mouthOf = (k: string, f: number) => {
	const v = TL.voices[k];
	const m = V[k].mouth;
	const i = f - v.start;
	if (i < 0 || i >= m.length) return 0;
	return Math.min(1, (m[i] ?? 0) * 0.7 + (m[i - 1] ?? 0) * 0.3);
};

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		<SharedDefs />
		<g transform={cam}>{children}</g>
	</svg>
);

/** Caméra qui centre le point (fx, fy) à l'écran avec un zoom (zoom 1 + centre de l'image = plan large). */
const focus = (zoom: number, fx: number, fy: number, sx = 0, sy = 0, rot = 0) =>
	`translate(${sx},${sy}) translate(540,960) rotate(${rot}) scale(${zoom}) translate(${-fx},${-fy})`;

const shake = (f: number, amp: number) => [
	(random(`sx${f}`) - 0.5) * 2 * amp,
	(random(`sy${f}`) - 0.5) * 2 * amp,
];

const Flash: React.FC<{f: number; at: number; color?: string; len?: number; peak?: number}> = ({f, at, color = '#FFF6D8', len = 12, peak = 1}) => (
	<AbsoluteFill style={{background: color, opacity: ip(f, [at - 1, at + 1, at + len], [0, peak, 0], Easing.linear)}} />
);

const Vignette: React.FC<{o?: number}> = ({o = 0.6}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, transparent 48%, rgba(8,4,10,${o}) 100%)`}} />
);

/* ------------------------------------------------------------------ CARTON D'OUVERTURE (2 s) */
const OpeningCard: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const slam = spring({frame: f, fps, config: {damping: 9, stiffness: 160}});
	const sub = spring({frame: f - 12, fps, config: {damping: 14}});
	const [sx, sy] = shake(f, interpolate(f, [2, 5, 14], [0, 16, 0], clamp));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #7A2E10, #1A0606 70%)'}}>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<g transform={`translate(540,700) rotate(${f * 0.8})`} opacity={0.3}>
					{Array.from({length: 24}, (_, i) => <path key={i} transform={`rotate(${i * 15})`} d="M-10,120 L0,1400 L10,120 Z" fill="#FFD23F" />)}
				</g>
			</svg>
			<div style={{position: 'absolute', top: 600, width: '100%', textAlign: 'center', transform: `translate(${sx}px,${sy}px) scale(${interpolate(slam, [0, 1], [3, 1])})`}}>
				<div style={{fontFamily: 'Bangers', fontSize: 210, lineHeight: 1, letterSpacing: 6, color: '#FFD23F', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textShadow: '0 14px 0 #B3261E'}}>FRUIT BALL Z</div>
			</div>
			<div style={{position: 'absolute', top: 900, left: 60, right: 60, textAlign: 'center', opacity: sub, transform: `translateY(${(1 - sub) * 50}px)`}}>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 80, color: '#FFFFFF', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>Épisode 6</div>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 92, lineHeight: 1.1, marginTop: 20, color: '#FF8AB0', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>Les formes de Litcheezer</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ DÉCOR : champ de bataille de Namek en ruines */
const NamekTree: React.FC<{x: number; y: number; s: number; f: number; seed: number; broken?: boolean}> = ({x, y, s, f, seed, broken}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(f * 0.05 + seed) * 2 + (broken ? 24 : 0)})`}>
		<path d="M-10,0 Q-14,-120 -4,-230 L8,-230 Q14,-120 10,0 Z" fill="#6A7A5A" stroke={INK} strokeWidth={5} />
		{!broken && (
			<>
				<circle cx={0} cy={-290} r={78} fill="#2E8A4A" stroke={INK} strokeWidth={7} />
				<circle cx={-22} cy={-312} r={40} fill="#58B86A" opacity={0.75} />
			</>
		)}
	</g>
);

const BrokenDome: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={4} rx={200} ry={26} fill="#000" opacity={0.25} filter="url(#blur8)" />
		<path d="M-170,0 C-170,-150 -100,-210 -20,-220 L10,-150 L-30,-110 L40,-60 L20,0 Z" fill="#D8D1BC" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
		<path d="M60,0 L90,-90 L130,-60 L170,0 Z" fill="#C9C0A6" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
		<ellipse cx={-90} cy={-100} rx={26} ry={20} fill="#2E3A44" stroke={INK} strokeWidth={5} />
		{[[-150, 8, 30], [120, 12, 22], [10, 16, 18]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill="#B8AE94" stroke={INK} strokeWidth={5} />)}
	</g>
);

/** Ciel de Namek qui s'assombrit (`dark` 0 -> 1, teinte violette), sol rocheux, ruines, fumée. */
const Battlefield: React.FC<{f: number; dark?: number; gold?: number; wind?: number}> = ({f, dark = 0.4, gold = 0, wind = 0.3}) => {
	const hz = 1180;
	return (
		<g>
			<defs>
				<linearGradient id="bsky6" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#1E6A6A" />
					<stop offset="0.6" stopColor="#5FB8A8" />
					<stop offset="1" stopColor="#B8EAD6" />
				</linearGradient>
				<linearGradient id="bground6" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#5EA88A" />
					<stop offset="1" stopColor="#24563E" />
				</linearGradient>
			</defs>
			<rect x={-800} y={-800} width={W + 1600} height={hz + 840} fill="url(#bsky6)" />
			{[[240, 300, 60], [520, 220, 44], [860, 340, 52]].map(([x, y, r], i) => (
				<g key={i} opacity={1 - dark * 0.7}>
					<circle cx={x} cy={y} r={r * 2.4} fill="#FFFBD8" opacity={0.35} filter="url(#blur20)" />
					<circle cx={x} cy={y} r={r} fill="#FFF8D0" stroke="#F2E39A" strokeWidth={6} />
				</g>
			))}
			{/* nuages bas qui filent avec le vent */}
			{[[100, 520, 1.2], [700, 600, 1.0], [400, 760, 0.8], [900, 820, 0.9]].map(([x, y, s], i) => (
				<g key={i} transform={`translate(${((x + f * (0.8 + i * 0.3) * (1 + wind * 4)) % 1700) - 300},${y}) scale(${s})`} opacity={0.75}>
					{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill="#D6E8E4" />)}
				</g>
			))}
			{/* collines et arbres lointains */}
			<path d={`M-800,${hz - 60} Q200,${hz - 170} 540,${hz - 90} Q860,${hz - 30} 1880,${hz - 140} L1880,${hz + 20} L-800,${hz + 20} Z`} fill="#3E8A78" stroke={INK} strokeWidth={6} />
			<NamekTree x={120} y={hz - 80} s={0.45} f={f} seed={1} />
			<NamekTree x={900} y={hz - 60} s={0.5} f={f} seed={2} broken />
			<rect x={-800} y={hz} width={W + 1600} height={H - hz + 800} fill="url(#bground6)" />
			<path d={`M-800,${hz} L1880,${hz}`} stroke={INK} strokeWidth={6} />
			{/* rochers et fissures du sol */}
			{[[-60, hz + 120, 1.2], [1100, hz + 160, 1.4], [170, hz + 40, 0.6], [930, hz + 60, 0.7]].map(([x, y, s], i) => (
				<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
					<path d="M-120,0 L-90,-90 L-10,-130 L80,-100 L120,0 Z" fill="#6A7E74" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
					<path d="M-70,-80 L-10,-110 L50,-90" stroke="#A8BCB2" strokeWidth={8} fill="none" strokeLinecap="round" />
				</g>
			))}
			{['M200,1420 L260,1460 L240,1520 L300,1560', 'M760,1380 L720,1440 L780,1480', 'M480,1800 L540,1760 L600,1820 L680,1790'].map((d, i) => (
				<path key={i} d={d} stroke="#173A2A" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			))}
			<BrokenDome x={320} y={hz + 20} s={0.45} />
			<BrokenDome x={760} y={hz + 30} s={0.5} />
			{/* colonnes de fumée des ruines */}
			{[[320, hz - 40], [770, hz - 40]].map(([x, y], i) => (
				<g key={i}>
					{Array.from({length: 7}, (_, j) => {
						const t = ((f * 0.6 + j * 26 + i * 40) % 180) / 180;
						return <circle key={j} cx={x + t * 120 * (1 + wind) + Math.sin(t * 6 + j) * 14} cy={y - t * 520} r={30 + t * 70} fill="#4A4A50" opacity={0.45 * (1 - t)} />;
					})}
				</g>
			))}
			{/* assombrissement violet (l'énergie de Litcheezer) et lueur dorée (la rage de Pomgoku) */}
			<rect x={-800} y={-800} width={W + 1600} height={H + 1600} fill="#2A0A30" opacity={dark * 0.55} />
			{gold > 0 && <rect x={-800} y={-800} width={W + 1600} height={H + 1600} fill="#FFB020" opacity={gold * 0.18} />}
		</g>
	);
};

/** Traînées de vent horizontales. */
const WindStreaks: React.FC<{f: number; p: number; dir?: number}> = ({f, p, dir = 1}) => {
	if (p <= 0) return null;
	return (
		<g opacity={p * 0.7}>
			{Array.from({length: 18}, (_, i) => {
				const y = random(`wy${i}`) * 2200 - 140;
				const x = ((f * (40 + random(`wv${i}`) * 30) * dir + random(`wx${i}`) * 2400) % 2400 + 2400) % 2400 - 700;
				return <path key={i} d={`M${x},${y} q120,-${10 + i % 3 * 6} 260,0`} stroke="#F2FFFA" strokeWidth={4 + (i % 3) * 2} fill="none" strokeLinecap="round" />;
			})}
		</g>
	);
};

/** Énergie violette qui crépite autour de Litcheezer. */
const DarkEnergy: React.FC<{f: number; x: number; y: number; s: number; p: number}> = ({f, x, y, s, p}) => {
	if (p <= 0) return null;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} opacity={p}>
			<ellipse cx={0} cy={-260} rx={300} ry={360} fill="#B04AD0" opacity={0.3 + 0.1 * Math.sin(f * 0.6)} filter="url(#blur20)" />
			{Array.from({length: 6}, (_, i) => {
				if ((f + i * 5) % 9 > 3) return null;
				let d = `M${(random(`de${i}${Math.floor(f / 3)}`) - 0.5) * 300},${-500}`;
				for (let k = 1; k < 6; k++) d += ` L${(random(`de${i}${k}${Math.floor(f / 3)}`) - 0.5) * 360},${-500 + k * 90}`;
				return <path key={i} d={d} stroke="#F0C8FF" strokeWidth={6} fill="none" strokeLinejoin="round" />;
			})}
		</g>
	);
};

/* ------------------------------------------------------------------ SCÈNE 1 : transformation (12 s) */
const LX = 600, LY = 1760; // pieds de Litcheezer
const formAt = (f: number) => ip(f, [250, 560], [0, 1], Easing.inOut(Easing.quad));
const litScale = (f: number) => 0.85 * (1 + ip(f, TL.grow, [0, 1], Easing.inOut(Easing.cubic)));

const Scene1: React.FC<{f: number}> = ({f}) => {
	const [a, b, c, d] = TL.s1shots;
	const form = formAt(f);
	const s = litScale(f);
	const dark = ip(f, [a, d], [0.35, 0.8]);
	const crack = ip(f, [a + 10, a + 70], [0, 1]) * (1 - ip(f, [b + 40, c], [0, 1]));
	const amp = ip(f, [a, SC.s1[1]], [2, 14]);
	const [sx, sy] = shake(f, amp);
	const energy = ip(f, [a, a + 30], [0.4, 1]);
	let cam: string;
	let heroes = false;
	if (f < b) cam = focus(ip(f, [a, b], [3.4, 3.0]), LX, LY - 370 * s, sx, sy);           // gros plan sur la coque
	else if (f < c) cam = focus(ip(f, [b, c], [2.4, 2.0]), LX, LY - 520 * s, sx, sy);      // épines qui percent
	else if (f < d) { cam = focus(1.25, 420, 1500, sx, sy); heroes = true; }               // les héros reculent
	else cam = focus(ip(f, [d, SC.s1[1]], [1.15, 0.9]), 560, ip(f, [d, SC.s1[1]], [1450, 1250]), sx, sy, 0); // contre-plongée, il grandit
	const push = ip(f, [c, d], [0, 1], Easing.out(Easing.quad));
	return (
		<>
			<Svg cam={cam}>
				<Battlefield f={f} dark={dark} wind={0.6 + push} />
				<DarkEnergy f={f} x={LX} y={LY} s={s} p={energy} />
				{heroes ? (
					<g>
						<Litcheezer x={LX + 380} y={LY} scale={s} frame={f} form={form} flip darken={0.25} look={[-1, 0]} />
						<Pomgoku x={240 - push * 90} y={1720} scale={0.5} frame={f} mood="shock" look={[1, -0.3]} lean={-10 - push * 8} wind={1.6} armL={70} armR={110} />
						<Vegenade x={430 - push * 70} y={1740} scale={0.5} frame={f} mood="angry" look={[1, -0.3]} lean={-8 - push * 6} crossed={false} armL={60} armR={120} />
						<Dust x={330} y={1800} t={push * 0.5} n={12} seed="s1d" color="#9AB8A4" spread={0.9} opacity={0.35} />
					</g>
				) : (
					<Litcheezer x={LX} y={LY} scale={s} frame={f} form={form} crack={crack} flip look={[-0.6, f < b ? 0.1 : -0.1]} armL={30 + form * 20} armR={30 + form * 20} />
				)}
				<WindStreaks f={f} p={heroes ? 1 : ip(f, [d, d + 20], [0.3, 0.8])} dir={-1} />
			</Svg>
			{/* pulsations de lumière à chaque poussée */}
			{f >= d && <AbsoluteFill style={{background: '#F0B0FF', opacity: Math.max(0, Math.sin((f - d) * 0.35)) * 0.12}} />}
			<Flash f={f} at={b} color="#F0D0FF" len={8} peak={0.6} />
			<Flash f={f} at={SC.s1[1] - 14} color="#FFF0FF" len={16} />
			<Vignette o={0.6} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 2 : la deuxième forme domine l'écran (8 s) */
const L2S = 1.7; // échelle de la deuxième forme

const Scene2: React.FC<{f: number}> = ({f}) => {
	const [a, b] = SC.s2;
	const LX = 740;
	const l1 = TL.voices.l1;
	const headY = LY - 430 * L2S;
	let cam: string;
	let react = 0;
	if (f < l1.start) cam = focus(ip(f, [a, l1.start], [1.0, 0.95]), 540, ip(f, [a, l1.start], [1500, 1150]));   // la caméra remonte le long du monstre
	else if (f < l1.end) cam = focus(ip(f, [l1.start, l1.end], [1.25, 1.55]), LX, headY);
	else if (f < l1.end + 22) { cam = focus(2.6, 240, 1720 - 240 * 0.45); react = 1; }                         // Pomgoku déglutit
	else { cam = focus(2.6, 420, 1740 - 230 * 0.45); react = 2; }                                                // Végénade serre les poings
	return (
		<>
			<Svg cam={cam}>
				<Battlefield f={f} dark={0.75} wind={0.4} />
				<DarkEnergy f={f} x={LX} y={LY} s={L2S} p={0.55} />
				<Litcheezer x={LX} y={LY} scale={L2S} frame={f} form={1} flip mouth={mouthOf('l1', f)} look={[-0.7, 0.45]} armL={25} armR={25} />
				<Pomgoku x={240} y={1720} scale={0.45} frame={f} mood={react === 1 ? 'fear' : 'shock'} look={[1, -0.8]} lean={-4} wind={0.6} armL={30} armR={30} />
				<Vegenade x={420} y={1740} scale={0.45} frame={f} mood="angry" look={[1, -0.8]} crossed={react !== 2} armL={20} armR={20} rage={react === 2 ? 0.5 : 0} />
			</Svg>
			{react === 1 && (
				<Svg cam={focus(2.6, 240, 1720 - 240 * 0.45)}>
					{/* goutte de sueur */}
					<path d={`M${300},${1590 + (f - l1.end) * 2} q-14,26 0,36 q14,-10 0,-36 Z`} fill="#9FE0FF" stroke={INK} strokeWidth={4} />
				</Svg>
			)}
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 : Végénade charge, pichenette (13 s) */
const VX0 = 300, VY = 1760;

/** Position de Végénade pendant la charge, le vol au ralenti et les rebonds. */
const vegPath = (f: number): {x: number; y: number; rot: number} => {
	const {charge, flick, land, bounce} = TL;
	if (f < charge) return {x: VX0, y: VY, rot: 0};
	if (f < flick) {
		const p = ip(f, [charge, flick], [0, 1], Easing.in(Easing.quad));
		return {x: VX0 + p * 120, y: VY - Math.sin(p * Math.PI) * 60, rot: 18 * p};
	}
	if (f < land) {
		// renvoyé en arrière, au ralenti
		const p = (f - flick) / (land - flick);
		return {x: 420 - p * 300, y: VY - 140 - Math.sin(p * Math.PI) * 420 + p * 140, rot: 18 - p * 340};
	}
	if (f < bounce) {
		const p = (f - land) / (bounce - land);
		return {x: 120 - p * 50, y: VY - Math.sin(p * Math.PI) * 120, rot: -322 - p * 40};
	}
	return {x: 70, y: VY - 20, rot: -86};
};

const Scene3: React.FC<{f: number}> = ({f}) => {
	const [a, b] = SC.s3;
	const l2 = TL.voices.l2, l3 = TL.voices.l3;
	const {charge, flick, land, bounce} = TL;
	const rage = ip(f, [a, a + 30], [0.2, 1]);
	const LXs = 760; // Litcheezer dans cette scène (à droite)
	const lit = <Litcheezer x={LXs} y={LY} scale={L2S} frame={f} form={1} flip look={[-1, 0.4]} flick={ip(f, [flick - 6, flick], [0, 1]) * (1 - ip(f, [flick + 30, flick + 50], [0, 1]))}
		mouth={mouthOf('l3', f)} brow={f >= l3.start - 10 ? 1 : 0} armL={25} armR={25} />;
	const vp = vegPath(f);
	const slow = f >= flick && f < land;
	if (f < charge) {
		// gros plan : Végénade, pépins qui brillent
		const z = f < l2.start ? ip(f, [a, l2.start], [2.0, 2.4]) : 2.5;
		const [sx, sy] = shake(f, f >= l2.start ? 4 : 1.5);
		return (
			<>
				<Svg cam={focus(z, VX0 + 20, VY - 250 * 0.6, sx, sy)}>
					<Battlefield f={f} dark={0.7} wind={0.4} />
					<Vegenade x={VX0} y={VY} scale={0.6} frame={f} mood="angry" rage={rage} look={[1, -0.4]} crossed={false} armL={30} armR={30} mouth={mouthOf('l2', f)} />
				</Svg>
				<Vignette o={0.55} />
			</>
		);
	}
	let cam: string;
	if (f < flick) cam = focus(1.2, 560, 1440);
	else if (f < land) cam = focus(1.0, 400, 1300, 0, 0, 0);
	else if (f < l3.start) cam = focus(ip(f, [land, land + 10], [1.3, 1.6]), 110, 1620, ...shake(f, ip(f, [land, land + 14], [18, 0])) as [number, number]);
	else if (f < l3.end + 4) cam = focus(1.6, LXs - 40, LY - 440 * L2S);
	else cam = focus(1.8, 80, 1650);
	const dustT = f >= land ? Math.min(1, (f - land) / 40) : 0;
	const dust2 = f >= bounce ? Math.min(1, (f - bounce) / 40) : 0;
	const [hx, hy] = litFlickHand(LXs, LY, L2S, 1);
	return (
		<>
			<Svg cam={cam}>
				<Battlefield f={f} dark={0.7} wind={0.4} />
				{lit}
				{f >= charge && f < flick && <SpeedLines frame={f} angle={0} n={20} opacity={0.6} />}
				{f >= flick - 2 && f < flick + 10 && <Impact x={hx - 30} y={hy} s={ip(f, [flick - 2, flick + 4], [0.4, 1.3])} />}
				{dustT > 0 && <Dust x={110} y={VY + 60} t={dustT} n={16} seed="d3" color="#9AB8A4" spread={0.9} opacity={0.55 - dustT * 0.3} />}
				{dust2 > 0 && <Dust x={70} y={VY + 60} t={dust2} n={12} seed="d4" color="#9AB8A4" spread={0.7} opacity={0.45 - dust2 * 0.3} />}
				<Vegenade x={vp.x} y={vp.y} scale={0.6} frame={f} mood={f >= flick ? 'shock' : 'angry'} rage={f < flick ? 1 : 0.2} look={[1, -0.2]} lean={vp.rot} crossed={false}
					armL={f < flick ? 40 : 140} armR={f < flick ? 100 : 150} shadow={f < flick || f >= bounce} />
			</Svg>
			{slow && (
				<>
					<AbsoluteFill style={{background: 'rgba(40,10,60,0.18)'}} />
					<AbsoluteFill style={{borderTop: '120px solid #000', borderBottom: '120px solid #000'}} />
					<div style={{position: 'absolute', top: 150, right: 60, fontFamily: 'Luckiest Guy', fontSize: 54, color: '#FFFFFF', WebkitTextStroke: '7px #000', paintOrder: 'stroke fill', opacity: f % 20 < 14 ? 0.9 : 0.4}}>RALENTI</div>
				</>
			)}
			<Flash f={f} at={flick} color="#FFFFFF" len={8} peak={0.9} />
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 : Pomgoku tremble, veines dorées (12 s) */
const PX = 400, PY = 1760, PS = 0.62;

const Scene4: React.FC<{f: number}> = ({f}) => {
	const [a, b, c] = TL.s4shots;
	const l4 = TL.voices.l4;
	const veins = ip(f, TL.veins, [0, 1]);
	const tremble = ip(f, [a, l4.start], [1.5, 6]);
	const jx = (random(`pj${f}`) - 0.5) * tremble * 2;
	const gold = veins * 0.6;
	let cam: string;
	let who: 'pom' | 'lit' | 'veg' = 'pom';
	if (f < b) cam = focus(ip(f, [a, b], [1.2, 1.4]), PX + 60, 1500);
	else if (f < c) cam = focus(ip(f, [b, l4.start], [1.6, 2.8]), PX, PY - 250 * PS);       // la caméra se resserre sur son visage
	else if (f < c + 55) { cam = focus(1.9, 840, LY - 440 * L2S); who = 'lit'; }              // Litcheezer hausse un sourcil
	else { cam = focus(2.2, 150, 1720); who = 'veg'; }                                        // Végénade relève la tête
	return (
		<>
			<Svg cam={cam}>
				<Battlefield f={f} dark={0.7} gold={gold} wind={0.4} />
				<Litcheezer x={840} y={LY} scale={L2S} frame={f} form={1} flip look={who === 'lit' ? [-1, 0.6] : [-1, 0.4]} brow={who === 'lit' ? ip(f, [c, c + 12], [0, 1]) : 0} armL={25} armR={25} />
				<Vegenade x={150} y={1720} scale={0.48} frame={f} mood={who === 'veg' ? 'shock' : 'angry'} lean={who === 'veg' ? -70 : -86} crossed={false} armL={150} armR={100} look={who === 'veg' ? [1, -0.5] : [0, 0]} rage={0.1} shadow={false} />
				<Pomgoku x={PX + jx} y={PY} scale={PS} frame={f} mood={f >= l4.start ? 'angry' : 'determined'} look={f < b ? [-1, 0.3] : [0.3, 0]} mouth={mouthOf('l4', f)} armL={30} armR={30} fistR wind={0.6 + veins} />
				<PomVeins x={PX + jx} y={PY} scale={PS} frame={f} p={veins} />
				{/* poings serrés : petites étincelles dorées */}
				{veins > 0.4 && Array.from({length: 6}, (_, i) => {
					const t = ((f + i * 7) % 24) / 24;
					return <circle key={i} cx={PX + jx + (random(`sp${i}`) - 0.5) * 260} cy={PY - 120 - t * 260} r={5} fill="#FFE27A" opacity={(1 - t) * veins} />;
				})}
			</Svg>
			{who === 'pom' && f >= b && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,210,63,0) 40%, rgba(255,170,30,0.25) 100%)', opacity: veins}} />}
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 : l'aura dorée se réveille (11 s) */
const PEBBLES = Array.from({length: 16}, (_, i) => ({x: (random(`pbx${i}`) - 0.5) * 620, s: 10 + random(`pbs${i}`) * 22, d: random(`pbd${i}`) * 40, seed: i}));

const Scene5: React.FC<{f: number}> = ({f}) => {
	const [a, b, c] = TL.s5shots;
	const {aura, flash} = TL;
	const p = ip(f, [aura, flash], [0.2, 1], Easing.in(Easing.quad));
	const wind = ip(f, [a, flash], [0.6, 2.4]);
	const [sx, sy] = shake(f, ip(f, [a, flash], [2, 16]));
	const PXc = 540, PYc = 1720, PSc = 0.7;
	let cam: string;
	if (f < b) cam = focus(ip(f, [a, b], [1.0, 1.1]), 540, 1400, sx, sy);
	else if (f < c) cam = focus(ip(f, [b, c], [1.3, 1.6]), PXc, PYc - 260 * PSc, sx, sy);
	else cam = focus(ip(f, [c, flash], [2.6, 3.6]), PXc, PYc - 250 * PSc, sx, sy);
	return (
		<>
			<Svg cam={cam}>
				<Battlefield f={f} dark={0.7 - p * 0.3} gold={p} wind={wind} />
				<Litcheezer x={960} y={LY} scale={L2S} frame={f} form={1} flip look={[-1, 0.4]} darken={0.3} brow={0.4} armL={25} armR={25} />
				<GoldAura x={PXc} y={PYc} scale={PSc * 1.1} frame={f} p={p} />
				{/* cailloux qui s'élèvent */}
				{PEBBLES.map(({x, s, d, seed}) => {
					const rise = ip(f, [a + d, a + d + 120], [0, 1]);
					const bob = Math.sin(f * 0.1 + seed) * 16;
					return (
						<g key={seed} transform={`translate(${PXc + x * (1 + p * 0.2)},${PYc - 10 - rise * (120 + seed * 22) + bob * rise}) rotate(${f * (seed % 2 ? 2 : -2)})`}>
							<path d={`M${-s},0 L${-s * 0.5},${-s * 0.8} L${s * 0.6},${-s * 0.7} L${s},${s * 0.2} L0,${s * 0.8} Z`} fill="#7A8A80" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
						</g>
					);
				})}
				<Pomgoku x={PXc} y={PYc} scale={PSc} frame={f} mood="angry" look={[0.2, -0.1]} armL={30} armR={30} fistR wind={wind * 1.6} />
				<PomVeins x={PXc} y={PYc} scale={PSc} frame={f} p={1} />
				<WindStreaks f={f} p={ip(f, [a, flash], [0.3, 1])} />
			</Svg>
			<AbsoluteFill style={{background: '#FFD23F', opacity: ip(f, [flash - 4, flash + 2], [0, 1], Easing.linear)}} />
			<AbsoluteFill style={{background: '#FFFFFF', opacity: ip(f, [flash, flash + 4, SC.s5[1]], [0, 0.8, 0], Easing.linear)}} />
			<Vignette o={0.5 - p * 0.2} />
		</>
	);
};

/* ------------------------------------------------------------------ À SUIVRE */
const Suivre: React.FC<{f: number}> = ({f}) => {
	const t = f - SC.suivre[0];
	const a = interpolate(t, [4, 22, 75, 90], [0, 1, 1, 0], clamp);
	const gold = interpolate(t, [0, 30], [1, 0], clamp);
	return (
		<AbsoluteFill style={{background: `rgb(${Math.round(255 * gold * 0.9)},${Math.round(190 * gold * 0.9)},${Math.round(40 * gold)})`, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: 'Luckiest Guy', fontSize: 110, color: '#FFB347', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.92 + a * 0.08})`}}>À suivre...</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ TEASER : Super Pomgoku */
const Bolt: React.FC<{seed: string; x: number; color?: string}> = ({seed, x, color = '#FFF4B0'}) => {
	let d = `M${x},0`;
	let cx = x;
	for (let i = 1; i <= 8; i++) { cx += (random(`${seed}${i}`) - 0.5) * 160; d += ` L${cx},${i * 110}`; }
	return <path d={d} stroke={color} strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.95} />;
};

const Teaser: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const [a, b, c] = TL.teaserShots;
	const end = SC.teaser[1];
	const strikes = [a + 12, a + 44, b + 14, b + 46, c + 8];
	const strike = strikes.find((k) => f >= k && f < k + 6);
	const lit = strike !== undefined ? 1 - (f - strike) / 6 : 0;
	let shot: React.ReactNode;
	if (f < b) {
		// ciel d'orage, éclairs dorés, un cratère qui fume au loin
		shot = (
			<Svg cam={focus(ip(f, [a, b], [1.0, 1.12]), 540, 1000)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#3A3010' : '#0A0C10'} />
				{Array.from({length: 6}, (_, i) => (
					<ellipse key={i} cx={((i * 260 + f * 3) % 1500) - 200} cy={300 + (i % 3) * 160} rx={300} ry={90} fill="#1A1E26" opacity={0.9} />
				))}
				{lit > 0 && <Bolt seed={`t${strike}`} x={260 + (strike! % 3) * 240} />}
				<path d="M0,1500 Q540,1420 1080,1500 L1080,2000 L0,2000 Z" fill="#050608" />
				<ellipse cx={540} cy={1480} rx={160} ry={30} fill="#FFC21F" opacity={0.5 + 0.3 * Math.sin(f * 0.5)} filter="url(#blur20)" />
			</Svg>
		);
	} else if (f < c) {
		// silhouette de dos, tiges qui se dressent, contour doré
		const up = ip(f, [b, c], [0.3, 1]);
		shot = (
			<Svg cam={focus(ip(f, [b, c], [1.0, 1.2]), 540, 1250)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#4A3A10' : '#0C0A06'} />
				{lit > 0 && <Bolt seed={`u${strike}`} x={820} />}
				<GoldAura x={540} y={1650} scale={0.9} frame={f} p={0.5 * up} h={600} />
				<Pomgoku x={540} y={1650} scale={0.8} frame={f} mood="angry" darken={0.96} wind={2.5} armL={20} armR={20} shadow={false} />
			</Svg>
		);
	} else {
		// gros plan : deux yeux turquoise dans le noir
		const z = ip(f, [c, end], [1.0, 1.25]);
		shot = (
			<Svg cam={focus(z, 540, 900)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#060504" />
				{lit > 0 && <rect width={W} height={H} fill="#FFE27A" opacity={lit * 0.3} />}
				<ellipse cx={540} cy={900} rx={520} ry={480} fill="#FFC21F" opacity={0.08 + lit * 0.1} filter="url(#blur20)" />
				{[[390, 860], [690, 860]].map(([x, y], i) => (
					<g key={i} transform={`rotate(${i ? -14 : 14},${x},${y})`}>
						<ellipse cx={x} cy={y} rx={110} ry={40} fill="#3AF0D0" opacity={0.6} filter="url(#blur8)" />
						<ellipse cx={x} cy={y} rx={70} ry={18} fill="#D8FFF6" />
					</g>
				))}
			</Svg>
		);
	}
	const titleAt = c + 20;
	const title = spring({frame: f - titleAt, fps, config: {damping: 9, stiffness: 150}});
	const out = ip(f, [end - 20, end], [0, 1], Easing.linear);
	return (
		<AbsoluteFill>
			{shot}
			<Vignette o={0.65} />
			<div style={{position: 'absolute', top: 130, width: '100%', textAlign: 'center'}}>
				<span style={{fontFamily: 'Luckiest Guy', fontSize: 66, color: '#FFFFFF', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill'}}>Dans le prochain épisode</span>
			</div>
			{f >= titleAt && (
				<div style={{position: 'absolute', top: 1120, width: '100%', textAlign: 'center', transform: `scale(${interpolate(title, [0, 1], [2.6, 1])})`}}>
					<div style={{fontFamily: 'Bangers', fontSize: 150, lineHeight: 1, letterSpacing: 5, color: '#FFD23F', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 #B3261E'}}>SUPER<br />POMGOKU</div>
				</div>
			)}
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ SOUS-TITRES */
const Subtitles: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	let cur: {text: string; from: number; to: number} | null = null;
	for (const v of Object.values(TL.voices) as any[]) {
		for (const s of v.subs) if (f >= s.from && f < s.to + 6) cur = s;
	}
	if (!cur) return null;
	const pop = spring({frame: f - cur.from, fps, config: {damping: 12, stiffness: 220}});
	return (
		<div style={{position: 'absolute', left: 50, right: 50, top: 1500, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{
				fontFamily: 'Luckiest Guy', fontSize: 72, lineHeight: 1.12, textAlign: 'center', color: '#FFFFFF',
				WebkitTextStroke: '15px #000', paintOrder: 'stroke fill', letterSpacing: 1,
				textShadow: '0 7px 0 rgba(0,0,0,0.55)', transform: `scale(${0.75 + pop * 0.25})`,
			}}>
				{cur.text}
			</div>
		</div>
	);
};

export const Episode6: React.FC = () => {
	const f = useCurrentFrame();
	let scene: React.ReactNode;
	if (f < SC.recap[0]) scene = <OpeningCard f={f} />;
	else if (f < SC.s1[0]) scene = <Recap6 f={f} from={SC.recap[0]} to={SC.recap[1]} />;
	else if (f < SC.s2[0]) scene = <Scene1 f={f} />;
	else if (f < SC.s3[0]) scene = <Scene2 f={f} />;
	else if (f < SC.s4[0]) scene = <Scene3 f={f} />;
	else if (f < SC.s5[0]) scene = <Scene4 f={f} />;
	else if (f < SC.suivre[0]) scene = <Scene5 f={f} />;
	else if (f < SC.teaser[0]) scene = <Suivre f={f} />;
	else scene = <Teaser f={f} />;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{scene}
			<Subtitles f={f} />
			<Audio src={staticFile('audio/ep6/mix.wav')} />
		</AbsoluteFill>
	);
};
