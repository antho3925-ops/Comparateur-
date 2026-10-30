import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pomgoku} from './characters';
import {Namekian, OddBird, Vegenade} from './characters3';
import {DriedSoldier, Litcheezer, ltzFinger, NamekElder, PomShip, SaucerShip} from './characters4';
import {Episode3} from './Episode3';
import {INK, SharedDefs, SW} from './parts';
import {Grass, H, W} from './scenery';
import {SpeedLines} from './scenery2';
import {Ash, Dome, NamekSky, NamekTree, Rock, Smoke} from './scenery4';
import timeline from './timeline4.json';
import voices from './voices4.json';

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

const Vignette: React.FC<{o?: number}> = ({o = 0.6}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, transparent 48%, rgba(8,4,10,${o}) 100%)`}} />
);

/** Voile froid (bleu nuit) posé sur l'image : l'ombre de Litcheezer. */
const Cold: React.FC<{o: number}> = ({o}) => <AbsoluteFill style={{background: `rgba(16,34,72,${o})`, mixBlendMode: 'multiply'}} />;

/* ------------------------------------------------------------------ VILLAGE NAMEKIEN (décor de l'ép.3) */
const HZ = 1180;
const Village: React.FC<{f: number; ruin?: number; grey?: number}> = ({f, ruin = 0, grey = 0}) => (
	<g>
		<NamekSky f={f} hz={HZ - 120} grey={grey} />
		<rect x={-500} y={HZ - 120} width={W + 1000} height={140} fill={ruin ? '#5A6A66' : '#5FCAB8'} />
		{[[120, HZ - 110, 0.3], [520, HZ - 100, 0.22], [880, HZ - 112, 0.35]].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
				<path d="M-200,0 Q0,-90 200,0 Z" fill={ruin ? '#4A5A50' : '#4FA88A'} stroke={INK} strokeWidth={10} />
				<NamekTree x={0} y={-50} s={1} f={f} seed={i} burnt={ruin > 0} />
			</g>
		))}
		<defs>
			<linearGradient id="vgrass4" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#6CC88A" />
				<stop offset="1" stopColor="#2E7A5A" />
			</linearGradient>
			<linearGradient id="vash4" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#6A6A60" />
				<stop offset="1" stopColor="#2E2E2A" />
			</linearGradient>
		</defs>
		<path d={`M-500,${HZ} Q540,${HZ - 50} 1580,${HZ} L1580,2600 L-500,2600 Z`} fill={ruin ? 'url(#vash4)' : 'url(#vgrass4)'} stroke={INK} strokeWidth={6} />
		<NamekTree x={60} y={HZ + 60} s={1.1} f={f} seed={7} burnt={ruin > 0} />
		<NamekTree x={1010} y={HZ + 40} s={1.25} f={f} seed={9} burnt={ruin > 0} />
		<Dome x={250} y={HZ + 70} s={0.75} ruin={ruin} seed={1} />
		<Dome x={820} y={HZ + 90} s={0.9} ruin={ruin} seed={2} />
		<Dome x={560} y={HZ + 30} s={0.55} ruin={ruin} seed={3} />
		{!ruin && Array.from({length: 22}, (_, i) => (
			<circle key={i} cx={random(`vf${i}`) * W} cy={HZ + 140 + random(`vfy${i}`) * 600} r={6} fill={['#FFFFFF', '#FFE04A', '#9FE8FF'][i % 3]} />
		))}
		{ruin > 0 && Array.from({length: 14}, (_, i) => (
			<ellipse key={i} cx={random(`cr${i}`) * W} cy={HZ + 160 + random(`cry${i}`) * 700} rx={30 + random(`crr${i}`) * 50} ry={10 + random(`crr${i}`) * 14} fill="#1A1814" opacity={0.6} />
		))}
	</g>
);

// sbires alignés : x, type
const SOLDIERS: Array<[number, 'raisin' | 'date']> = [[120, 'date'], [235, 'raisin'], [350, 'date'], [465, 'raisin'], [580, 'date']];
const SHIP = {x: 560, y: 1060, s: 0.55};

/* ------------------------------------------------------------------ CARTON D'OUVERTURE (2 s) */
const OpeningCard: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const slam = spring({frame: f, fps, config: {damping: 9, stiffness: 160}});
	const sub = spring({frame: f - 12, fps, config: {damping: 14}});
	const [sx, sy] = shake(f, interpolate(f, [2, 5, 14], [0, 16, 0], clamp));
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #5A1E4A, #12060E 70%)'}}>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<g transform={`translate(540,700) rotate(${f * 0.8})`} opacity={0.3}>
					{Array.from({length: 24}, (_, i) => <path key={i} transform={`rotate(${i * 15})`} d="M-10,120 L0,1400 L10,120 Z" fill="#FFD23F" />)}
				</g>
			</svg>
			<div style={{position: 'absolute', top: 600, width: '100%', textAlign: 'center', transform: `translate(${sx}px,${sy}px) scale(${interpolate(slam, [0, 1], [3, 1])})`}}>
				<div style={{fontFamily: 'Bangers', fontSize: 210, lineHeight: 1, letterSpacing: 6, color: '#FFD23F', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill', textShadow: '0 14px 0 #B3261E'}}>FRUIT BALL Z</div>
			</div>
			<div style={{position: 'absolute', top: 900, left: 60, right: 60, textAlign: 'center', opacity: sub, transform: `translateY(${(1 - sub) * 50}px)`}}>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 80, color: '#FFFFFF', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>Épisode 4</div>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 96, lineHeight: 1.1, marginTop: 20, color: '#FF9AC0', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>Litcheezer entre en scène</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ PRÉCÉDEMMENT (plans de l'ép.3 en accéléré) */
// hologramme, Végénade en colère, descente sur Namek, village
const RECAP_SHOTS = [318, 450, 1230, 1640];
const Ep3 = Episode3 as React.FC<{recap?: boolean}>;
const Recap: React.FC<{f: number}> = ({f}) => {
	const s = SC.recap[0];
	const len = (SC.recap[1] - s) / RECAP_SHOTS.length;
	const i = Math.min(RECAP_SHOTS.length - 1, Math.floor((f - s) / len));
	const local = f - s - i * len;
	const ep = Math.round(RECAP_SHOTS[i] + local * 2);
	const scan = (f * 37) % 1920;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(1.3) contrast(1.05)'}}>
				<Freeze frame={ep}><Ep3 recap /></Freeze>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 7px)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: scan, height: 40, background: 'rgba(255,255,255,0.08)'}} />
			<Vignette o={0.7} />
			<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
				<span style={{fontFamily: 'Bangers', fontSize: 96, letterSpacing: 3, color: '#FFD23F', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>PRÉCÉDEMMENT...</span>
			</div>
			<div style={{position: 'absolute', top: 250, right: 70, fontFamily: 'Luckiest Guy', fontSize: 64, color: '#FFFFFF', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', opacity: f % 20 < 14 ? 1 : 0.3}}>▶▶ x2</div>
			<AbsoluteFill style={{background: '#FFFFFF', opacity: local < 3 && i > 0 ? 0.7 - local * 0.22 : 0}} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ SCÈNE 1 : l'ombre sur le village (10 s) */
const Scene1: React.FC<{f: number}> = ({f}) => {
	const [a, b] = SC.s1;
	const [sh0, sh1] = TL.shadow;
	const tilt = TL.tiltUp, land = TL.shipLand;
	const [m0, m1] = TL.march;
	const shadow = ip(f, [sh0, sh1], [0, 1], Easing.inOut(Easing.quad));
	// vaisseau : descend lentement dans son halo, se pose derrière le village
	const shipY = ip(f, [sh0 + 40, land], [-900, SHIP.y], Easing.out(Easing.cubic));
	const legs = ip(f, [land - 25, land], [0, 1]);
	const ramp = ip(f, [land + 4, m0 + 6], [0, 1]);
	const [sx, sy] = shake(f, ip(f, [land, land + 3, land + 20], [0, 14, 0]));
	// caméra : plan large paisible, on lève les yeux vers le ciel, puis on suit la descente
	let zoom = ip(f, [a, tilt], [1.0, 1.06]);
	let fy = 1380;
	if (f >= tilt && f < tilt + 45) { fy = ip(f, [tilt, tilt + 45], [1380, 700]); zoom = ip(f, [tilt, tilt + 45], [1.06, 0.95]); }
	else if (f >= tilt + 45) { fy = ip(f, [tilt + 45, land + 10], [700, 1380]); zoom = ip(f, [tilt + 45, b], [0.95, 1.05]); }
	const look: [number, number] = f > sh0 + 40 ? [0, -1] : [Math.sin(f * 0.03), 0];
	const scared = f > sh0 + 50;
	return (
		<>
			<Svg cam={focus(zoom, 540, fy, sx, sy)}>
				<Village f={f} />
				{/* l'ombre glaciale qui s'étend sur le sol */}
				<ellipse cx={560} cy={1450} rx={120 + shadow * 1400} ry={30 + shadow * 520} fill="#08142A" opacity={0.55 * shadow} filter="url(#blur20)" />
				{/* oiseaux de Namek, qui s'enfuient quand l'ombre arrive */}
				{[0, 1, 2].map((i) => {
					const flee = ip(f, [sh0 + 20, sh0 + 80], [0, 1], Easing.in(Easing.quad));
					return <OddBird key={i} x={((f * (2.2 + i * 0.6) + i * 330) % 1400) - 160 + flee * 900} y={720 + i * 110 + Math.sin(f * 0.06 + i) * 30 - flee * 500} s={0.6 + i * 0.15} frame={f * (1 + flee)} seed={i} />;
				})}
				{/* halo bleu froid + vaisseau rond */}
				<g opacity={f > sh0 + 40 ? 1 : 0}>
					<SaucerShip x={SHIP.x} y={shipY} scale={SHIP.s} frame={f} legs={legs} ramp={ramp} glow={1 - legs * 0.6} />
				</g>
				{/* les sbires sortent du vaisseau et s'alignent */}
				{f >= m0 && SOLDIERS.map(([x, kind], i) => {
					const p = ip(f, [m0 + i * 6, m0 + i * 6 + 34], [0, 1]);
					const step = p < 1 ? Math.abs(Math.sin(f * 0.6 + i)) * 10 : 0;
					return (
						<DriedSoldier key={i} x={SHIP.x + (x - SHIP.x) * p} y={1250 + (1530 - 1250) * p - step} scale={0.14 + 0.24 * p} frame={f} kind={kind} seed={i}
							look={[0.6, 0]} darken={0.2} salute={f > m1 - 10 ? 1 : 0} />
					);
				})}
				{/* Namekiens du village */}
				<Namekian x={840} y={1760} scale={0.55} frame={f} seed={2} look={look} mood={scared ? 'shock' : 'happy'} lean={scared ? -4 : 0} />
				<Namekian x={1000} y={1700} scale={0.48} frame={f} seed={3} look={look} mood={scared ? 'shock' : 'happy'} armL={scared ? 120 : 15} />
				<Grass frame={f} dark={0.05 + shadow * 0.4} wind={0.8 + shadow * 1.2} />
			</Svg>
			<Cold o={shadow * 0.45} />
			<Vignette o={0.35 + shadow * 0.3} />
		</>
	);
};

/* ------------------------------------------------------------------ face-à-face (décor commun aux scènes 2 et 3) */
const LTZ = {x: 330, y: 1700, s: 0.55};
const ELD = {x: 800, y: 1760, s: 0.85};
const FaceOff: React.FC<{f: number; ltz: Partial<React.ComponentProps<typeof Litcheezer>>; eld: Partial<React.ComponentProps<typeof NamekElder>>; namMood?: any}> = ({f, ltz, eld, namMood = 'angry'}) => (
	<>
		<Village f={f} />
		<SaucerShip x={SHIP.x} y={SHIP.y} scale={SHIP.s} frame={f} legs={1} ramp={1} glow={0.4} />
		{SOLDIERS.map(([x, kind], i) => <DriedSoldier key={i} x={x} y={1530} scale={0.38} frame={f} kind={kind} seed={i} look={[0.6, 0]} darken={0.2} />)}
		<Namekian x={700} y={1580} scale={0.48} frame={f} seed={2} look={[-1, 0]} mood={namMood} />
		<Namekian x={990} y={1600} scale={0.5} frame={f} seed={3} look={[-1, 0]} mood={namMood} />
		<Litcheezer x={LTZ.x} y={LTZ.y} scale={LTZ.s} frame={f} look={[1, 0]} {...ltz} />
		<NamekElder x={ELD.x} y={ELD.y} scale={ELD.s} frame={f} look={[-1, 0]} mood="angry" {...eld} />
		<Grass frame={f} dark={0.45} wind={1.4} />
	</>
);
// visages (repère du monde)
const LTZ_FACE: [number, number] = [LTZ.x, LTZ.y - 420 * LTZ.s];
const ELD_FACE: [number, number] = [ELD.x, ELD.y - 240 * ELD.s];

/* ------------------------------------------------------------------ SCÈNE 2 : face-à-face (13 s) */
const Scene2: React.FC<{f: number}> = ({f}) => {
	const [w0, c1, c2, c3] = TL.s2shots;
	const l1 = TL.voices.l1, l2 = TL.voices.l2;
	let cam: string;
	if (f < c1) cam = focus(ip(f, [w0, c1], [1.0, 1.08]), 560, 1450);
	else if (f < c2) cam = focus(ip(f, [c1, c2], [2.7, 3.0]), LTZ_FACE[0] + 20, LTZ_FACE[1] + 70);
	else if (f < c3) cam = focus(ip(f, [c2, c3], [2.5, 2.8]), ELD_FACE[0] - 10, ELD_FACE[1] + 50);
	else cam = focus(ip(f, [c3, SC.s2[1]], [3.1, 3.3]), LTZ_FACE[0] + 10, LTZ_FACE[1] + 50);
	const ltzTalk = f >= l1.start && f < l1.end;
	const eldTalk = f >= l2.start && f < l2.end;
	return (
		<>
			<Svg cam={cam}>
				<FaceOff f={f}
					ltz={{mouth: mouthOf('l1', f), mood: 'sneer', smile: ltzTalk ? 0 : f >= c3 ? 1.4 : 1, look: f >= c3 ? [1, 0.15] : [1, 0], tail: f >= c3 ? 1.6 : 1}}
					eld={{mouth: mouthOf('l2', f), look: f >= c2 && f < l2.start ? [-1, 0.1] : [-1, 0], lean: eldTalk ? Math.sin(f * 0.1) * 1.5 : 0}} />
			</Svg>
			<Cold o={0.32} />
			<Vignette o={0.6} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 : le doigt levé (12 s) */
const Scene3: React.FC<{f: number}> = ({f}) => {
	const a = SC.s3[0];
	const up = TL.fingerUp, fl = TL.flash, ru = TL.ruins;
	if (f >= ru) {
		// plan large sur le village détruit : fumée, braises, silence
		const p = ip(f, [ru, SC.s3[1]], [0, 1], Easing.linear);
		return (
			<>
				<Svg cam={focus(1.0 + p * 0.07, 540 + p * 20, 1300)}>
					<Village f={f} ruin={1} grey={1} />
					<Smoke x={250} y={HZ + 40} s={0.8} f={f} seed={1} />
					<Smoke x={820} y={HZ + 60} s={1} f={f} seed={2} />
					<Smoke x={560} y={HZ + 10} s={0.6} f={f} seed={3} color="#5A5450" />
					<Ash f={f} n={40} color="#FFB070" seed="emb" speed={-0.6} />
					<Ash f={f} n={30} />
				</Svg>
				<AbsoluteFill style={{background: 'rgba(30,26,24,0.25)'}} />
				<Vignette o={0.75} />
				<AbsoluteFill style={{background: '#FFFFFF', opacity: ip(f, [ru, ru + 20], [0.85, 0], Easing.linear)}} />
			</>
		);
	}
	const l3 = TL.voices.l3;
	const talking = f >= l3.start && f < l3.end;
	const finger = ip(f, [up, up + 15], [0, 1], Easing.out(Easing.back(1.4)));
	const glow = ip(f, [up + 15, fl], [0, 1], Easing.in(Easing.quad));
	const [tx, ty] = ltzFinger(LTZ.x, LTZ.y, LTZ.s, f);
	let cam: string;
	if (f < up) cam = focus(ip(f, [a, up], [2.3, 2.7]), LTZ_FACE[0] + 30, LTZ_FACE[1] + 90);
	else cam = focus(ip(f, [up, up + 12, fl], [1.3, 1.3, 2.6], Easing.in(Easing.quad)), ip(f, [up, fl], [500, tx]), ip(f, [up, fl], [1450, ty]));
	return (
		<>
			<Svg cam={cam}>
				<FaceOff f={f} namMood={f >= up ? 'shock' : 'angry'}
					ltz={{mouth: mouthOf('l3', f), mood: 'sneer', smile: talking ? 0 : 1.6, finger, glow, look: f >= up ? [0.6, -0.4] : [1, 0]}}
					eld={{mood: f >= up ? 'shock' : 'angry', look: f >= up ? [-0.6, -0.8] : [-1, 0]}} />
				{glow > 0 && <circle cx={tx} cy={ty} r={60 + glow * 600} fill="#FFFFFF" opacity={glow * 0.5} filter="url(#blur20)" />}
			</Svg>
			<Cold o={0.32 * (1 - glow)} />
			<Vignette o={0.6} />
			{/* flash blanc aveuglant */}
			<AbsoluteFill style={{background: '#FFFFFF', opacity: ip(f, [fl - 6, fl], [0, 1], Easing.in(Easing.quad))}} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 : Végénade caché (10 s) */
const Fists: React.FC<{f: number; p: number}> = ({f, p}) => {
	const tr = (random(`ft${f}`) - 0.5) * 8 * p;
	return (
		<g>
			{[-1, 1].map((s) => (
				<g key={s} transform={`translate(${540 + s * 220 + tr},${980 - tr}) scale(${-s * 2.2},2.2)`}>
					<path d="M-10,40 Q-40,200 -70,400" stroke={INK} strokeWidth={70 + SW * 2} strokeLinecap="round" fill="none" />
					<path d="M-10,40 Q-40,200 -70,400" stroke="#23408E" strokeWidth={70} strokeLinecap="round" fill="none" />
					<circle cx={0} cy={0} r={70} fill="#F4F1EA" stroke={INK} strokeWidth={SW} />
					{/* doigts qui se replient */}
					{[-36, -12, 12, 36].map((fx, i) => (
						<path key={i} d={`M${fx},-46 q${8 * p},${-24 + 30 * p} 0,${40 + 10 * p}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
					))}
					<path d={`M-40,${30 - 20 * p} Q0,${46 - 20 * p} 40,${30 - 20 * p}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
					<circle cx={-24} cy={-30} r={14} fill="#FFFFFF" opacity={0.7} />
				</g>
			))}
		</g>
	);
};

const Scene4: React.FC<{f: number}> = ({f}) => {
	const [a, b] = SC.s4;
	const vc = TL.vegClose, fs = TL.fists;
	const l4 = TL.voices.l4;
	const VX = 590, VY = 1860, VS = 1.15;
	const face: [number, number] = [VX, VY - 270 * VS];
	if (f < vc) {
		// derrière les rochers : le village fume au loin, cendres
		const p = ip(f, [a, vc], [0, 1], Easing.linear);
		return (
			<>
				<Svg cam={focus(1.05, 540 + p * 80, 1150)}>
					<g transform="translate(540,1180) scale(0.55) translate(-540,-1180)">
						<Village f={f} ruin={1} grey={1} />
						<Smoke x={250} y={HZ + 40} s={0.8} f={f} seed={1} />
						<Smoke x={820} y={HZ + 60} s={1} f={f} seed={2} />
					</g>
					<Rock x={180} y={1700} s={1.4} dark={0.25} />
					<Rock x={960} y={1760} s={1.6} flip dark={0.35} />
					<Ash f={f} n={30} />
				</Svg>
				<AbsoluteFill style={{background: 'rgba(30,26,24,0.25)'}} />
				<Vignette o={0.7} />
			</>
		);
	}
	if (f >= fs && f < fs + 40) {
		// gros plan sur les poings qui se serrent
		const p = ip(f, [fs, fs + 22], [0, 1], Easing.out(Easing.quad));
		return (
			<>
				<Svg cam={focus(ip(f, [fs, fs + 40], [1, 1.12]), 540, 1000)}>
					<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#1E1418" />
					<circle cx={540} cy={1000} r={600} fill="#FF2A4A" opacity={0.18 * p} filter="url(#blur20)" />
					<Fists f={f} p={p} />
				</Svg>
				<Vignette o={0.8} />
			</>
		);
	}
	const rage = f >= fs ? ip(f, [fs + 40, fs + 60], [0.4, 1]) : ip(f, [l4.end - 20, l4.end], [0, 0.4]);
	const zoom = f >= fs ? ip(f, [fs + 40, b], [1.9, 2.1]) : ip(f, [vc, fs], [1.15, 1.45]);
	const talking = f >= l4.start && f < l4.end;
	return (
		<>
			<Svg cam={focus(zoom, face[0] - 20, face[1] + 60)}>
				<rect x={-500} y={-500} width={W + 1000} height={H + 1000} fill="#4A5048" />
				<g transform="translate(540,1180) scale(0.55) translate(-540,-1180)">
					<Village f={f} ruin={1} grey={1} />
					<Smoke x={820} y={HZ + 60} s={1} f={f} seed={2} />
				</g>
				<Rock x={1080} y={1560} s={1.1} flip dark={0.4} />
				<Vegenade x={VX} y={VY} scale={VS} frame={f} mood="angry" crossed={false} armL={30} armR={30} rage={rage} darken={0.2}
					look={talking || f >= fs ? [0.9, 0.1] : [1, 0]} mouth={mouthOf('l4', f)} lean={-5} shadow={false} />
				{/* ombres sur son visage */}
				<rect x={-500} y={-500} width={W + 1000} height={H + 1000} fill="url(#vegShade)" />
				<defs>
					<linearGradient id="vegShade" x1="0" x2="1" y1="0" y2="0.4">
						<stop offset="0" stopColor="#05030A" stopOpacity="0.6" />
						<stop offset="0.45" stopColor="#05030A" stopOpacity="0.3" />
						<stop offset="0.62" stopColor="#05030A" stopOpacity="0" />
					</linearGradient>
				</defs>
				{/* le rocher derrière lequel il se cache, au premier plan */}
				<Rock x={380} y={2330} s={1.8} dark={0.45} />
				<Ash f={f} n={24} />
			</Svg>
			<AbsoluteFill style={{background: 'rgba(30,26,24,0.2)'}} />
			<Vignette o={0.75} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 : un nouveau venu (10 s) */
const GreyClouds: React.FC<{f: number; part?: number; gold?: number}> = ({f, part = 0, gold = 0}) => (
	<g>
		{Array.from({length: 14}, (_, i) => {
			const side = i % 2 ? 1 : -1;
			const x = random(`gc${i}`) * W + ((f * (0.5 + random(`gv${i}`))) % 400) - 200 + side * part * 500;
			const y = 200 + random(`gy${i}`) * 1500;
			return <circle key={i} cx={x} cy={y} r={200 + random(`gr${i}`) * 200} fill={gold > 0 && i % 3 === 0 ? '#E8D8A8' : '#8A8E94'} opacity={0.75} filter="url(#blur20)" />;
		})}
	</g>
);

const Scene5: React.FC<{f: number}> = ({f}) => {
	const [a, b, c] = TL.s5shots;
	const [f0, f1] = TL.fade;
	const black = ip(f, [f0, f1], [0, 1], Easing.linear);
	let shot: React.ReactNode;
	if (f < c) {
		// ciel gris, puis le petit vaisseau rond traverse les nuages dans une traînée dorée
		const p = ip(f, [b, c], [0, 1], Easing.inOut(Easing.quad));
		const gold = ip(f, [b, b + 30], [0, 1]);
		shot = (
			<Svg cam={focus(ip(f, [a, c], [1.0, 1.1]), 540, 960)}>
				<defs>
					<linearGradient id="gsky5" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0" stopColor="#3A3E46" />
						<stop offset="1" stopColor="#8A9096" />
					</linearGradient>
				</defs>
				<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#gsky5)" />
				<GreyClouds f={f} />
				{f >= b && (
					<>
						<circle cx={80 + p * 1000} cy={1450 - p * 900} r={420} fill="#FFD86A" opacity={0.45 * gold} filter="url(#blur20)" />
						<PomShip x={80 + p * 1000} y={1450 - p * 900} scale={0.55} rot={-36} frame={f} />
					</>
				)}
				<g opacity={0.3}><GreyClouds f={f + 200} part={p} gold={gold} /></g>
				<Ash f={f} n={20} />
			</Svg>
		);
	} else {
		// gros plan : Pomgoku au hublot, déterminé
		const p = ip(f, [c, f0], [0, 1], Easing.linear);
		const [sx, sy] = shake(f, 5);
		shot = (
			<>
				<Svg cam={focus(ip(f, [c, f0], [1.0, 1.12]), 600, 990, sx, sy)}>
					<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="#C89A4A" />
					<circle cx={540} cy={960} r={900} fill="#FFE8A0" opacity={0.6} filter="url(#blur20)" />
					<PomShip x={480} y={1000} scale={2.6} rot={-8} frame={f}
						inside={(
							<g>
								<rect x={-120} y={-150} width={300} height={300} fill="#3A4A6A" />
								<circle cx={30} cy={-10} r={120} fill="#FFD86A" opacity={0.25} />
								<Pomgoku x={30} y={150 - p * 6} scale={0.55} frame={f} mood="determined" look={[0.5, -0.1]} armL={40} armR={40} shadow={false} wind={0.4} />
							</g>
						)} />
				</Svg>
				<Svg><SpeedLines frame={f} angle={-8} n={18} opacity={0.4} /></Svg>
			</>
		);
	}
	return (
		<>
			{shot}
			<Vignette o={0.55} />
			<AbsoluteFill style={{background: '#000', opacity: black}} />
		</>
	);
};

/* ------------------------------------------------------------------ À SUIVRE */
const Suivre: React.FC<{f: number}> = ({f}) => {
	const t = f - SC.suivre[0];
	const a = interpolate(t, [10, 30, 75, 90], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: 'Luckiest Guy', fontSize: 110, color: '#FFB347', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.92 + a * 0.08})`}}>À suivre...</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ TEASER : Pomgoku débarque */
const Bolt: React.FC<{seed: string; x: number}> = ({seed, x}) => {
	let d = `M${x},0`;
	let cx = x;
	for (let i = 1; i <= 8; i++) { cx += (random(`${seed}${i}`) - 0.5) * 160; d += ` L${cx},${i * 110}`; }
	return <path d={d} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.95} />;
};

/** Silhouette de Pomgoku (tiges en pointes). */
const PomSil: React.FC<{x: number; y: number; s: number; fill?: string}> = ({x, y, s, fill = '#050308'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} fill={fill}>
		{[-78, -55, -30, -8, 16, 38, 62, 82].map((a, i) => (
			<path key={i} transform={`translate(${Math.sin((a * Math.PI) / 180) * 70},${-360 + Math.abs(a) * 0.55}) rotate(${a})`} d={`M-26,0 L4,${-150 - (i % 3) * 40} L26,0 Z`} />
		))}
		<path d="M0,-372 C55,-430 192,-410 180,-255 C170,-122 96,-62 0,-82 C-96,-62 -170,-122 -180,-255 C-192,-410 -55,-430 0,-372 Z" />
		<path d="M-60,-90 L-70,0 L-20,0 L-10,-80 Z M60,-90 L70,0 L20,0 L10,-80 Z" />
	</g>
);

const Teaser: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const [a, b, c] = TL.teaserShots;
	const end = SC.teaser[1];
	const strikes = [a + 20, a + 46, b + 10, b + 40, c + 6];
	const strike = strikes.find((k) => f >= k && f < k + 6);
	const lit = strike !== undefined ? 1 - (f - strike) / 6 : 0;
	let shot: React.ReactNode;
	if (f < b) {
		// une boule de feu tombe du ciel de Namek
		const p = ip(f, [a, b], [0, 1], Easing.in(Easing.quad));
		shot = (
			<Svg cam={focus(ip(f, [a, b], [1.0, 1.1]), 540, 1000)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#3A5A5A' : '#081A1A'} />
				{lit > 0 && <Bolt seed={`t${strike}`} x={260 + (strike! % 3) * 220} />}
				<g transform={`translate(${900 - p * 600},${200 + p * 1100})`}>
					<path d="M0,0 L380,-560 L300,-600 L-60,-40 Z" fill="#FFB040" opacity={0.6} filter="url(#blur20)" />
					<circle r={90} fill="#FFE8A0" filter="url(#blur8)" />
					<circle r={60} fill="#FFFFFF" />
				</g>
				{[[150, 1480, 1], [900, 1520, 1.2]].map(([x, y, s], i) => <g key={i} filter="url(#blur3)"><NamekTree x={x} y={y} s={s} f={f} seed={i} /></g>)}
				<rect y={1500} width={W} height={500} fill="#041210" />
			</Svg>
		);
	} else if (f < c) {
		// silhouette dans la fumée d'un cratère, les tiges dressées
		const rise = ip(f, [b, c], [0, 1]);
		shot = (
			<Svg cam={focus(ip(f, [b, c], [1.0, 1.15]), 540, 1100)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#6A4A2A' : '#140C08'} />
				{lit > 0 && <Bolt seed={`u${strike}`} x={300} />}
				<ellipse cx={540} cy={1300} rx={520} ry={420} fill="#FF9A30" opacity={0.35 + lit * 0.3} filter="url(#blur20)" />
				<PomSil x={540} y={1560} s={1.3} />
				<Smoke x={300} y={1700} s={1.2} f={f} seed={4} color="#2A201A" o={0.9 - rise * 0.4} />
				<Smoke x={700} y={1720} s={1.3} f={f} seed={5} color="#2A201A" o={0.9 - rise * 0.4} />
				<rect y={1560} width={W} height={500} fill="#0A0604" />
			</Svg>
		);
	} else {
		// face-à-face dans le noir : les tiges de Pomgoku, la corne de Litcheezer
		const z = ip(f, [c, end], [1.0, 1.2]);
		shot = (
			<Svg cam={focus(z, 540, 960)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#06040A" />
				{lit > 0 && <rect width={W} height={H} fill="#FFD86A" opacity={lit * 0.35} />}
				<PomSil x={260} y={1500} s={1.6} fill={lit > 0 ? '#2A1A10' : '#0E0A08'} />
				<g transform="translate(860,1500) scale(-1.4,1.4)" fill={lit > 0 ? '#2A1A3A' : '#0E0A14'}>
					<path d="M0,-560 C78,-562 128,-500 132,-410 C138,-300 128,-200 0,-150 C-128,-200 -138,-300 -132,-410 C-128,-500 -78,-562 0,-560 Z" />
					{[-1, 1].map((s) => <path key={s} d={`M${s * 70},-520 Q${s * 120},-570 ${s * 150},-640 Q${s * 112},-600 ${s * 96},-500 Z`} />)}
					<path d="M-210,-230 Q-214,-40 0,0 Q214,-40 210,-230 Z" />
				</g>
				{[[200, 1210], [320, 1210]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={34} ry={10} fill="#FFFFFF" opacity={0.5 + lit * 0.5} filter="url(#blur3)" />)}
				{[[800, 880], [918, 880]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={30} ry={9} fill="#FF2A6A" opacity={0.6 + lit * 0.4} filter="url(#blur3)" transform={`rotate(${i ? -12 : 12},${x},${y})`} />)}
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
					<div style={{fontFamily: 'Bangers', fontSize: 150, lineHeight: 1, letterSpacing: 5, color: '#FF5A4A', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 #5A1010'}}>POMGOKU<br />DÉBARQUE</div>
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
	for (const [k, v] of Object.entries(TL.voices) as any[]) {
		if (k === 'n3') continue; // « À suivre... » est déjà écrit à l'écran
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

/** `recap` : rendu sans son ni sous-titres, pour le « Précédemment » de l'épisode suivant. */
export const Episode4: React.FC<{recap?: boolean}> = ({recap}) => {
	const f = useCurrentFrame();
	let scene: React.ReactNode;
	if (f < SC.recap[0]) scene = <OpeningCard f={f} />;
	else if (f < SC.s1[0]) scene = <Recap f={f} />;
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
			{!recap && <Subtitles f={f} />}
			{!recap && <Audio src={staticFile('audio/ep4/mix.wav')} />}
		</AbsoluteFill>
	);
};
