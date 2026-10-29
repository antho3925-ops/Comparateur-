import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CoconutShip, PetitPoirsan, Pomgoku, Raditz, raditzHand} from './characters';
import {INK, SharedDefs, SW} from './parts';
import {Crater, Dust, FallingLeaves, Grass, H, Orchard, W} from './scenery';
import timeline from './timeline.json';
import voices from './voices.json';

type VKey = keyof typeof voices;
const TL = timeline as any;
const V = voices as Record<string, {mouth: number[]; text: string}>;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const ip = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, {...clamp, easing: e});

/** Ouverture de bouche pour la réplique `k` à l'image `f` (moyenne lissée). */
const mouthOf = (k: VKey | string, f: number) => {
	const v = TL.voices[k];
	const m = V[k].mouth;
	const i = f - v.start;
	if (i < 0 || i >= m.length) return 0;
	const a = m[i] ?? 0;
	const b = m[i - 1] ?? 0;
	return Math.min(1, a * 0.7 + b * 0.3);
};

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		<SharedDefs />
		<g transform={cam}>{children}</g>
	</svg>
);

const camera = (zoom: number, cx: number, cy: number, sx = 0, sy = 0, rot = 0) =>
	`translate(${sx},${sy}) translate(${cx},${cy}) rotate(${rot}) scale(${zoom}) translate(${-cx},${-cy})`;

const shake = (f: number, amp: number) => [
	(random(`sx${f}`) - 0.5) * 2 * amp,
	(random(`sy${f}`) - 0.5) * 2 * amp,
	(random(`sr${f}`) - 0.5) * amp * 0.05,
];

/* ------------------------------------------------------------------ SCÈNE 1 */
const Scene1: React.FC<{f: number}> = ({f}) => {
	const talking = f >= TL.voices.l1.start && f < TL.voices.l1.end;
	const ph = (((f - 10) % 30) + 30) % 30;
	const hop = Math.sin((Math.PI * ph) / 30);
	const squash = ph < 4 ? (1 - ph / 4) * 0.8 : 0;
	const ph2 = (((f - 10) % 30) + 30) % 30;
	const hop2 = Math.sin((Math.PI * ph2) / 30);
	const zoom = ip(f, [0, 180], [1, 1.07]);
	return (
		<Svg cam={camera(zoom, 540, 1350)}>
			<Orchard frame={f} dark={0} />
			<FallingLeaves frame={f} n={7} />
			<Pomgoku x={350} y={1580 - hop * (talking ? 45 : 85)} frame={f} squash={squash} mood="happy" look={[0.85, 0.25]}
				mouth={mouthOf('l1', f)} armL={40 + hop * 30} armR={talking ? 130 + Math.sin(f * 0.25) * 25 : 60 + hop * 40} lean={Math.sin(f * 0.2) * 3} wind={0.4} />
			<PetitPoirsan x={770} y={1620 - hop2 * 95} frame={f} squash={squash} mood="happy" look={[-0.85, -0.45]} mouth={talking ? 0 : hop2 * 0.5}
				armL={60 + hop2 * 90} armR={60 + hop2 * 90} lean={-Math.sin(f * 0.2) * 4} />
			<Grass frame={f} dark={0} />
		</Svg>
	);
};

/* ------------------------------------------------------------------ SCÈNE 2 */
const Branches: React.FC<{t: number}> = ({t}) => (
	<g>
		{Array.from({length: 14}, (_, i) => {
			const vx = (random(`bx${i}`) - 0.5) * 1700;
			const vy = -900 - random(`by${i}`) * 900;
			const x = 540 + vx * t;
			const y = 1240 + vy * t + 1700 * t * t;
			const s = 0.6 + random(`bs${i}`) * 0.9;
			return (
				<g key={i} transform={`translate(${x},${y}) rotate(${t * 900 * (i % 2 ? 1 : -1) + i * 40}) scale(${s})`}>
					{i % 3 === 0 ? (
						<ellipse rx={40} ry={26} fill="#6B5A48" stroke={INK} strokeWidth={5} />
					) : (
						<>
							<path d="M-60,0 L60,0 M10,0 L40,-30" stroke={INK} strokeWidth={18} strokeLinecap="round" />
							<path d="M-60,0 L60,0 M10,0 L40,-30" stroke="#7A4A22" strokeWidth={10} strokeLinecap="round" />
							<path d="M40,-30 C50,-50 80,-50 86,-34 C76,-24 52,-22 40,-30 Z" fill="#4FAE3B" stroke={INK} strokeWidth={4} />
						</>
					)}
				</g>
			);
		})}
	</g>
);

const Scene2: React.FC<{f: number}> = ({f}) => {
	const crash = TL.crash;
	const dark = ip(f, [180, 236], [0, 0.85]);
	const shadowX = ip(f, [182, 236], [-700, 1800], Easing.linear);
	const shipP = ip(f, [226, crash], [0, 1], Easing.in(Easing.quad));
	const after = f >= crash;
	const t = (f - crash) / 30;
	const amp = after ? ip(f, [crash, crash + 45], [46, 0]) : ip(f, [250, crash], [0, 6]);
	const [sx, sy, sr] = shake(f, amp);
	const lookUp: [number, number] = after ? [0.6, 0.2] : [0.4 * (1 - shipP) + 0.2, -1];
	const blast = after ? ip(f, [crash, crash + 8], [0, 1]) : 0;
	const mood = f < 192 ? 'happy' : 'shock';
	return (
		<>
			<Svg cam={camera(1.07 + (after ? 0.04 : 0), 540, 1350, sx, sy, sr)}>
				<Orchard frame={f} dark={dark} destroyed={after} birds={f < 200} />
				{/* ombre qui passe */}
				<ellipse cx={shadowX} cy={900} rx={900} ry={520} fill="#0A0614" opacity={0.55} filter="url(#blur20)" />
				{!after && f >= 226 && (
					<CoconutShip x={1250 - 710 * shipP} y={-300 + 1540 * shipP} scale={0.3 + 0.75 * shipP} rot={f * 9} frame={f} fire={1} fireAngle={25} />
				)}
				{after && <Crater x={540} y={1300} s={0.85} glow={1} />}
				<Pomgoku x={350 - blast * 30} y={1580} frame={f} mood={mood} darken={dark * 0.45} look={lookUp} lean={-blast * 10} armL={after ? 150 : 40} armR={after ? 150 : 50} mouth={mood === 'shock' ? 0.5 : 0} wind={1 + blast} />
				<PetitPoirsan x={770 + blast * 30} y={1620} frame={f} darken={dark * 0.45} mood={after ? 'fear' : f < 192 ? 'happy' : 'shock'} look={lookUp} lean={blast * 12} armL={after ? 160 : 50} armR={after ? 160 : 50} mouth={after ? 0.6 : 0.3} />
				{after && <Branches t={t} />}
				{after && <Dust x={540} y={1260} t={t * 0.9} n={30} seed="crash" spread={1.3} />}
				<Grass frame={f} dark={dark} wind={1 + blast * 3} />
			</Svg>
			{/* flash */}
			<AbsoluteFill style={{background: '#FFF6D8', opacity: ip(f, [crash - 1, crash + 1, crash + 14], [0, 1, 0], Easing.linear)}} />
			<AbsoluteFill style={{background: '#C8B49A', opacity: ip(f, [crash + 20, 330], [0, 0.88])}} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 */
const Scene3: React.FC<{f: number}> = ({f}) => {
	const steps: number[] = TL.steps;
	const stepIdx = steps.filter((s) => f >= s).length;
	const stepP = (k: number) => ip(f, [steps[k], steps[k] + 8], [0, 1]);
	const progress = Math.min(3, stepIdx - 1 + (stepIdx > 0 ? stepP(stepIdx - 1) : 0) + (stepIdx === 0 ? 0 : 0));
	const sp = Math.max(0, progress) / 3;
	const ry = 1330 + sp * 110;
	const rs = 0.82 + sp * 0.22;
	const sil = ip(f, [404, 430], [1, 0]);
	const zoom = ip(f, [330, 540], [1.0, 1.14]) + ip(f, [400, 404, 430], [0, 0.05, 0.02]);
	const bob = stepIdx > 0 && f < steps[2] + 10 ? Math.sin(stepP(stepIdx - 1) * Math.PI) * -12 : 0;
	const [sx, sy] = shake(f, steps.some((s) => f >= s && f < s + 5) ? 8 : 0);
	return (
		<>
			<Svg cam={camera(zoom, 640, 1180, sx, sy)}>
				<Orchard frame={f} dark={0.85} destroyed birds={false} />
				<Crater x={600} y={1330} s={0.9} glow={0.9 + Math.sin(f * 0.2) * 0.1} />
				<CoconutShip x={600} y={1300} scale={0.55} rot={-8} frame={f} broken={1} />
				<Raditz x={640} y={ry + bob} scale={rs} frame={f} silhouette={sil} darken={0.2} mood="sneer" look={[-0.75, 0.15]}
					mouth={mouthOf('l2', f)} armL={14} armR={14} hair={0.3} />
				<Dust x={600} y={1300} t={1.2 + (f - 330) / 70} n={30} seed="crash" spread={1.6} opacity={ip(f, [330, 400], [1, 0])} />
				<Pomgoku x={235} y={1660} scale={0.72} frame={f} darken={0.35} mood="shock" look={[1, -0.35]} armL={60} armR={70} mouth={0.35} />
				<PetitPoirsan x={95} y={1700} scale={0.62} frame={f} darken={0.35} mood="fear" look={[1, -0.4]} armL={120} armR={120} />
				<Grass frame={f} dark={0.85} wind={0.6} />
			</Svg>
			<AbsoluteFill style={{background: '#C8B49A', opacity: ip(f, [330, 362], [0.88, 0])}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 55% 50%, transparent 45%, rgba(10,0,10,0.7) 100%)'}} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 */
const Scene4Ground: React.FC<{f: number}> = ({f}) => {
	const grab = TL.grab;
	const fly = TL.fly;
	const running = f >= 544 && f < 566;
	const knock = ip(f, [grab, grab + 8], [0, 1], Easing.out(Easing.cubic));
	const pomX = ip(f, [544, 566], [300, 480]) + knock * 170;
	const dashP = ip(f, [grab - 6, grab], [0, 1], Easing.in(Easing.quad));
	const flyP = ip(f, [fly, 684], [0, 1], Easing.in(Easing.quad));
	const dashPos = (p: number): [number, number] => [860 - 440 * p, 1430 + 90 * p - Math.sin(Math.PI * p) * 360];
	let [rx, ry] = dashPos(dashP);
	let rs = 0.95;
	if (f >= fly) {
		rx = 420 - 190 * flyP;
		ry = 1520 - 1900 * flyP;
		rs = 0.95 - 0.45 * flyP;
	}
	const holding = f >= grab;
	const hand = raditzHand(40, -1);
	const son = holding ? (
		<PetitPoirsan x={hand[0]} y={hand[1] + 205} scale={0.8} frame={f} mood="cry" look={[0.6, -0.2]} armL={150} armR={150} shadow={false} kick lean={Math.sin(f * 0.6) * 6} darken={0.2} />
	) : null;
	const reach = ip(f, [616, 628], [60, 165]);
	const pomMood = f < grab ? 'angry' : f < 622 ? 'shock' : 'angry';
	const zoom = ip(f, [540, 604, 690], [1, 1, 1.14]);
	const [sx, sy] = shake(f, ip(f, [grab, grab + 4, grab + 12], [0, 16, 0]) + ip(f, [fly, fly + 4, fly + 18], [0, 10, 0]));
	const ghosts = f >= grab - 6 && f < grab + 3;
	const pomEl = (
		<Pomgoku x={pomX} y={1530 - (running ? Math.abs(Math.sin(f * 0.6)) * 30 : 0)} scale={0.85} frame={f} mood={pomMood as any} darken={0.2} flip={f >= grab}
				look={f < grab ? [1, 0] : f < 612 ? [1, -0.1] : [0.6, -1]} armL={f < grab ? 100 : 40} armR={f < grab ? 100 : reach} reachLen={ip(f, [616, 628], [120, 200])}
				mouth={f >= TL.voices.l3.start ? mouthOf('l3', f) : f >= grab && f < 622 ? 0.6 : 0}
				lean={running ? 12 : f >= grab && f < 620 ? 18 * (1 - ip(f, [608, 620], [0, 1])) : f >= 626 ? -8 : 0} wind={0.8} />
	);
	return (
		<Svg cam={camera(zoom, 560, 1250, sx, sy)}>
			<Orchard frame={f} dark={0.85} destroyed birds={false} />
			<Crater x={640} y={1330} s={0.9} glow={0.8} />
			<CoconutShip x={640} y={1300} scale={0.55} rot={-8} frame={f} broken={1} />
			{ghosts && [0.55, 0.35, 0.18].map((o, i) => {
				const [gx, gy] = dashPos(Math.max(0, dashP - (i + 1) * 0.22));
				return <g key={i} opacity={o}><Raditz x={gx} y={gy} scale={0.95} frame={f} shadow={false} silhouette={0.7} lean={-20} /></g>;
			})}
			{f < grab && <PetitPoirsan x={230} y={1560} scale={0.8} frame={f} darken={0.2} mood="fear" look={[1, -0.3]} armL={120} armR={120} />}
			{f < fly && pomEl}
			<Raditz x={rx} y={ry} scale={rs} frame={f} mood="sneer" look={f < grab ? [-0.8, 0.2] : [0.7, 0.3]} lean={f >= grab - 6 && f < grab ? -22 : f >= fly ? -10 : 0}
				armL={holding ? 40 : 16} armR={f >= grab - 6 && f < grab + 8 ? 110 : f >= fly ? 70 : 16} aura={f >= fly ? 1 : 0} holding={son} holdLeft
				shadow={f < fly} hair={f >= fly ? 1 : 0.2} darken={0.15} />
			{f >= fly && pomEl}
			{f >= fly && Array.from({length: 10}, (_, i) => (
				<line key={i} x1={rx - 160 + i * 34} y1={ry + 60 + ((f * 40 + i * 77) % 300)} x2={rx - 160 + i * 34} y2={ry + 260 + ((f * 40 + i * 77) % 300)} stroke="#FFFFFF" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
			))}
			<Grass frame={f} dark={0.85} wind={f >= fly ? 2.5 : 0.6} />
		</Svg>
	);
};

const Scene4Sky: React.FC<{f: number}> = ({f}) => {
	const p = ip(f, [690, 836], [0, 1], Easing.inOut(Easing.quad));
	const rs = 1.2 - 0.82 * p;
	const rx = 520 + 140 * p;
	const ry = 1500 - 820 * p;
	const hand = raditzHand(40, -1);
	const son = <PetitPoirsan x={hand[0]} y={hand[1] + 205} scale={0.8} frame={f} mood="cry" look={[0.3, 0.6]} armL={150} armR={150} shadow={false} kick lean={Math.sin(f * 0.6) * 6} />;
	const star = ip(f, [826, 832, 840], [0, 1, 0.2]);
	return (
		<Svg>
			<defs>
				<linearGradient id="storm" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#0E0820" />
					<stop offset="0.6" stopColor="#3A1840" />
					<stop offset="1" stopColor="#7A2E2E" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#storm)" />
			{/* nuages qui défilent vers le bas = ascension */}
			{Array.from({length: 9}, (_, i) => {
				const y = ((random(`cy${i}`) * 2400 + (f - 690) * (14 + i * 2)) % 2400) - 300;
				const x = random(`cx${i}`) * W;
				const s = 1 + random(`cs${i}`) * 1.4;
				return (
					<g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.75}>
						{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], k) => <circle key={k} cx={a} cy={b} r={r} fill={i % 2 ? '#4A2E5A' : '#5E3A60'} />)}
					</g>
				);
			})}
			{Array.from({length: 14}, (_, i) => {
				const x = random(`vl${i}`) * W;
				const y = ((f * 60 + i * 173) % 2300) - 300;
				return <line key={i} x1={x} y1={y} x2={x} y2={y + 260} stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round" />;
			})}
			<Raditz x={rx} y={ry} scale={rs} frame={f} mood="sneer" look={[-0.2, 0.8]} lean={10} armL={40} armR={70} aura={1} holdLeft
				holding={son} shadow={false} hair={1} mouth={mouthOf('l4', f)} />
			{star > 0 && (
				<g transform={`translate(${rx + 20},${ry - 300 * rs}) scale(${star * 1.6}) rotate(${f * 6})`}>
					<path d="M0,-60 L12,-12 L60,0 L12,12 L0,60 L-12,12 L-60,0 L-12,-12 Z" fill="#FFFFFF" />
				</g>
			)}
		</Svg>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 */
const Fist: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => {
	const tx = (random(`fx${f}`) - 0.5) * 6;
	const ty = (random(`fy${f}`) - 0.5) * 6;
	return (
		<g transform={`translate(${x + tx},${y + ty}) scale(${s})`} filter="url(#soft)">
			<path d="M-70,90 L-90,420 L90,420 L70,90 Z" fill="#B82020" stroke={INK} strokeWidth={SW} />
			<path d="M-40,110 L-50,420" stroke="#E04A4A" strokeWidth={14} opacity={0.6} />
			<rect x={-122} y={58} width={244} height={56} rx={22} fill="#EDE9E0" stroke={INK} strokeWidth={SW} />
			<rect x={-120} y={-92} width={240} height={168} rx={60} fill="#F7F4EE" stroke={INK} strokeWidth={SW} />
			<path d="M-110,40 Q0,80 110,40 L110,60 Q0,90 -110,60 Z" fill="#D5D0C6" />
			{[-82, -28, 26, 80].map((kx, i) => (
				<g key={i}>
					<ellipse cx={kx} cy={-88} rx={34} ry={38} fill="#F7F4EE" stroke={INK} strokeWidth={SW} />
					<path d={`M${kx - 14},-106 q14,-10 28,0`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
				</g>
			))}
			<rect x={-124} y={-30} width={170} height={56} rx={28} fill="#F7F4EE" stroke={INK} strokeWidth={SW} />
			<path d="M-104,-12 q40,-10 120,0" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
			{/* marques de tension façon manga */}
			{[[-170, -140, -30], [170, -130, 30], [-190, 10, -80], [190, 20, 80]].map(([a, b, r], i) => (
				<path key={i} transform={`translate(${a},${b}) rotate(${r})`} d="M-14,-24 L0,-50 L14,-24 M-30,0 L-60,0 M30,0 L60,0" stroke="#FFE27A" strokeWidth={8} strokeLinecap="round" opacity={0.6 + Math.sin(f * 0.8 + i) * 0.4} />
			))}
		</g>
	);
};

const Scene5: React.FC<{f: number}> = ({f: raw}) => {
	const f = Math.min(raw, TL.freeze);
	const zoom = ip(f, [840, TL.freeze], [1, 1.2], Easing.inOut(Easing.sin));
	const flash = ip(raw, [TL.freeze, TL.freeze + 1, TL.freeze + 6], [0, 0.7, 0], Easing.linear);
	return (
		<>
			<Svg cam={camera(zoom, 540, 1420)}>
				<defs>
					<radialGradient id="drama" cx="50%" cy="42%" r="70%">
						<stop offset="0" stopColor="#FFB347" />
						<stop offset="0.45" stopColor="#D2452B" />
						<stop offset="1" stopColor="#2A0A10" />
					</radialGradient>
				</defs>
				<rect width={W} height={H} fill="url(#drama)" />
				<g transform={`translate(540,800) rotate(${f * 0.25})`} opacity={0.25}>
					{Array.from({length: 36}, (_, i) => <path key={i} transform={`rotate(${i * 10})`} d="M-8,200 L0,1500 L8,200 Z" fill="#FFF3C4" />)}
				</g>
				<FallingLeaves frame={f} n={10} speed={0.5} windX={3} />
				<Pomgoku x={540} y={1310} scale={2.05} frame={f} mood="determined" look={[0, 0.12]} mouth={mouthOf('l5', f)}
					noArms shadow={false} wind={1.3} />
				{/* filets de vent */}
				{Array.from({length: 6}, (_, i) => {
					const x = ((f * 22 + i * 260) % 1500) - 300;
					const y = 300 + i * 190;
					return <path key={i} d={`M${x},${y} q120,-30 240,0 t240,0`} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={6} fill="none" strokeLinecap="round" />;
				})}
				<Fist x={540} y={1480} s={1.7} f={f} />
			</Svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
			<AbsoluteFill style={{background: '#FFFFFF', opacity: flash}} />
		</>
	);
};

/* ------------------------------------------------------------------ TITRE */
const TitleCard: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const t = f - TL.title;
	const slam = spring({frame: t, fps, config: {damping: 9, stiffness: 140}});
	const scale = interpolate(slam, [0, 1], [3.2, 1]);
	const ep = spring({frame: t - 14, fps, config: {damping: 14}});
	const sui = interpolate(t, [50, 66], [0, 1], clamp);
	const [sx, sy] = shake(f, interpolate(t, [3, 7, 18], [0, 18, 0], clamp));
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<defs>
					<radialGradient id="orb" cx="35%" cy="30%" r="70%">
						<stop offset="0" stopColor="#FFE9A0" />
						<stop offset="0.5" stopColor="#FF9A1F" />
						<stop offset="1" stopColor="#C2410C" />
					</radialGradient>
					<radialGradient id="orbglow">
						<stop offset="0" stopColor="#FF9A1F" stopOpacity={0.55} />
						<stop offset="1" stopColor="#FF9A1F" stopOpacity={0} />
					</radialGradient>
				</defs>
				<g opacity={interpolate(t, [0, 10], [0, 1], clamp)}>
					<circle cx={540} cy={760} r={330 + Math.sin(t * 0.15) * 15} fill="url(#orbglow)" />
					<g transform={`translate(540,760) rotate(${t * 0.6})`}>
						<circle r={150} fill="url(#orb)" stroke="#5A1A00" strokeWidth={10} />
						<path d="M0,-58 L17,-18 L60,-18 L26,8 L38,50 L0,26 L-38,50 L-26,8 L-60,-18 L-17,-18 Z" fill="#D41C1C" stroke="#7A0A0A" strokeWidth={4} />
						<ellipse cx={-55} cy={-70} rx={34} ry={20} fill="#FFFFFF" opacity={0.6} transform="rotate(-35,-55,-70)" />
						{/* petite tige */}
						<path d="M0,-150 Q6,-178 20,-190" stroke="#5A3A1A" strokeWidth={14} strokeLinecap="round" fill="none" />
						<path d="M18,-186 C40,-214 80,-206 92,-184 C70,-168 40,-170 18,-186 Z" fill="#4DB33D" stroke="#1E4A12" strokeWidth={5} />
					</g>
				</g>
			</svg>
			<div style={{position: 'absolute', top: 820, width: '100%', textAlign: 'center', transform: `translate(${sx}px,${sy}px) scale(${scale})`, opacity: interpolate(t, [0, 3], [0, 1], clamp)}}>
				<div style={{fontFamily: 'Bangers', fontSize: 230, lineHeight: 1, letterSpacing: 6, color: '#FFD23F', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textShadow: '0 14px 0 #B3261E, 0 22px 30px rgba(255,120,0,0.6)'}}>
					FRUIT BALL Z
				</div>
			</div>
			<div style={{position: 'absolute', top: 1110, width: '100%', textAlign: 'center', opacity: ep, transform: `translateY(${(1 - ep) * 60}px)`}}>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 92, color: '#FFFFFF', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', letterSpacing: 3}}>— ÉPISODE 1 —</div>
			</div>
			<div style={{position: 'absolute', top: 1380, width: '100%', textAlign: 'center', opacity: sui, transform: `scale(${0.9 + sui * 0.1})`}}>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 84, color: '#FFB347', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>À suivre...</div>
			</div>
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
				fontFamily: 'Luckiest Guy', fontSize: 76, lineHeight: 1.12, textAlign: 'center', color: '#FFFFFF',
				WebkitTextStroke: '15px #000', paintOrder: 'stroke fill', letterSpacing: 1,
				textShadow: '0 7px 0 rgba(0,0,0,0.55)', transform: `scale(${0.75 + pop * 0.25})`,
			}}>
				{cur.text}
			</div>
		</div>
	);
};

/** recap : sans son ni sous-titres (plans repris dans le « Précédemment » de l'ép.2). */
export const Episode: React.FC<{recap?: boolean}> = ({recap}) => {
	const f = useCurrentFrame();
	const S = TL.scenes;
	let scene: React.ReactNode;
	if (f < S.s2[0]) scene = <Scene1 f={f} />;
	else if (f < S.s3[0]) scene = <Scene2 f={f} />;
	else if (f < S.s4[0]) scene = <Scene3 f={f} />;
	else if (f < 690) scene = <Scene4Ground f={f} />;
	else if (f < S.s5[0]) scene = <Scene4Sky f={f} />;
	else if (f < TL.title) scene = <Scene5 f={f} />;
	else scene = <TitleCard f={f} />;
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{scene}
			{f < TL.title && !recap && <Subtitles f={f} />}
			{!recap && <Audio src={staticFile('audio/mix.wav')} />}
		</AbsoluteFill>
	);
};
