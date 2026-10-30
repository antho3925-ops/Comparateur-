import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pomgoku} from './characters';
import {Kiwikolo} from './characters2';
import {Stars, Vegenade} from './characters3';
import {PomShip} from './characters4';
import {Litcheezer} from './characters5';
import {Episode4} from './Episode4';
import {INK, SharedDefs, SW} from './parts';
import {Crater, Dust, H, W} from './scenery';
import {Impact, SpeedLines} from './scenery2';
import timeline from './timeline5.json';
import voices from './voices5.json';

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
const litMouth = (f: number) => Math.max(mouthOf('l3', f), mouthOf('l5', f));

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

/* ------------------------------------------------------------------ DÉCOR : village namekien en ruines */
const NamekTree: React.FC<{x: number; y: number; s: number; f: number; seed: number; broken?: boolean}> = ({x, y, s, f, seed, broken}) => (
	<g transform={`translate(${x},${y}) scale(${s}) rotate(${broken ? 0 : Math.sin(f * 0.05 + seed) * 2})`}>
		{broken ? (
			<g>
				<path d="M-12,0 Q-14,-70 -8,-130 L-2,-112 L4,-150 L10,-118 L14,0 Z" fill="#3A3A30" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
				<g transform="translate(70,-10) rotate(78)">
					<path d="M-8,0 L-6,-110 L6,-110 L8,0 Z" fill="#3A3A30" stroke={INK} strokeWidth={5} />
					<circle cx={0} cy={-160} r={60} fill="#2A3A2A" stroke={INK} strokeWidth={6} />
				</g>
			</g>
		) : (
			<g>
				<path d="M-10,0 Q-14,-120 -4,-230 L8,-230 Q14,-120 10,0 Z" fill="#6A7A5A" stroke={INK} strokeWidth={5} />
				<circle cx={0} cy={-290} r={78} fill="#2E8A4A" stroke={INK} strokeWidth={7} />
				<circle cx={-22} cy={-312} r={40} fill="#58B86A" opacity={0.75} />
			</g>
		)}
	</g>
);

/** Maison ronde effondrée : coupole éventrée, intérieur noirci, gravats. */
const BrokenDome: React.FC<{x: number; y: number; s: number; seed: number}> = ({x, y, s, seed}) => {
	const cut = Array.from({length: 9}, (_, i) => {
		const px = -190 + i * 47.5;
		const py = -60 - random(`bd${seed}${i}`) * 120 - (i === 4 ? 0 : 20);
		return `L${px},${py}`;
	}).join(' ');
	const cid = `bdclip${seed}`;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={4} rx={220} ry={28} fill="#000" opacity={0.3} filter="url(#blur8)" />
			<clipPath id={cid}><path d={`M-200,10 ${cut} L200,10 Z`} /></clipPath>
			<path d="M-160,0 C-160,-200 160,-200 160,0 Z" fill="#1A1410" />
			<g clipPath={`url(#${cid})`}>
				<path d="M-170,0 C-170,-230 170,-230 170,0 Z" fill="#B8B09A" stroke={INK} strokeWidth={SW} />
				<path d="M-170,0 C-170,-60 170,-60 170,0" stroke="#8A826C" strokeWidth={6} fill="none" />
				{/* traces de brûlure */}
				<ellipse cx={-60} cy={-80} rx={70} ry={50} fill="#2A2018" opacity={0.55} filter="url(#blur8)" />
				<ellipse cx={90} cy={-50} rx={50} ry={40} fill="#2A2018" opacity={0.5} filter="url(#blur8)" />
			</g>
			<clipPath id={`${cid}o`}><path d="M-170,0 C-170,-230 170,-230 170,0 Z" /></clipPath>
			<path d={`M-200,10 ${cut} L200,10`} fill="none" stroke={INK} strokeWidth={SW} clipPath={`url(#${cid}o)`} />
			{/* gravats */}
			{Array.from({length: 7}, (_, i) => {
				const gx = -210 + random(`gr${seed}${i}`) * 420;
				const gs = 18 + random(`gs${seed}${i}`) * 26;
				return <path key={i} d={`M${gx - gs},0 L${gx - gs * 0.6},${-gs} L${gx + gs * 0.7},${-gs * 0.8} L${gx + gs},0 Z`} fill="#A39A84" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
			})}
		</g>
	);
};

/** Colonne de fumée qui monte en volutes. */
const Smoke: React.FC<{x: number; y: number; f: number; seed: number; h?: number; s?: number; dark?: boolean}> = ({x, y, f, seed, h = 900, s = 1, dark}) => (
	<g>
		{Array.from({length: 12}, (_, i) => {
			const p = (f * 0.0045 * (1 + random(`sm${seed}`) * 0.4) + i / 12) % 1;
			const r = (40 + p * 150) * s;
			const cx = x + Math.sin(p * 5 + seed + i) * 40 * s + p * 140 * s;
			const cy = y - p * h * s;
			return <circle key={i} cx={cx} cy={cy} r={r} fill={dark ? '#2A2624' : i % 2 ? '#5E5854' : '#7A726C'} opacity={(1 - p) * 0.7} filter="url(#blur8)" />;
		})}
	</g>
);

/** Petit feu qui crépite. */
const Fire: React.FC<{x: number; y: number; s: number; f: number; seed: number}> = ({x, y, s, f, seed}) => {
	const fl = (k: number) => 1 + Math.sin(f * 0.9 + seed + k) * 0.12 + Math.sin(f * 1.7 + k) * 0.06;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={-30} rx={90} ry={70} fill="#FF7A1A" opacity={0.35} filter="url(#blur20)" />
			<path d={`M-50,0 Q-60,${-70 * fl(0)} -10,${-130 * fl(1)} Q0,${-80 * fl(2)} 20,${-110 * fl(3)} Q60,${-60 * fl(4)} 50,0 Z`} fill="#FF6A1A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
			<path d={`M-26,0 Q-30,${-50 * fl(2)} 0,${-80 * fl(0)} Q30,${-46 * fl(1)} 26,0 Z`} fill="#FFD23F" />
			{/* braises */}
			{[0, 1, 2].map((i) => {
				const p = (f * 0.03 + i / 3 + seed * 0.1) % 1;
				return <circle key={i} cx={Math.sin(p * 8 + i) * 30} cy={-60 - p * 200} r={5} fill="#FFB040" opacity={1 - p} />;
			})}
		</g>
	);
};

/** Ciel de Namek voilé par la fumée. */
const SmokySky: React.FC<{f: number; hz: number}> = ({f, hz}) => (
	<g>
		<defs>
			<linearGradient id="rsky" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#3A4448" />
				<stop offset="0.6" stopColor="#7A8478" />
				<stop offset="1" stopColor="#C8A880" />
			</linearGradient>
		</defs>
		<rect x={-600} y={-800} width={W + 1200} height={hz + 840} fill="url(#rsky)" />
		{[[240, 300, 60], [520, 220, 44], [860, 340, 52]].map(([x, y, r], i) => (
			<g key={i} opacity={0.45}>
				<circle cx={x} cy={y} r={r * 2.2} fill="#FFE8C0" opacity={0.3} filter="url(#blur20)" />
				<circle cx={x} cy={y} r={r} fill="#F0E2C0" />
			</g>
		))}
		{[[100, 520, 1.3], [700, 600, 1.1], [400, 760, 0.9], [900, 150, 1.0]].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${((x + f * (0.5 + i * 0.15)) % 1600) - 260},${y}) scale(${s})`} opacity={0.75}>
				{[[-70, 0, 50], [-20, -30, 65], [40, -15, 55], [80, 10, 40], [0, 15, 55]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill="#5A5856" />)}
			</g>
		))}
	</g>
);

const HZ = 1180;
/** Village namekien dévasté. */
const Ruins: React.FC<{f: number; crater?: boolean}> = ({f, crater}) => (
	<g>
		<SmokySky f={f} hz={HZ - 120} />
		<rect x={-600} y={HZ - 120} width={W + 1200} height={140} fill="#5A7A70" />
		{[[120, HZ - 110, 0.3], [520, HZ - 100, 0.22], [880, HZ - 112, 0.35]].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
				<path d="M-200,0 Q0,-90 200,0 Z" fill="#4A6A5A" stroke={INK} strokeWidth={10} />
				<NamekTree x={0} y={-50} s={1} f={f} seed={i} broken={i !== 1} />
			</g>
		))}
		<defs>
			<linearGradient id="rgrass" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stopColor="#6A7A5A" />
				<stop offset="1" stopColor="#2E3A2A" />
			</linearGradient>
		</defs>
		<path d={`M-600,${HZ} Q540,${HZ - 50} 1680,${HZ} L1680,2600 L-600,2600 Z`} fill="url(#rgrass)" stroke={INK} strokeWidth={6} />
		{/* traces noires au sol */}
		{[[300, 1500, 260], [800, 1650, 220], [560, 1900, 300]].map(([x, y, r], i) => (
			<ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.22} fill="#1A1A14" opacity={0.45} filter="url(#blur8)" />
		))}
		<Smoke x={250} y={HZ + 40} f={f} seed={1} h={1000} s={0.8} />
		<Smoke x={820} y={HZ + 60} f={f} seed={2} h={1100} s={0.95} dark />
		<Smoke x={560} y={HZ + 10} f={f} seed={3} h={800} s={0.6} />
		<NamekTree x={60} y={HZ + 60} s={1.1} f={f} seed={7} broken />
		<NamekTree x={1010} y={HZ + 40} s={1.25} f={f} seed={9} broken />
		<BrokenDome x={250} y={HZ + 70} s={0.75} seed={1} />
		<BrokenDome x={820} y={HZ + 90} s={0.9} seed={2} />
		<BrokenDome x={560} y={HZ + 30} s={0.55} seed={3} />
		<Fire x={330} y={HZ + 80} s={0.6} f={f} seed={1} />
		<Fire x={740} y={HZ + 100} s={0.7} f={f} seed={2} />
		<Fire x={600} y={HZ + 40} s={0.4} f={f} seed={3} />
		<Fire x={120} y={HZ + 200} s={0.5} f={f} seed={4} />
		{crater && <Crater x={540} y={1560} s={0.9} glow={0.6} />}
		{/* cendres qui tombent */}
		{Array.from({length: 26}, (_, i) => {
			const p = (random(`as${i}`) + f * 0.002 * (0.6 + random(`av${i}`))) % 1;
			return <circle key={i} cx={random(`ax${i}`) * W + Math.sin(f * 0.03 + i) * 30} cy={-100 + p * 2200} r={3 + random(`ar${i}`) * 4} fill={i % 3 ? '#C8C0B8' : '#FF9A4A'} opacity={0.7} />;
		})}
	</g>
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
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 80, color: '#FFFFFF', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>Épisode 5</div>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 96, lineHeight: 1.1, marginTop: 20, color: '#FF6A5A', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>Pomgoku débarque</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ PRÉCÉDEMMENT (plans de l'ép.4 en accéléré) */
// le vaisseau rond descend, le doigt levé et le flash, le village détruit, Pomgoku au hublot
const RECAP_SHOTS = [425, 1110, 1200, 1760];
const Recap: React.FC<{f: number}> = ({f}) => {
	const s = SC.recap[0];
	const len = (SC.recap[1] - s) / RECAP_SHOTS.length;
	const i = Math.min(RECAP_SHOTS.length - 1, Math.floor((f - s) / len));
	const local = f - s - i * len;
	const ep4 = Math.round(RECAP_SHOTS[i] + local * 2);
	const scan = (f * 37) % 1920;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(1.3) contrast(1.05)'}}>
				<Freeze frame={ep4}><Episode4 recap /></Freeze>
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

/* ------------------------------------------------------------------ SCÈNE 1 : le vaisseau s'ouvre, le village en ruines (11 s) */
const Steam: React.FC<{x: number; y: number; t: number; seed: string}> = ({x, y, t, seed}) => (
	<g opacity={ip(t, [0, 0.1, 0.7, 1], [0, 1, 0.8, 0], Easing.linear)}>
		{Array.from({length: 14}, (_, i) => {
			const a = -Math.PI / 2 + (random(`${seed}a${i}`) - 0.5) * 2.4;
			const d = (80 + random(`${seed}d${i}`) * 360) * Math.sqrt(t);
			const r = (40 + random(`${seed}r${i}`) * 70) * (0.5 + t * 1.6);
			return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 1.2} r={r} fill="#F4F4F2" opacity={0.75} filter="url(#blur8)" />;
		})}
	</g>
);

/** Vaisseau rond de Pomgoku (ép.4) dont la coque s'ouvre en deux moitiés. */
const PomShipOpen: React.FC<{x: number; y: number; scale: number; frame: number; open: number}> = ({x, y, scale, frame, open}) => (
	<g transform={`translate(${x},${y}) scale(${scale})`}>
		<clipPath id="psL"><path d="M-400,-400 L20,-400 L-10,-120 L30,60 L-10,400 L-400,400 Z" /></clipPath>
		<clipPath id="psR"><path d="M400,-400 L20,-400 L-10,-120 L30,60 L-10,400 L400,400 Z" /></clipPath>
		{open > 0 && <ellipse cx={0} cy={0} rx={60 + open * 160} ry={200} fill="#1A1A22" stroke={INK} strokeWidth={SW} />}
		<g transform={`translate(${-open * 120},${open * 30}) rotate(${-open * 28},-200,200)`} clipPath="url(#psL)">
			<PomShip x={0} y={0} scale={1} frame={frame} trail={0} />
		</g>
		<g transform={`translate(${open * 120},${open * 30}) rotate(${open * 28},200,200)`} clipPath="url(#psR)">
			<PomShip x={0} y={0} scale={1} frame={frame} trail={0} />
		</g>
	</g>
);

const Scene1: React.FC<{f: number}> = ({f}) => {
	const [, pov, cry, talk] = TL.s1shots;
	const op = TL.open;
	const l1 = TL.voices.l1, c1 = TL.voices.c1;
	if (f < pov) {
		// le vaisseau fumant au fond de son cratère s'ouvre dans un souffle de vapeur
		const br = ip(f, [op, op + 14], [0, 1], Easing.out(Easing.back(2)));
		const rise = ip(f, [op + 20, pov - 20], [0, 1], Easing.out(Easing.cubic));
		const [sx, sy] = shake(f, ip(f, [op - 2, op, op + 12], [0, 10, 0]));
		return (
			<>
				<Svg cam={focus(ip(f, [SC.s1[0], pov], [1.05, 1.35]), 540, 1430, sx, sy)}>
					<Ruins f={f} crater />
					{f >= op + 16 && <Pomgoku x={540} y={1600 - rise * 40} scale={0.62} frame={f} mood="shock" look={[0, -0.3]} armL={30} armR={30} shadow={false} wind={0.6} />}
					<PomShipOpen x={540} y={1480} scale={0.62} frame={f} open={br} />
					{f < op && <Smoke x={540} y={1460} f={f} seed={5} h={500} s={0.5} />}
					{f >= op - 2 && <Steam x={540} y={1500} t={ip(f, [op - 2, op + 50], [0, 1], Easing.linear)} seed="st1" />}
				</Svg>
				<Vignette o={0.55} />
				<Flash f={f} at={op} color="#FFFFFF" peak={0.35} len={8} />
			</>
		);
	}
	if (f < cry) {
		// vue subjective : les yeux de Pomgoku s'ouvrent sur les ruines, la caméra tremble
		const t = f - pov;
		const [sx, sy] = shake(f, 7 + Math.sin(f * 0.2) * 3);
		const lid = ip(t, [0, 10], [1, 0]) + ip(t, [40, 44, 48], [0, 0.6, 0]);
		return (
			<>
				<Svg cam={focus(ip(t, [0, cry - pov], [1.45, 1.6]), ip(t, [0, cry - pov], [330, 760]), 1260, sx, sy, Math.sin(f * 0.07) * 2)}>
					<Ruins f={f} />
				</Svg>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 85%)'}} />
				<div style={{position: 'absolute', left: -100, right: -100, top: -200, height: 200 + 760 * lid, background: '#000', borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%'}} />
				<div style={{position: 'absolute', left: -100, right: -100, bottom: -200, height: 200 + 760 * lid, background: '#000', borderTopLeftRadius: '50%', borderTopRightRadius: '50%'}} />
			</>
		);
	}
	// cri de colère puis la réplique, Pomgoku au milieu des ruines
	const crying = f < talk;
	const [sx, sy] = shake(f, crying ? 14 : f < l1.end ? 2 : 0);
	const zoom = crying ? ip(f, [cry, cry + 8], [1.7, 2.3], Easing.out(Easing.cubic)) : ip(f, [talk, SC.s1[1]], [1.6, 1.85]);
	const face: [number, number] = [540, 1650 - 250 * 0.95];
	const fist = f >= l1.end + 4;
	return (
		<>
			<Svg cam={focus(zoom, face[0], face[1] + (crying ? 0 : 60), sx, sy)}>
				<Ruins f={f} />
				<Pomgoku x={540} y={1650} scale={0.95} frame={f} mood={crying ? 'shock' : f < l1.cuts[0] ? 'shock' : 'angry'}
					mouth={crying ? Math.max(mouthOf('c1', f), f < c1.end + 6 ? 0.85 : 0) : mouthOf('l1', f)}
					look={crying ? [0, -0.5] : f < l1.end ? [0.4, 0] : [0, 0.4]} armL={crying ? 150 : fist ? 35 : 25} armR={crying ? 150 : fist ? 40 : 25} fistR={fist} wind={crying ? 1.6 : 0.6} shadow={false} />
			</Svg>
			{crying && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,60,40,0.25), transparent 60%)'}} />}
			<Vignette o={0.6} />
			<Flash f={f} at={cry} color="#FFFFFF" peak={0.45} len={6} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 2 : Kiwikolo et Végénade arrivent (11 s) */
const Scene2: React.FC<{f: number}> = ({f}) => {
	const [, fly, three] = TL.s2shots;
	const land = TL.land;
	const l2 = TL.voices.l2;
	if (f < fly) {
		// plans d'ambiance : braises, fumée, Pomgoku de dos qui contemple
		const t = f - SC.s2[0];
		return (
			<>
				<Svg cam={focus(ip(t, [0, fly - SC.s2[0]], [1.2, 1.3]), ip(t, [0, 70], [700, 520]), 1300)}>
					<Ruins f={f} />
					<Pomgoku x={380} y={1700} scale={0.9} frame={f} mood="angry" look={[1, -0.2]} armL={30} armR={35} fistR darken={0.55} shadow={false} wind={0.8} />
				</Svg>
				<Vignette o={0.6} />
			</>
		);
	}
	// trois personnages : Pomgoku à gauche, Kiwikolo au centre, Végénade à droite qui détourne le regard
	const k = ip(f, [fly, land], [0, 1], Easing.in(Easing.quad));
	const ky = 1700 - (1 - k) * 1500, vy = 1700 - (1 - ip(f, [fly + 8, land + 4], [0, 1], Easing.in(Easing.quad))) * 1600;
	const landed = f >= land;
	const squashK = ip(f, [land, land + 4, land + 12], [0, 0.6, 0]);
	const [sx, sy] = shake(f, ip(f, [land, land + 2, land + 14], [0, 14, 0]));
	let zoom = 1.15, fx = 560, fy = 1430;
	if (f >= l2.start && f < l2.end + 10) { zoom = ip(f, [l2.start, l2.start + 12], [1.15, 1.8]); fx = ip(f, [l2.start, l2.start + 12], [560, 600]); fy = ip(f, [l2.start, l2.start + 12], [1430, 1700 - 260 * 0.8]); }
	else if (f >= l2.end + 10 && f < l2.end + 42) { zoom = 2.1; fx = 230; fy = 1700 - 250 * 0.78; }
	else if (f >= l2.end + 42) { zoom = ip(f, [l2.end + 42, SC.s2[1]], [1.9, 2.05]); fx = 900; fy = 1700 - 270 * 0.8; }
	const pomFist = f >= l2.end + 10;
	return (
		<>
			<Svg cam={focus(zoom, fx, fy, sx, sy)}>
				<Ruins f={f} />
				{landed && <Dust x={600} y={1710} t={ip(f, [land, land + 40], [0.05, 0.7])} n={14} seed="ld" color="#8A8274" spread={0.7} opacity={ip(f, [land, land + 60], [1, 0])} />}
				<Pomgoku x={230} y={1720} scale={0.78} frame={f} mood="angry" look={f < land ? [0.6, -0.8] : f < l2.end + 10 ? [1, -0.1] : [0.2, 0.4]}
					armL={pomFist ? 35 : 25} armR={pomFist ? 40 : 25} fistR={pomFist} shadow={false} wind={0.6}
					squash={pomFist ? Math.sin(f * 1.3) * 0.08 : 0} />
				<Kiwikolo x={600} y={ky} scale={0.8} frame={f} mood="determined" look={landed ? [-1, -0.05] : [0, 1]} crossed={landed && f > land + 18}
					armL={landed ? 30 : 160} armR={landed ? 30 : 160} cape={landed ? 0.6 : 1.4} squash={squashK} mouth={mouthOf('l2', f)} shadow={landed} lean={landed ? 0 : -6} />
				<Vegenade x={900} y={vy} scale={0.8} frame={f} flip mood="sneer" crossed={f > land + 10} armL={150} armR={150} shadow={f >= land + 4}
					look={f < land + 4 ? [0, 1] : f >= l2.end + 42 && f < l2.end + 60 ? [1, 0] : [-1, 0.3]} lean={f < land + 4 ? 6 : f >= l2.start ? -8 : -3} />
				{!landed && <SpeedLines frame={f} angle={90} opacity={0.5} />}
			</Svg>
			<Vignette o={0.55} />
			<Flash f={f} at={land} peak={0.4} len={8} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 : Litcheezer en contre-plongée (11 s) */
const Scene3: React.FC<{f: number}> = ({f}) => {
	const [s, reveal, react] = TL.s3shots;
	const l3 = TL.voices.l3;
	if (f < reveal) {
		// le ciel enfumé, un éclat rose tout là-haut
		const t = f - s;
		return (
			<>
				<Svg cam={focus(ip(t, [0, 60], [1.1, 1.25]), 540, ip(t, [0, 60], [1000, 700]), 0, 0, -6)}>
					<SmokySky f={f} hz={2400} />
					<circle cx={600} cy={420} r={ip(t, [20, 60], [4, 30])} fill="#FFE0EE" opacity={ip(t, [20, 40], [0, 1])} filter="url(#blur3)" />
					<path d={`M600,${420 - 60} L600,${420 + 60} M${600 - 60},420 L${600 + 60},420`} stroke="#FFFFFF" strokeWidth={4} opacity={ip(t, [36, 50, 60], [0, 1, 0.4])} />
				</Svg>
				<Vignette o={0.5} />
			</>
		);
	}
	if (f < react) {
		// contre-plongée : Litcheezer flotte, les héros en silhouette au premier plan
		const t = f - reveal;
		const float = Math.sin(f * 0.06) * 14;
		return (
			<>
				<Svg cam={focus(ip(t, [0, react - reveal], [1.0, 1.12]), 540, ip(t, [0, react - reveal], [900, 820]), 0, 0, ip(t, [0, react - reveal], [-5, -2]))}>
					<SmokySky f={f} hz={2400} />
					<ellipse cx={540} cy={560} rx={360} ry={480} fill="#E6CCFF" opacity={0.18} filter="url(#blur20)" />
					<g transform={`translate(540,${880 + float}) scale(1,0.92)`}>
						<Litcheezer x={0} y={0} scale={1.45} frame={f} grin={l3.end < f ? 0.75 : 0.55} mouth={litMouth(f)} look={[0, 0.9]} armL={30} armR={30}
							crossed={t > 25} aura={0.6} legs={1} shadow={false} />
					</g>
					{/* silhouettes des héros, vus de dos, au premier plan */}
					<g opacity={0.95}>
						<Pomgoku x={250} y={2200} scale={1.35} frame={f} mood="angry" darken={0.92} shadow={false} wind={0.8} armL={30} armR={30} />
						<Kiwikolo x={760} y={2240} scale={1.3} frame={f} darken={0.92} shadow={false} crossed cape={0.8} />
						<Vegenade x={1110} y={2280} scale={1.2} frame={f} darken={0.92} shadow={false} flip />
					</g>
				</Svg>
				<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(230,204,255,0.12), transparent 50%)'}} />
				<Vignette o={0.55} />
				<Flash f={f} at={reveal} color="#FFE6F2" peak={0.5} len={10} />
			</>
		);
	}
	// réactions silencieuses : les trois héros lèvent les yeux (on entend son petit rire)
	const t = f - react;
	const [sx, sy] = shake(f, 1.5);
	return (
		<>
			<Svg cam={focus(ip(t, [0, SC.s3[1] - react], [1.35, 1.5]), 560, 1430, sx, sy)}>
				<Ruins f={f} />
				<Pomgoku x={230} y={1720} scale={0.78} frame={f} mood="angry" look={[0.4, -1]} armL={35} armR={40} fistR shadow={false} />
				<Kiwikolo x={590} y={1700} scale={0.8} frame={f} mood="shock" look={[0.2, -1]} crossed={false} armL={40} armR={40} shadow={false} />
				<Vegenade x={900} y={1700} scale={0.8} frame={f} flip mood="angry" look={[0.3, -1]} crossed={false} armL={30} armR={30} rage={0.4} shadow={false} />
			</Svg>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(230,204,255,0.18), transparent 40%)'}} />
			<Vignette o={0.6} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 : l'échange de coups (13 s) */
// esquive pour chaque coup : décalage x, y, inclinaison
const DODGE: Array<[number, number, number]> = [[170, -40, 22], [70, -210, -12], [180, 20, 26], [50, -240, -16], [190, -90, 18], [160, 0, 24]];

const Scene4: React.FC<{f: number}> = ({f}) => {
	const [, prep, rush, slow, after] = TL.s4shots;
	const l4 = TL.voices.l4;
	const blows: number[] = TL.blows;
	if (f < prep) {
		// gros plan sur Pomgoku : la réplique, puis le regard qui se durcit
		const [sx, sy] = shake(f, f > l4.end ? 2 : 0);
		return (
			<>
				<Svg cam={focus(ip(f, [SC.s4[0], prep], [1.9, 2.15]), 420, 1700 - 250 * 0.95, sx, sy)}>
					<Ruins f={f} />
					<Litcheezer x={860} y={1640} scale={0.85} frame={f} grin={0.6} crossed look={[-1, 0]} legs={0.6} darken={0.3} shadow={false} />
					<Pomgoku x={420} y={1700} scale={0.95} frame={f} mood="determined" mouth={mouthOf('l4', f)} look={[1, -0.1]} armL={30} armR={f > l4.end ? 40 : 30} fistR={f > l4.end} shadow={false} wind={0.8} />
				</Svg>
				<Vignette o={0.55} />
			</>
		);
	}
	if (f < rush) {
		// préparation : Pomgoku se ramasse, la poussière se soulève
		const t = f - prep;
		const crouch = ip(t, [0, 30], [0, 1]);
		const [sx, sy] = shake(f, 3 + crouch * 5);
		return (
			<>
				<Svg cam={focus(ip(t, [0, rush - prep], [1.25, 1.4]), 560, 1450, sx, sy)}>
					<Ruins f={f} />
					<Dust x={300} y={1720} t={crouch * 0.4} n={10} seed="pr" color="#8A8274" spread={0.5} opacity={crouch * 0.8} />
					<ellipse cx={300} cy={1560} rx={200} ry={260} fill="#FF6A3A" opacity={0.18 * crouch} filter="url(#blur20)" />
					<Pomgoku x={300} y={1720} scale={0.82} frame={f} mood="determined" look={[1, 0]} squash={crouch * 0.6} lean={crouch * 10} armL={40} armR={60} fistR wind={1.2} />
					<Litcheezer x={830} y={1660} scale={0.8} frame={f} grin={0.7} crossed look={[-1, 0.1]} legs={0.6} />
				</Svg>
				<Vignette o={0.55} />
			</>
		);
	}
	if (f < slow) {
		// montage rapide : chaque coup frappe dans le vide
		let i = 0;
		blows.forEach((b, k) => { if (f >= b) i = k; });
		const b = blows[i];
		const t = f - b;
		const [dx, dy, dl] = DODGE[i];
		const dodge = ip(t, [2, 7], [0, 1], Easing.out(Easing.cubic));
		const lunge = ip(t, [0, 6], [0, 1], Easing.out(Easing.cubic));
		const mirror = i % 2 === 1;
		const lx = 700, ly = 1660;
		const px = 200 + lunge * 220;
		const [sx, sy] = shake(f, ip(t, [4, 6, 14], [0, 12, 0]));
		const angle = [-6, 5, -3, 7, -5, 4][i];
		const zoom = [1.35, 1.6, 1.45, 1.7, 1.5, 1.65][i];
		return (
			<>
				<Svg cam={`${mirror ? 'translate(1080,0) scale(-1,1) ' : ''}${focus(zoom, 520, 1450 - (i % 3) * 40, sx, sy, angle)}`}>
					<rect x={-600} y={-800} width={W + 1200} height={3400} fill={i % 2 ? '#3A2A4A' : '#4A3A2A'} />
					<SpeedLines frame={f} angle={i % 2 ? -10 : 10} n={22} opacity={0.6} />
					<Pomgoku x={px} y={1700} scale={0.82} frame={f} mood="angry" look={[1, -0.1]} lean={lunge * 14} armL={140} armR={lunge > 0.3 ? 92 : 50}
						reachLen={120 + lunge * 110} fistR mouth={lunge > 0.3 ? 0.5 : 0} wind={1.6} />
					<Litcheezer x={lx + dx * dodge} y={ly + dy * dodge} scale={0.82} frame={f} grin={0.8} look={[-1, 0]} lean={dl * dodge}
						armL={20} armR={ip(t, [2, 8], [30, 150])} legs={0.5} />
					{t >= 4 && t < 12 && <Impact x={px + 330} y={1500} s={ip(t, [4, 12], [0.4, 0.9])} color="#FFFFFF" rot={t * 6} />}
				</Svg>
				<Flash f={f} at={b + 4} peak={0.5} len={4} />
			</>
		);
	}
	if (f < after) {
		// ralenti : le dernier poing frôle sa joue, il incline à peine la tête
		const t = (f - slow) / (after - slow);
		return (
			<>
				<Svg cam={focus(ip(t, [0, 1], [1.45, 1.6], Easing.linear), 600, 1330)}>
					<rect x={-600} y={-800} width={W + 1200} height={3400} fill="#2A2238" />
					<SpeedLines frame={f * 0.2} angle={0} n={18} opacity={0.35} />
					<Litcheezer x={780} y={1700} scale={0.95} frame={f} grin={0.9} look={[-0.8, 0.1]} lean={ip(t, [0, 0.4], [0, 16])} armL={20} armR={30} legs={0.4} />
					<Pomgoku x={ip(t, [0, 1], [300, 340], Easing.linear)} y={1480} scale={0.95} frame={f} mood="angry" look={[1, -0.2]} lean={6} armL={140} armR={96} reachLen={ip(t, [0, 1], [170, 260], Easing.linear)} fistR wind={0.4} />
				</Svg>
				<AbsoluteFill style={{background: 'rgba(60,30,90,0.18)', mixBlendMode: 'multiply'}} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 90%)'}} />
			</>
		);
	}
	// conséquences : Pomgoku essoufflé, Litcheezer intact s'époussette l'épaule
	const t = f - after;
	return (
		<>
			<Svg cam={focus(ip(t, [0, SC.s4[1] - after], [1.4, 1.5]), 560, 1460)}>
				<Ruins f={f} />
				<Pomgoku x={330} y={1720} scale={0.82} frame={f} mood="shock" look={[1, -0.1]} squash={Math.sin(f * 0.5) * 0.08} armL={20} armR={30} fistR shadow={false} />
				{[0, 1].map((k) => {
					const p = ((f * 0.04) + k * 0.5) % 1;
					return <path key={k} d={`M${430 + k * 30},${1360 + p * 60} q-10,16 0,24 q10,-8 0,-24`} fill="#9FE0FF" stroke="#2E7EC0" strokeWidth={3} opacity={1 - p} />;
				})}
				<Litcheezer x={800} y={1660} scale={0.82} frame={f} grin={0.85} look={[-0.6, 0.2]} armL={ip(t, [5, 15], [20, 150]) - Math.sin(f * 0.6) * 8} armR={20} legs={0.4} />
			</Svg>
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 : gros plan, il étire son cou (11 s) */
const CrackMark: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
	<g transform={`translate(${x},${y}) scale(${0.6 + p * 0.6})`} opacity={1 - p}>
		{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M0,-20 L0,-46" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />)}
		<text x={40} y={-30} fontFamily="Bangers" fontSize={54} fill="#FFFFFF" stroke="#000" strokeWidth={8} paintOrder="stroke">CRAC</text>
	</g>
);

const Scene5: React.FC<{f: number}> = ({f}) => {
	const cracks: number[] = TL.cracks;
	const [f0, f1] = TL.fade;
	const tilt = interpolate(f, [SC.s5[0] + 15, cracks[0], cracks[0] + 10, cracks[1], cracks[1] + 10, cracks[2], cracks[3], cracks[3] + 12],
		[0, -18, -14, 18, 14, -6, 4, 0], {...clamp, easing: ease});
	const grin = ip(f, [SC.s5[0], f0], [0.45, 1], Easing.in(Easing.quad));
	const zoom = ip(f, [SC.s5[0], f0], [1.9, 2.6]);
	const black = ip(f, [f0, f1], [0, 1], Easing.linear);
	return (
		<>
			<Svg cam={focus(zoom, 540, 1540 - 420 * 1.1)}>
				<Ruins f={f} />
				<rect x={-600} y={-800} width={W + 1200} height={3400} fill="#1A0A2A" opacity={0.45} />
				<ellipse cx={540} cy={1250} rx={300} ry={360} fill="#B48AFF" opacity={0.2} filter="url(#blur20)" />
				<Litcheezer x={540} y={1540} scale={1.1} frame={f} grin={grin} tilt={tilt} mouth={litMouth(f)} look={[0, 0.15]} armL={20} armR={20} legs={0.3} shadow={false} aura={ip(f, [SC.s5[0], f0], [0.1, 0.5])} />
				{cracks.map((c, i) => f >= c && f < c + 14 && <CrackMark key={i} x={540 + (i % 2 ? 110 : -130)} y={1540 - 180 * 1.1} p={(f - c) / 14} />)}
			</Svg>
			{/* lumière violette par en dessous */}
			<AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(150,80,220,0.28), transparent 55%)'}} />
			<Vignette o={0.7} />
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

/* ------------------------------------------------------------------ TEASER : les formes de Litcheezer */
const Bolt: React.FC<{seed: string; x: number}> = ({seed, x}) => {
	let d = `M${x},0`;
	let cx = x;
	for (let i = 1; i <= 8; i++) { cx += (random(`${seed}${i}`) - 0.5) * 160; d += ` L${cx},${i * 110}`; }
	return <path d={d} stroke="#F2E6FF" strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.95} />;
};

/** Silhouette cornue et massive : une autre forme, sans rien dévoiler. */
const HornedShape: React.FC<{x: number; y: number; s: number; fill?: string}> = ({x, y, s, fill = '#050308'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} fill={fill}>
		<path d="M-170,0 C-200,-200 -190,-420 -120,-520 C-60,-600 60,-600 120,-520 C190,-420 200,-200 170,0 Z" />
		<path d="M-110,-520 C-170,-620 -260,-660 -300,-760 C-220,-700 -150,-680 -80,-580 Z" />
		<path d="M110,-520 C170,-620 260,-660 300,-760 C220,-700 150,-680 80,-580 Z" />
		<path d="M-170,-320 C-260,-300 -320,-220 -330,-120 L-280,-120 C-260,-200 -220,-250 -160,-260 Z" />
		<path d="M170,-320 C260,-300 320,-220 330,-120 L280,-120 C260,-200 220,-250 160,-260 Z" />
		<path d="M120,-60 C300,-40 380,120 300,240 C280,140 220,60 110,40 Z" />
	</g>
);

const Teaser: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const [a, b, c] = TL.teaserShots;
	const end = SC.teaser[1];
	const strikes = [a + 18, a + 50, b + 12, b + 40, c + 8];
	const strike = strikes.find((k) => f >= k && f < k + 6);
	const lit = strike !== undefined ? 1 - (f - strike) / 6 : 0;
	let shot: React.ReactNode;
	if (f < b) {
		// silhouette de Litcheezer dans l'ombre, énergie qui crépite, il commence à grandir
		const p = ip(f, [a, b], [0, 1]);
		shot = (
			<Svg cam={focus(ip(f, [a, b], [1.0, 1.15]), 540, 1100)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#3A2A5A' : '#0E0818'} />
				{lit > 0 && <Bolt seed={`t${strike}`} x={220 + (strike! % 3) * 280} />}
				<ellipse cx={540} cy={1100} rx={360} ry={560} fill="#8A3DFF" opacity={0.25 + 0.1 * Math.sin(f * 0.7)} filter="url(#blur20)" />
				<g transform={`translate(540,1500) scale(${1 + p * 0.15},${1 + p * 0.3})`}>
					<Litcheezer x={0} y={0} scale={1.4} frame={f} darken={0.97} grin={0.9} armL={60} armR={60} shadow={false} legs={0.2} />
				</g>
				{Array.from({length: 10}, (_, i) => {
					const ang = random(`ta${i}${Math.floor(f / 3)}`) * Math.PI * 2;
					const r0 = 260 + random(`tr${i}`) * 120;
					return <path key={i} d={`M${540 + Math.cos(ang) * r0},${1100 + Math.sin(ang) * r0 * 1.4} l${(random(`tx${i}${f}`) - 0.5) * 80},${(random(`ty${i}${f}`) - 0.5) * 80}`} stroke="#E6CCFF" strokeWidth={5} opacity={0.8} />;
				})}
				{[[481, 884], [599, 884]].map(([x, y], i) => (
					<ellipse key={i} cx={x} cy={y} rx={22} ry={8} fill="#FF2A6A" opacity={0.8} filter="url(#blur3)" transform={`rotate(${i ? -14 : 14},${x},${y})`} />
				))}
			</Svg>
		);
	} else if (f < c) {
		// une ombre cornue immense s'étend sur les ruines
		const p = ip(f, [b, c], [0, 1]);
		shot = (
			<Svg cam={focus(1.05, 540, 1050)}>
				<Ruins f={f} />
				<rect x={-600} y={-800} width={W + 1200} height={3400} fill={lit > 0 ? '#6A5A8A' : '#0A0814'} opacity={lit > 0 ? 0.5 : 0.7} />
				{lit > 0 && <Bolt seed={`u${strike}`} x={800} />}
				<g transform="translate(540,1960) scale(1,0.55)" opacity={0.9}>
					<HornedShape x={0} y={0} s={0.8 + p * 1.2} fill="#000000" />
				</g>
			</Svg>
		);
	} else {
		// dans le noir : la silhouette cornue, deux yeux rouges
		const z = ip(f, [c, end], [1.0, 1.2]);
		shot = (
			<Svg cam={focus(z, 540, 1000)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#06040A" />
				{lit > 0 && <rect width={W} height={H} fill="#B48AFF" opacity={lit * 0.35} />}
				<HornedShape x={540} y={1700} s={1.6} fill={lit > 0 ? '#2A1A3A' : '#0E0A14'} />
				{[[460, 1000], [620, 1000]].map(([x, y], i) => (
					<g key={i} transform={`rotate(${i ? -14 : 14},${x},${y})`}>
						<ellipse cx={x} cy={y} rx={70} ry={22} fill="#FF2A6A" opacity={0.7} filter="url(#blur8)" />
						<ellipse cx={x} cy={y} rx={42} ry={10} fill="#FFC0D0" />
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
					<div style={{fontFamily: 'Bangers', fontSize: 140, lineHeight: 1, letterSpacing: 5, color: '#C9A4FF', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 #3A1060'}}>LES FORMES<br />DE LITCHEEZER</div>
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

/** recap : sans son ni sous-titres (plans repris dans le « Précédemment » de l'ép.6). */
export const Episode5: React.FC<{recap?: boolean}> = ({recap}) => {
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
			{!recap && <Audio src={staticFile('audio/ep5/mix.wav')} />}
		</AbsoluteFill>
	);
};
