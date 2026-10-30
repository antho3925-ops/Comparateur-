import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PetitPoirsan} from './characters';
import {Kiwikolo} from './characters2';
import {Namekian, OddBird, OrangeBall, PeaShip, Stars, Vegenade, VegPod, vegWrist} from './characters3';
import {Episode2} from './Episode2';
import {INK, SharedDefs, SW} from './parts';
import {Dust, Grass, H, Orchard, W} from './scenery';
import {SpeedLines} from './scenery2';
import timeline from './timeline3.json';
import voices from './voices3.json';

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
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 80, color: '#FFFFFF', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>Épisode 3</div>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 96, lineHeight: 1.1, marginTop: 20, color: '#9BFF5A', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>Voyage vers Namek</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ PRÉCÉDEMMENT (plans de l'ép.2 en accéléré) */
// alliance, charge du rayon, tir, Pomgoku à terre
const RECAP_SHOTS = [330, 1262, 1462, 1680];
const Recap: React.FC<{f: number}> = ({f}) => {
	const s = SC.recap[0];
	const len = (SC.recap[1] - s) / RECAP_SHOTS.length;
	const i = Math.min(RECAP_SHOTS.length - 1, Math.floor((f - s) / len));
	const local = f - s - i * len;
	const ep2 = Math.round(RECAP_SHOTS[i] + local * 2);
	const scan = (f * 37) % 1920;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(1.3) contrast(1.05)'}}>
				<Freeze frame={ep2}><Episode2 recap /></Freeze>
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

/* ------------------------------------------------------------------ SCÈNE 1 : planète froide, l'hologramme (10 s) */
/** Planète métallique de nuit : ciel étoilé, lune à anneaux, tours au loin, sol en plaques d'acier. */
const MetalPlanet: React.FC<{f: number; holo?: number}> = ({f, holo = 0}) => {
	const HZ = 1240;
	return (
		<g>
			<defs>
				<linearGradient id="msky" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#03041A" />
					<stop offset="0.6" stopColor="#141C46" />
					<stop offset="1" stopColor="#3A4A7A" />
				</linearGradient>
				<linearGradient id="mground" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#3C4864" />
					<stop offset="0.4" stopColor="#56647E" />
					<stop offset="1" stopColor="#1C2232" />
				</linearGradient>
			</defs>
			<rect x={-400} y={-400} width={W + 800} height={HZ + 440} fill="url(#msky)" />
			<Stars frame={f} n={150} seed="ms" />
			{/* lune à anneaux, pâle et froide */}
			<g transform="translate(790,430)">
				<circle r={170} fill="#9FB2D8" opacity={0.25} filter="url(#blur20)" />
				<circle r={120} fill="#B8C6E6" stroke={INK} strokeWidth={6} />
				<circle cx={-30} cy={-24} r={26} fill="#97A6CC" />
				<circle cx={40} cy={30} r={18} fill="#97A6CC" />
				<ellipse rx={220} ry={38} fill="none" stroke="#DCE6FF" strokeWidth={10} opacity={0.7} transform="rotate(-14)" />
			</g>
			{/* tours métalliques à l'horizon */}
			{[[60, 260, 70], [190, 420, 54], [330, 300, 80], [700, 380, 60], [860, 250, 90], [1000, 460, 50]].map(([x, h, w], i) => (
				<g key={i}>
					<path d={`M${x - w / 2},${HZ} L${x - w / 3},${HZ - h} L${x + w / 3},${HZ - h} L${x + w / 2},${HZ} Z`} fill="#141A2C" stroke={INK} strokeWidth={5} />
					<path d={`M${x},${HZ - h} L${x},${HZ - h - 80}`} stroke="#141A2C" strokeWidth={8} />
					<circle cx={x} cy={HZ - h - 84} r={8} fill="#FF3B3B" opacity={(f + i * 9) % 40 < 20 ? 1 : 0.25} />
					{[0.3, 0.5, 0.7].map((k) => <rect key={k} x={x - 8} y={HZ - h * k} width={16} height={8} fill="#7FD8FF" opacity={0.5} />)}
				</g>
			))}
			{/* sol : plaques d'acier en perspective */}
			<rect x={-400} y={HZ} width={W + 800} height={H - HZ + 400} fill="url(#mground)" />
			<path d={`M-400,${HZ} L1480,${HZ}`} stroke={INK} strokeWidth={6} />
			{Array.from({length: 15}, (_, i) => {
				const bx = -1400 + i * 280;
				return <path key={i} d={`M540,${HZ} L${bx},${H + 400}`} stroke="#222A3E" strokeWidth={4} />;
			})}
			{Array.from({length: 9}, (_, i) => {
				const y = HZ + 12 * (i + 1) ** 2;
				return <path key={i} d={`M-400,${y} L1480,${y}`} stroke="#222A3E" strokeWidth={3 + i * 0.6} />;
			})}
			{/* reflet bleu de l'hologramme au sol */}
			{holo > 0 && <ellipse cx={640} cy={1660} rx={320} ry={70} fill="#5FD0FF" opacity={0.25 * holo} filter="url(#blur20)" />}
			{/* brume froide qui glisse */}
			{[0, 1, 2, 3].map((i) => (
				<ellipse key={i} cx={((f * (1.2 + i * 0.4) + i * 400) % 1800) - 360} cy={HZ + 40 + i * 70} rx={420} ry={50} fill="#BFD2F0" opacity={0.12} filter="url(#blur20)" />
			))}
		</g>
	);
};

/** Hologramme bleu : cône de lumière + sept boules orange qui tournent. */
const Hologram: React.FC<{f: number; x: number; y: number; s: number; p: number}> = ({f, x, y, s, p}) => {
	if (p <= 0) return null;
	const flick = 0.85 + 0.15 * Math.sin(f * 1.7) * Math.sin(f * 0.6);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} opacity={p * flick}>
			<path d="M0,0 L-260,-420 L260,-420 Z" fill="#5FD0FF" opacity={0.18} />
			<ellipse cx={0} cy={-470} rx={300} ry={250} fill="#5FD0FF" opacity={0.16} filter="url(#blur20)" />
			<ellipse cx={0} cy={-470} rx={290} ry={240} fill="none" stroke="#9FE8FF" strokeWidth={5} opacity={0.6} />
			{Array.from({length: 7}, (_, i) => {
				const a = (i / 7) * Math.PI * 2 + f * 0.02;
				const bx = Math.cos(a) * 190;
				const by = -470 + Math.sin(a) * 140;
				const pop = ip(p, [i / 9, i / 9 + 0.25], [0, 1]);
				return <g key={i} transform={`translate(${bx},${by}) scale(${pop})`}><OrangeBall x={0} y={0} r={48} stars={i + 1} holo frame={f} /></g>;
			})}
			{/* lignes de balayage */}
			{Array.from({length: 12}, (_, i) => <rect key={i} x={-300} y={-720 + i * 42 + ((f * 3) % 42)} width={600} height={4} fill="#BFF2FF" opacity={0.18} />)}
		</g>
	);
};

const Scene1: React.FC<{f: number}> = ({f}) => {
	const s = SC.s1[0];
	const {holo, glow} = TL;
	const l1 = TL.voices.l1;
	const [c1, c2] = l1.cuts;
	const vx = 480, vy = 1700;
	const holoP = ip(f, [holo, holo + 18], [0, 1]);
	const wrist = ip(f, [holo - 12, holo], [0, 1]);
	const rage = ip(f, [c2, glow], [0, 1]);
	const talkingMood = f >= c2 ? 'angry' : 'sneer';
	if (f >= holo && f < c1) {
		// gros plan sur l'hologramme
		return (
			<>
				<Svg cam={focus(ip(f, [holo, c1], [1.5, 1.7]), 760, 1200)}>
					<MetalPlanet f={f} holo={1} />
					<Vegenade x={vx} y={vy} scale={0.95} frame={f} crossed={false} wristUp={1} mood="sneer" look={[1, -0.6]} armL={20} darken={0.35} />
					<Hologram f={f} {...wristPos(vx, vy, 0.95)} p={holoP} />
				</Svg>
				<Vignette o={0.6} />
				<Flash f={f} at={holo} color="#BFF2FF" peak={0.35} len={8} />
			</>
		);
	}
	// plan large (regard vers le ciel) puis la caméra se resserre sur son visage
	const face: [number, number] = [vx, vy - 276 * 0.95];
	let zoom = ip(f, [s, holo], [1.0, 1.15]);
	let fx = 540, fy = ip(f, [s, holo], [1150, 1300]);
	if (f >= c1) {
		zoom = ip(f, [c1, SC.s1[1]], [1.7, 2.6], Easing.inOut(Easing.quad));
		fx = ip(f, [c1, SC.s1[1]], [vx + 80, face[0] + 20]);
		fy = ip(f, [c1, SC.s1[1]], [face[1] + 40, face[1] - 10]);
	} else if (f >= holo - 12) {
		zoom = 1.15;
	}
	const [sx, sy] = shake(f, rage * 4);
	return (
		<>
			<Svg cam={focus(zoom, fx, fy, sx, sy)}>
				<MetalPlanet f={f} holo={f >= holo ? 1 : 0} />
				<Vegenade x={vx} y={vy} scale={0.95} frame={f} crossed={f < holo - 12} wristUp={wrist} armL={20}
					mood={f >= l1.end ? 'sneer' : f >= c1 ? talkingMood : 'sneer'} look={f < holo - 12 ? [0.2, -1] : f < c1 ? [1, -0.6] : [0.15, -0.1]}
					mouth={mouthOf('l1', f)} rage={rage} />
				{f >= holo && <Hologram f={f} {...wristPos(vx, vy, 0.95)} p={holoP} />}
			</Svg>
			{/* lumière bleue de l'hologramme sur le visage */}
			{f >= c1 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 95% 40%, rgba(95,208,255,0.28), transparent 55%)'}} />}
			{rage > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 55%, rgba(255,40,70,${0.18 * rage}), transparent 60%)`}} />}
			<Vignette o={0.65} />
		</>
	);
};
const wristPos = (x: number, y: number, s: number) => {
	const [hx, hy] = vegWrist(x, y, s);
	return {x: hx, y: hy - 20, s: s * 0.75};
};

/* ------------------------------------------------------------------ SCÈNE 2 : décollage de la gousse (9 s) */
const LaunchLegs: React.FC = () => (
	<g>
		{[-1, 1].map((k) => (
			<g key={k}>
				<path d={`M${k * 70},-60 L${k * 150},60`} stroke={INK} strokeWidth={24} strokeLinecap="round" />
				<path d={`M${k * 70},-60 L${k * 150},60`} stroke="#7A828C" strokeWidth={12} strokeLinecap="round" />
				<ellipse cx={k * 150} cy={64} rx={36} ry={12} fill="#5A626C" stroke={INK} strokeWidth={5} />
			</g>
		))}
	</g>
);

const Scene2: React.FC<{f: number}> = ({f}) => {
	const [a, b, c] = TL.s2shots;
	const lift = TL.liftoff;
	if (f < c) {
		// au sol (verger, matin) puis décollage : grondement, poussière, la caméra suit vers le haut
		const up = ip(f, [lift, c], [0, 1], Easing.in(Easing.cubic));
		const shipY = 1390 - up * 1500;
		const rumble = f < lift ? ip(f, [a, lift], [2, 9]) : ip(f, [lift, lift + 30], [16, 6]);
		const [sx, sy] = shake(f, rumble);
		const fire = f < lift ? ip(f, [a + 30, lift], [0.15, 0.7]) : 1;
		const lowAngle = f >= b;
		const cam = lowAngle
			? focus(ip(f, [b, c], [1.15, 1.0]), 540, ip(f, [b, c], [1100, 700]), sx, sy, -4)
			: focus(ip(f, [a, b], [1.05, 1.25]), 540, 1180, sx, sy);
		return (
			<>
				<Svg cam={cam}>
					<Orchard frame={f} dark={0.12} birds={f < lift} />
					{f >= lift - 20 && <Dust x={540} y={1440} t={ip(f, [lift - 20, c], [0.05, 0.6])} n={16} seed="lift" color="#C8B89C" spread={0.9} opacity={ip(f, [lift - 20, lift, c], [0, 1, 0.85])} />}
					<g transform={`translate(540,${shipY})`}>
						{up < 0.05 && <LaunchLegs />}
						<PeaShip x={0} y={-200} scale={0.62} rot={-90} frame={f} fire={fire} />
					</g>
					{f >= lift && <SpeedLines frame={f} angle={90} opacity={up * 0.4} />}
					<Grass frame={f} dark={0.15} wind={1 + rumble * 0.25} />
				</Svg>
				<Vignette o={0.45} />
				<Flash f={f} at={lift} peak={0.55} len={10} />
			</>
		);
	}
	// espace étoilé : la gousse file en diagonale avec des traînées lumineuses
	const p = ip(f, [c, SC.s2[1]], [0, 1], Easing.linear);
	const x = -200 + p * 1500, y = 1500 - p * 1100;
	return (
		<>
			<Svg cam={focus(ip(f, [c, SC.s2[1]], [1.0, 1.12]), 540, 960)}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#03030C" />
				<Stars frame={f} n={140} seed="sp2" />
				{/* la Terre qui s'éloigne */}
				<g transform={`translate(${240 - p * 80},${1700 + p * 200}) scale(${1 - p * 0.3})`}>
					<circle r={420} fill="#3E7BD8" opacity={0.3} filter="url(#blur20)" />
					<circle r={380} fill="#2E6ACB" stroke={INK} strokeWidth={8} />
					<path d="M-260,-120 Q-120,-220 40,-150 Q120,-60 -40,20 Q-200,60 -260,-120 Z M80,80 Q220,40 300,140 Q220,240 100,200 Z" fill="#4FAE3B" />
				</g>
				{/* traînées lumineuses */}
				{[0, 1, 2].map((k) => (
					<path key={k} d={`M${x - 220},${y + 120 + k * 22 - 40} L${x - 1300},${y + 1050 + k * 30}`} stroke={['#FFE27A', '#9BFF5A', '#FFFFFF'][k]} strokeWidth={26 - k * 7} strokeLinecap="round" opacity={0.6} filter="url(#blur3)" />
				))}
				<PeaShip x={x} y={y} scale={0.55} rot={-40} frame={f} fire={1} />
			</Svg>
			<Vignette o={0.5} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 : dans le cockpit (13 s) */
/** Intérieur de la gousse : nervures vertes, grande baie vitrée, étoiles qui filent, consoles. */
const Cockpit: React.FC<{f: number; planet?: number}> = ({f, planet = 0}) => (
	<g>
		<defs>
			<radialGradient id="ckwall" cx="50%" cy="40%" r="75%">
				<stop offset="0" stopColor="#3E6A2A" />
				<stop offset="1" stopColor="#0E1C0C" />
			</radialGradient>
			<clipPath id="ckwin"><rect x={110} y={330} width={860} height={720} rx={180} /></clipPath>
		</defs>
		<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#ckwall)" />
		{/* nervures de la gousse */}
		{[-1, 1].map((k) => [0, 1, 2].map((i) => (
			<path key={`${k}${i}`} d={`M${540 + k * (480 + i * 90)},-200 Q${540 + k * (380 + i * 60)},960 ${540 + k * (480 + i * 90)},2100`} stroke="#22401A" strokeWidth={18} fill="none" />
		)))}
		{/* baie vitrée */}
		<rect x={110} y={330} width={860} height={720} rx={180} fill="#02040E" />
		<g clipPath="url(#ckwin)">
			<Stars frame={f} n={50} seed="ck" />
			{Array.from({length: 46}, (_, i) => {
				const p = (random(`hp${i}`) + f * 0.012 * (0.6 + random(`hv${i}`))) % 1;
				const a = random(`ha${i}`) * Math.PI * 2;
				const r0 = 20 + p * p * 700;
				const r1 = r0 + 20 + p * 120;
				return <line key={i} x1={540 + Math.cos(a) * r0} y1={690 + Math.sin(a) * r0 * 0.8} x2={540 + Math.cos(a) * r1} y2={690 + Math.sin(a) * r1 * 0.8} stroke="#DFF4FF" strokeWidth={3 + p * 5} strokeLinecap="round" opacity={0.3 + p * 0.7} />;
			})}
			{planet > 0 && (
				<g transform={`translate(540,700) scale(${planet})`}>
					<circle r={160} fill="#7CE0B0" opacity={0.4} filter="url(#blur20)" />
					<circle r={120} fill="#4FC08A" stroke={INK} strokeWidth={6} />
					<path d="M-90,-30 Q-20,-70 60,-40 M-70,40 Q10,10 90,40" stroke="#2E8A6A" strokeWidth={16} fill="none" />
				</g>
			)}
		</g>
		<rect x={110} y={330} width={860} height={720} rx={180} fill="none" stroke="#5DAA2E" strokeWidth={26} />
		<rect x={110} y={330} width={860} height={720} rx={180} fill="none" stroke={INK} strokeWidth={6} />
		<path d="M160,420 Q300,370 420,380" stroke="#FFFFFF" strokeWidth={12} opacity={0.18} fill="none" strokeLinecap="round" />
	</g>
);

const Console: React.FC<{f: number}> = ({f}) => (
	<g>
		<path d="M-200,1560 Q540,1500 1280,1560 L1280,2200 L-200,2200 Z" fill="#2E3A44" stroke={INK} strokeWidth={SW} />
		<path d="M-200,1580 Q540,1520 1280,1580" stroke="#6A7A88" strokeWidth={8} fill="none" />
		{Array.from({length: 14}, (_, i) => {
			const x = 40 + i * 75, y = 1640 + (i % 3) * 50;
			const on = (f + i * 7) % (30 + i * 3) < 18;
			return <circle key={i} cx={x} cy={y} r={14} fill={['#FF3B3B', '#9BFF5A', '#FFD23F', '#5FD0FF'][i % 4]} opacity={on ? 1 : 0.25} stroke={INK} strokeWidth={3} />;
		})}
		<rect x={380} y={1700} width={320} height={110} rx={14} fill="#0A1A14" stroke={INK} strokeWidth={5} />
		<path d={`M400,1760 ${Array.from({length: 14}, (_, i) => `L${400 + i * 22},${1760 + Math.sin(f * 0.3 + i) * 26}`).join(' ')}`} stroke="#9BFF5A" strokeWidth={4} fill="none" />
	</g>
);

/** Écran radar : la capsule de Végénade au loin. */
const Radar: React.FC<{f: number; x: number; y: number; s: number}> = ({f, x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-330} y={-250} width={660} height={500} rx={30} fill="#7A828C" stroke={INK} strokeWidth={SW} />
		<rect x={-300} y={-220} width={600} height={440} rx={18} fill="#06140E" stroke={INK} strokeWidth={5} />
		<clipPath id="radclip"><rect x={-300} y={-220} width={600} height={440} rx={18} /></clipPath>
		<g clipPath="url(#radclip)">
			{[-200, -100, 0, 100, 200].map((g) => <path key={g} d={`M${g},-220 L${g},220 M-300,${g * 0.8} L300,${g * 0.8}`} stroke="#1E5A3A" strokeWidth={2} />)}
			<Stars frame={f} n={30} seed="rad" w={600} h={440} />
			<g transform="translate(-300,-220)" />
			<path d={`M0,0 L${Math.cos(f * 0.08) * 420},${Math.sin(f * 0.08) * 420}`} stroke="#5BE03A" strokeWidth={6} opacity={0.6} />
			<VegPod x={90 + Math.sin(f * 0.05) * 8} y={-40} scale={0.42} frame={f} />
			<circle cx={90} cy={-40} r={70 + (f % 20) * 2} fill="none" stroke="#FF3B3B" strokeWidth={5} opacity={1 - (f % 20) / 20} />
			<path d="M40,-90 L60,-90 M40,-90 L40,-70 M140,-90 L120,-90 M140,-90 L140,-70 M40,10 L60,10 M40,10 L40,-10 M140,10 L120,10 M140,10 L140,-10" stroke="#FF3B3B" strokeWidth={6} />
		</g>
		{f % 24 < 14 && <text x={-270} y={-170} fontFamily="Bangers" fontSize={56} fill="#FF3B3B" letterSpacing={3}>CIBLE</text>}
		<text x={110} y={190} fontFamily="Bangers" fontSize={40} fill="#5BE03A">12 400 KM</text>
	</g>
);

const Scene3: React.FC<{f: number}> = ({f}) => {
	const s = SC.s3[0];
	const l2 = TL.voices.l2, l3 = TL.voices.l3;
	const [sc0, sc1] = TL.s3screen;
	const kx = 740, ky = 1650, ks = 0.95;
	const px = 300, py = 1575, ps = 0.85;
	const kFace: [number, number] = [kx, ky - 260 * ks];
	const pFace: [number, number] = [px, py - 130 * ps];
	const kiwiLook: [number, number] = f < l2.start ? [-0.3, 0.1] : f < sc0 - 12 ? [-0.6, 0] : f < sc1 ? [1, -0.4] : f < l3.end + 10 ? [-1, 0.2] : f < l3.end + 40 ? [0, 0.8] : [-0.6, 0.3];
	const pLook: [number, number] = f < l3.start ? [1, -0.3] : f < l3.end ? [0.8, -0.4] : [1, -0.5];
	const kiwi = (
		<Kiwikolo x={kx} y={ky} scale={ks} frame={f} mood="determined" look={kiwiLook} crossed={f < sc1 || f > l3.end + 40} armL={30} armR={f > l3.end + 10 ? 150 : 30}
			mouth={mouthOf('l2', f)} cape={0.5} shadow={false} darken={0.05} />
	);
	const pp = (
		<PetitPoirsan x={px} y={py} scale={ps} frame={f} mood={f >= l3.start && f < l3.end + 20 ? 'fear' : 'shock'} look={pLook}
			armL={f >= sc1 && f < l3.end ? 150 + Math.sin(f * 0.5) * 10 : 40} armR={f >= sc1 && f < l3.end ? 150 + Math.cos(f * 0.5) * 10 : 40} mouth={mouthOf('l3', f)} shadow={false} />
	);
	if (f >= sc0 && f < sc1) {
		// Kiwikolo regarde l'écran : capsule de Végénade au loin
		return (
			<>
				<Svg cam={focus(ip(f, [sc0, sc1], [1.25, 1.4]), 640, 1180)}>
					<Cockpit f={f} />
					<Radar f={f} x={760} y={1080} s={1.05} />
					<Kiwikolo x={260} y={1820} scale={1.25} frame={f} mood="determined" look={[1, -0.4]} crossed mouth={mouthOf('l2', f)} cape={0.5} shadow={false} darken={0.15} />
				</Svg>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 45%, rgba(255,59,59,0.12), transparent 60%)'}} />
				<Vignette o={0.6} />
			</>
		);
	}
	let zoom = ip(f, [s, l2.start], [1.0, 1.12]), fx = 540, fy = ip(f, [s, l2.start], [1150, 1250]);
	if (f >= l2.start && f < sc0) { zoom = ip(f, [l2.start, l2.start + 12], [1.12, 1.9]); fx = ip(f, [l2.start, l2.start + 12], [540, kFace[0]]); fy = ip(f, [l2.start, l2.start + 12], [1250, kFace[1]]); }
	else if (f >= sc1 && f < l3.end + 10) { zoom = 2.0; fx = pFace[0] + 60; fy = pFace[1] - 30; }
	else if (f >= l3.end + 10 && f < SC.s3[1] - 50) { zoom = 1.9; fx = kFace[0]; fy = kFace[1]; }
	else if (f >= SC.s3[1] - 50) { zoom = ip(f, [SC.s3[1] - 50, SC.s3[1]], [1.2, 1.0]); fx = 540; fy = ip(f, [SC.s3[1] - 50, SC.s3[1]], [1150, 900]); }
	const [sx, sy] = shake(f, 2.5);
	return (
		<>
			<Svg cam={focus(zoom, fx, fy, sx, sy)}>
				<Cockpit f={f} planet={ip(f, [SC.s3[1] - 50, SC.s3[1]], [0, 0.9])} />
				{pp}
				{kiwi}
				<Console f={f} />
			</Svg>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(40,90,20,0.18))'}} />
			<Vignette o={0.6} />
			<Flash f={f} at={sc1} peak={0.2} len={4} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 : arrivée sur Namek (10 s) */
/** Arbre de Namek : tronc fin et boule ronde. */
const NamekTree: React.FC<{x: number; y: number; s: number; f: number; seed: number}> = ({x, y, s, f, seed}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(f * 0.05 + seed) * 2})`}>
		<path d="M-10,0 Q-14,-120 -4,-230 L8,-230 Q14,-120 10,0 Z" fill="#6A7A5A" stroke={INK} strokeWidth={5} />
		<circle cx={0} cy={-290} r={78} fill="#2E8A4A" stroke={INK} strokeWidth={7} />
		<circle cx={-22} cy={-312} r={40} fill="#58B86A" opacity={0.75} />
		<circle cx={-30} cy={-322} r={12} fill="#BFF5C8" opacity={0.6} />
	</g>
);

/** Ciel turquoise de Namek, trois soleils. */
const NamekSky: React.FC<{f: number; hz: number}> = ({f, hz}) => (
	<g>
		<defs>
			<linearGradient id="nsky3" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#2FB8B0" />
				<stop offset="0.6" stopColor="#7FE6D6" />
				<stop offset="1" stopColor="#D6FFF0" />
			</linearGradient>
		</defs>
		<rect x={-500} y={-500} width={W + 1000} height={hz + 540} fill="url(#nsky3)" />
		{[[240, 300, 60], [520, 220, 44], [860, 340, 52]].map(([x, y, r], i) => (
			<g key={i}>
				<circle cx={x} cy={y} r={r * 2.4} fill="#FFFBD8" opacity={0.35} filter="url(#blur20)" />
				<circle cx={x} cy={y} r={r} fill="#FFF8D0" stroke="#F2E39A" strokeWidth={6} />
			</g>
		))}
		{[[100, 520, 1.2], [700, 600, 1.0], [400, 760, 0.8]].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${((x + f * (0.6 + i * 0.2)) % 1500) - 200},${y}) scale(${s})`}>
				{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill="#F2FFFA" opacity={0.85} />)}
			</g>
		))}
	</g>
);

const ISLANDS = Array.from({length: 16}, (_, i) => {
	const row = Math.floor(i / 4);
	const y = 900 + row * row * 120 + row * 160 + random(`iy${i}`) * 60;
	const x = ((i % 4) + 0.5 + (random(`ix${i}`) - 0.5) * 0.7) * 270 - 0;
	return {x, y, s: 0.35 + row * 0.32 + random(`is${i}`) * 0.15, seed: i};
});

/** Mer de Namek parsemée d'îlots aux arbres ronds (horizon `hz`). */
const NamekSea: React.FC<{f: number; hz: number}> = ({f, hz}) => (
	<g>
		<defs>
			<linearGradient id="nsea" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#9FE8D8" />
				<stop offset="1" stopColor="#1E8A80" />
			</linearGradient>
		</defs>
		<rect x={-500} y={hz} width={W + 1000} height={H - hz + 500} fill="url(#nsea)" />
		{Array.from({length: 10}, (_, i) => (
			<path key={i} d={`M${-200 + ((i * 230 + f * 2) % 1500)},${hz + 60 + i * 90} q30,-10 60,0`} stroke="#E8FFF8" strokeWidth={4} fill="none" opacity={0.6} />
		))}
		{ISLANDS.map(({x, y, s, seed}) => (
			<g key={seed} transform={`translate(${x},${y}) scale(${s})`}>
				<ellipse cx={0} cy={30} rx={190} ry={40} fill="#1A6A64" opacity={0.5} />
				<path d="M-170,0 Q-150,-60 0,-70 Q150,-60 170,0 L150,60 Q0,90 -150,60 Z" fill="#7A6A5A" stroke={INK} strokeWidth={7} />
				<path d="M-170,0 Q-150,-60 0,-70 Q150,-60 170,0 Q0,20 -170,0 Z" fill="#6CC85A" stroke={INK} strokeWidth={7} />
				<NamekTree x={-60} y={-20} s={0.5} f={f} seed={seed} />
				<NamekTree x={70} y={-10} s={0.38} f={f} seed={seed + 3} />
			</g>
		))}
	</g>
);

const Scene4: React.FC<{f: number}> = ({f}) => {
	const [a, b] = TL.s4shots;
	const end = SC.s4[1];
	if (f < b) {
		// la planète verte grossit, la gousse plonge vers elle
		const p = ip(f, [a, b], [0, 1], Easing.in(Easing.quad));
		const entry = ip(f, [b - 30, b], [0, 1]);
		return (
			<>
				<Svg cam={focus(ip(f, [a, b], [1.0, 1.25]), 540, 1000)}>
					<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#03030C" />
					<Stars frame={f} n={120} seed="sp4" />
					<g transform={`translate(540,${1300 - p * 150}) scale(${0.55 + p * 1.1})`}>
						<circle r={560} fill="#7CE0C8" opacity={0.35} filter="url(#blur20)" />
						<circle r={500} fill="#3EB89A" stroke={INK} strokeWidth={8} />
						<path d="M-420,-160 Q-200,-260 60,-200 Q240,-150 420,-200 M-460,60 Q-200,0 100,60 Q300,100 460,40 M-300,260 Q-60,200 260,280" stroke="#2A8A70" strokeWidth={40} fill="none" opacity={0.8} />
						{[[-200, -60], [120, -80], [260, 160], [-120, 160], [20, 40]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={44} ry={22} fill="#7FD86A" stroke={INK} strokeWidth={4} />)}
						<circle r={500} fill="none" stroke="#D6FFF0" strokeWidth={14} opacity={0.6} />
					</g>
					<g transform={`translate(${900 - p * 340},${300 + p * 560})`}>
						{entry > 0 && <ellipse cx={30} cy={-20} rx={220} ry={90} fill="#FFB060" opacity={0.55 * entry} transform="rotate(-60)" filter="url(#blur8)" />}
						<PeaShip x={0} y={0} scale={0.4 - p * 0.15} rot={120} frame={f} fire={1} />
					</g>
				</Svg>
				<Vignette o={0.5} />
			</>
		);
	}
	// vue aérienne qui descend : traversée des nuages, îlots qui grandissent
	const p = ip(f, [b, end], [0, 1], Easing.out(Easing.quad));
	const hz = 820;
	const cloudUp = ip(f, [b, b + 70], [0, 1], Easing.in(Easing.quad));
	return (
		<>
			<Svg cam={focus(0.95 + p * 0.65, 560, 900 + p * 430)}>
				<NamekSky f={f} hz={hz} />
				<NamekSea f={f} hz={hz} />
				{[0, 1, 2].map((i) => (
					<OddBird key={i} x={((f * (2.2 + i * 0.6) + i * 330) % 1400) - 160} y={700 + i * 120 + Math.sin(f * 0.06 + i) * 30} s={0.6 + i * 0.15} frame={f} seed={i} />
				))}
				{/* la gousse qui descend vers le village */}
				<PeaShip x={ip(f, [b, end], [880, 640])} y={ip(f, [b, end], [700, 1280])} scale={ip(f, [b, end], [0.16, 0.1])} rot={18} frame={f} fire={0.6} />
			</Svg>
			{/* nuages au premier plan qui filent vers le haut (on descend) */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}} opacity={1 - cloudUp * 0.9}>
				<SharedDefs />
				{Array.from({length: 9}, (_, i) => (
					<circle key={i} cx={random(`cl${i}`) * W} cy={600 + random(`cy${i}`) * 900 - cloudUp * 1900} r={260 + random(`cr${i}`) * 200} fill="#F2FFFA" filter="url(#blur20)" />
				))}
			</svg>
			<Vignette o={0.35} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 : le village namekien (13 s) */
const Dome: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<ellipse cx={0} cy={4} rx={200} ry={26} fill="#000" opacity={0.2} filter="url(#blur8)" />
		<path d="M-170,0 C-170,-230 170,-230 170,0 Z" fill="#F3EEDB" stroke={INK} strokeWidth={SW} />
		<path d="M-120,-40 C-120,-160 40,-200 80,-170" stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />
		<path d="M-170,0 C-170,-60 170,-60 170,0" stroke="#CFC6AC" strokeWidth={6} fill="none" />
		{[-90, 0, 90].map((wx) => <ellipse key={wx} cx={wx} cy={-100} rx={26} ry={20} fill="#2E4A5A" stroke={INK} strokeWidth={5} />)}
		<path d="M-40,0 L-40,-60 Q0,-90 40,-60 L40,0 Z" fill="#6A4A2A" stroke={INK} strokeWidth={6} />
	</g>
);

const Village: React.FC<{f: number}> = ({f}) => {
	const hz = 1180;
	return (
		<g>
			<NamekSky f={f} hz={hz - 120} />
			<rect x={-500} y={hz - 120} width={W + 1000} height={140} fill="#5FCAB8" />
			{[[120, hz - 110, 0.3], [520, hz - 100, 0.22], [880, hz - 112, 0.35]].map(([x, y, s], i) => (
				<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
					<path d="M-200,0 Q0,-90 200,0 Z" fill="#4FA88A" stroke={INK} strokeWidth={10} />
					<NamekTree x={0} y={-50} s={1} f={f} seed={i} />
				</g>
			))}
			<defs>
				<linearGradient id="vgrass" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#6CC88A" />
					<stop offset="1" stopColor="#2E7A5A" />
				</linearGradient>
			</defs>
			<path d={`M-500,${hz} Q540,${hz - 50} 1580,${hz} L1580,2400 L-500,2400 Z`} fill="url(#vgrass)" stroke={INK} strokeWidth={6} />
			<NamekTree x={60} y={hz + 60} s={1.1} f={f} seed={7} />
			<NamekTree x={1010} y={hz + 40} s={1.25} f={f} seed={9} />
			<Dome x={250} y={hz + 70} s={0.75} />
			<Dome x={820} y={hz + 90} s={0.9} />
			<Dome x={560} y={hz + 30} s={0.55} />
			{/* gousse posée au loin */}
			<PeaShip x={1120} y={hz + 10} scale={0.18} rot={-8} frame={f} />
			{Array.from({length: 22}, (_, i) => (
				<circle key={i} cx={random(`vf${i}`) * W} cy={hz + 140 + random(`vfy${i}`) * 600} r={6} fill={['#FFFFFF', '#FFE04A', '#9FE8FF'][i % 3]} />
			))}
		</g>
	);
};

// Namekiens du village : x, échelle, nuance
const NAMS: Array<[number, number, number]> = [[640, 0.62, 0], [930, 0.6, 2], [820, 0.5, 3], [1040, 0.52, 1]];

const Scene5: React.FC<{f: number}> = ({f}) => {
	const [a, b] = TL.s5shots;
	const l4 = TL.voices.l4, l5 = TL.voices.l5;
	const [f0, f1] = TL.fade;
	const ex = 760, ey = 1720, es = 0.7; // l'ancien
	const kx = 260, ky = 1740, ks = 0.78;
	const px = 470, py = 1760, ps = 0.48;
	// Namekiens qui sortent de derrière les maisons
	const peek = ip(f, [a + 10, a + 50], [0, 1]);
	const hide = f >= l4.end && f < l5.start ? 1 : 0;
	const walk = ip(f, [a, b], [0, 1], Easing.out(Easing.quad));
	const kwx = -200 + (kx + 200) * walk;
	const pwx = -360 + (px + 360) * walk;
	let zoom = ip(f, [a, b], [1.0, 1.08]), fx = 540, fy = 1380;
	if (f >= b && f < l4.start) { zoom = ip(f, [b, b + 10], [1.08, 1.6]); fx = 860; fy = 1440; }
	else if (f >= l4.start && f < l4.end) { zoom = ip(f, [l4.start, l4.start + 20], [1.6, 1.85]); fx = ex; fy = ey - 250 * es; }
	else if (f >= l4.end && f < l5.start) { zoom = 1.55; fx = ip(f, [l4.end, l4.end + 14], [ex, 400]); fy = 1500; }
	else if (f >= l5.start && f < l5.end) { zoom = ip(f, [l5.start, l5.start + 20], [1.6, 1.85]); fx = kx + 40; fy = ky - 260 * ks; }
	else if (f >= l5.end) { zoom = ip(f, [l5.end, f1], [1.5, 1.2]); fx = 600; fy = 1450; }
	const black = ip(f, [f0, f1], [0, 1], Easing.linear);
	const kiwiMood = 'determined';
	const elderLook: [number, number] = f < l5.start ? [-1, -0.1] : [-1, 0];
	return (
		<>
			<Svg cam={focus(zoom, fx, fy)}>
				<Village f={f} />
				{NAMS.map(([x, s, seed], i) => {
					const y = 1640 - (i % 2) * 60;
					const rise = (1 - peek) * 300;
					const lean = f >= l4.end && f < l5.start && i % 2 ? Math.sin(f * 0.3 + i) * 4 - 6 : 0;
					return (
						<g key={i} transform={`translate(0,${rise})`}>
							<Namekian x={x} y={y} scale={s} frame={f} seed={seed} look={hide && i === 0 ? [1, 0] : [-1, 0.05]} lean={lean} shadow={peek > 0.9}
								mood={f >= l5.end && f < f0 ? 'shock' : 'angry'} armL={20} armR={i === 1 && f > l5.end ? 120 : 20} />
						</g>
					);
				})}
				<Namekian x={ex} y={ey} scale={es} frame={f} elder seed={1} mood={f >= l5.end ? 'shock' : 'angry'} look={elderLook} mouth={mouthOf('l4', f)} armL={20} armR={10} />
				<PetitPoirsan x={pwx} y={py - (walk < 1 ? Math.abs(Math.sin(f * 0.5)) * 18 : 0)} scale={ps} frame={f} mood={f >= l4.start && f < l5.start ? 'fear' : 'shock'}
					look={f >= l4.end && f < l5.start ? [-1, -0.6] : [1, -0.4]} armL={40} armR={40} />
				<Kiwikolo x={kwx} y={ky} scale={ks} frame={f} mood={kiwiMood as any} look={f >= l4.end && f < l4.end + 25 ? [0.6, 0.5] : [1, -0.05]} crossed={f < l4.end || f >= l5.end + 15}
					armL={30} armR={f >= l4.end ? ip(f, [l4.end + 20, l4.end + 34], [30, 110]) : 30} cape={0.9} mouth={mouthOf('l5', f)} />
				<Grass frame={f} dark={0.05} wind={0.7} />
			</Svg>
			<Vignette o={0.4} />
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

/* ------------------------------------------------------------------ TEASER : Litcheezer entre en scène */
const Bolt: React.FC<{seed: string; x: number}> = ({seed, x}) => {
	let d = `M${x},0`;
	let cx = x;
	for (let i = 1; i <= 8; i++) { cx += (random(`${seed}${i}`) - 0.5) * 160; d += ` L${cx},${i * 110}`; }
	return <path d={d} stroke="#F2E6FF" strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.95} />;
};

/** Silhouette de litchi : peau bosselée, deux petites cornes. */
const LitchiHead: React.FC<{x: number; y: number; r: number; fill?: string}> = ({x, y, r, fill = '#050308'}) => (
	<g transform={`translate(${x},${y})`} fill={fill}>
		<circle r={r} />
		{Array.from({length: 28}, (_, i) => {
			const a = (i / 28) * Math.PI * 2;
			return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={r * 0.13} />;
		})}
		{[-1, 1].map((k) => <path key={k} d={`M${k * r * 0.5},${-r * 0.8} Q${k * r * 0.95},${-r * 1.4} ${k * r * 1.2},${-r * 1.15} Q${k * r * 0.85},${-r * 1.1} ${k * r * 0.75},${-r * 0.6} Z`} />)}
	</g>
);

const Teaser: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const [a, b, c] = TL.teaserShots;
	const end = SC.teaser[1];
	const strikes = [a + 14, a + 42, b + 10, b + 38, c + 6];
	const strike = strikes.find((k) => f >= k && f < k + 6);
	const lit = strike !== undefined ? 1 - (f - strike) / 6 : 0;
	let shot: React.ReactNode;
	if (f < b) {
		// le ciel de Namek s'assombrit, un immense vaisseau rond descend
		const p = ip(f, [a, b], [0, 1]);
		shot = (
			<Svg cam={focus(ip(f, [a, b], [1.0, 1.12]), 540, 1000)}>
				<defs>
					<linearGradient id="tsky" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0" stopColor="#0A1A22" />
						<stop offset="0.7" stopColor="#1E4A4A" />
						<stop offset="1" stopColor="#3E7A6A" />
					</linearGradient>
				</defs>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#tsky)" />
				{lit > 0 && <><Bolt seed={`b${strike}`} x={200 + (strike! % 3) * 260} /><rect width={W} height={H} fill="#FFFFFF" opacity={lit * 0.3} /></>}
				<g transform={`translate(540,${300 + p * 380})`} fill="#030406">
					<ellipse rx={520} ry={150} />
					<ellipse cy={-90} rx={300} ry={130} />
					{Array.from({length: 9}, (_, i) => <circle key={i} cx={-400 + i * 100} cy={40} r={14} fill="#FF4A2A" opacity={0.5 + 0.5 * Math.sin(f * 0.3 + i)} />)}
					<path d="M-300,150 L-360,330 M300,150 L360,330 M0,150 L0,360" stroke="#030406" strokeWidth={24} />
				</g>
				{[[150, 1450, 1], [900, 1500, 1.2]].map(([x, y, s], i) => <g key={i} opacity={0.95}><NamekTree x={x} y={y} s={s} f={f} seed={i} /></g>)}
				<rect y={1500} width={W} height={500} fill="#08201A" />
			</Svg>
		);
	} else if (f < c) {
		// silhouette sur un fauteuil volant, queue qui ondule, yeux rouges dans l'ombre
		const tail = Math.sin(f * 0.12) * 60;
		shot = (
			<Svg cam={focus(ip(f, [b, c], [1.0, 1.2]), 540, 1050)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#5A3A7A' : '#100A1A'} />
				{lit > 0 && <Bolt seed={`c${strike}`} x={820} />}
				<g fill="#050308">
					<path d={`M560,1380 C760,1400 ${820 + tail},1260 ${760 + tail},1120 C${740 + tail},1080 ${700 + tail},1100 ${720 + tail},1140 C${760 + tail},1240 680,1340 560,1330 Z`} />
					<LitchiHead x={540} y={1060} r={150} />
					<path d="M420,1180 Q540,1240 660,1180 L700,1420 L380,1420 Z" />
					{/* fauteuil volant */}
					<path d="M260,1380 Q540,1560 820,1380 L780,1460 Q540,1600 300,1460 Z" />
					<ellipse cx={540} cy={1560} rx={140} ry={30} fill="#5A2A8A" opacity={0.5} filter="url(#blur20)" />
				</g>
				{[[486, 1050], [594, 1050]].map(([x, y], i) => (
					<ellipse key={i} cx={x} cy={y} rx={30} ry={10} fill="#FF2A6A" opacity={0.6 + lit * 0.4} filter="url(#blur3)" transform={`rotate(${i ? -12 : 12},${x},${y})`} />
				))}
			</Svg>
		);
	} else {
		// gros plan : deux yeux rouges et un sourire en coin dans le noir
		const z = ip(f, [c, end], [1.0, 1.25]);
		shot = (
			<Svg cam={focus(z, 540, 900)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#06040A" />
				{lit > 0 && <rect width={W} height={H} fill="#B48AFF" opacity={lit * 0.35} />}
				<LitchiHead x={540} y={900} r={460} fill={lit > 0 ? '#2A1A3A' : '#0E0A14'} />
				{[[380, 830], [700, 830]].map(([x, y], i) => (
					<g key={i} transform={`rotate(${i ? -14 : 14},${x},${y})`}>
						<ellipse cx={x} cy={y} rx={110} ry={34} fill="#FF2A6A" opacity={0.7} filter="url(#blur8)" />
						<ellipse cx={x} cy={y} rx={70} ry={16} fill="#FFC0D0" />
					</g>
				))}
				<path d="M400,1050 Q560,1120 700,1010" stroke="#B0204A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />
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
					<div style={{fontFamily: 'Bangers', fontSize: 140, lineHeight: 1, letterSpacing: 5, color: '#FF6A9A', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 #5A1030'}}>LITCHEEZER<br />ENTRE EN SCÈNE</div>
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

/** recap : sans son ni sous-titres (plans repris dans le « Précédemment » de l'ép.4). */
export const Episode3: React.FC<{recap?: boolean}> = ({recap}) => {
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
			{!recap && <Audio src={staticFile('audio/ep3/mix.wav')} />}
		</AbsoluteFill>
	);
};
