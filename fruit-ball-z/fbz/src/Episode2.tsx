import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CoconutShip, PetitPoirsan, Pomgoku, Raditz} from './characters';
import {ArmorCrack, kiwiHand, Kiwikolo} from './characters2';
import {Episode} from './Episode';
import {INK, SharedDefs, SW} from './parts';
import {Crater, Dust, FallingLeaves, Grass, H, Orchard, W} from './scenery';
import {Impact, SpeedLines} from './scenery2';
import timeline from './timeline2.json';
import voices from './voices2.json';

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
const talking = (k: string, f: number) => f >= TL.voices[k].start && f < TL.voices[k].end;

const Svg: React.FC<{children: React.ReactNode; cam?: string}> = ({children, cam}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
		<SharedDefs />
		<defs>
			{/* ciel gris du verger dévasté */}
			<filter id="grey" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
				<feColorMatrix type="saturate" values="0.3" />
			</filter>
		</defs>
		<g transform={cam}>{children}</g>
	</svg>
);

/** Caméra qui centre le point (fx, fy) à l'écran avec un zoom (zoom 1 + centre de l'image = plan large). */
const focus = (zoom: number, fx: number, fy: number, sx = 0, sy = 0, rot = 0) =>
	`translate(${sx},${sy}) translate(540,960) rotate(${rot}) scale(${zoom}) translate(${-fx},${-fy})`;

const shake = (f: number, amp: number) => [
	(random(`sx${f}`) - 0.5) * 2 * amp,
	(random(`sy${f}`) - 0.5) * 2 * amp,
	(random(`sr${f}`) - 0.5) * amp * 0.05,
];

const Flash: React.FC<{f: number; at: number; color?: string; len?: number; peak?: number}> = ({f, at, color = '#FFF6D8', len = 12, peak = 1}) => (
	<AbsoluteFill style={{background: color, opacity: ip(f, [at - 1, at + 1, at + len], [0, peak, 0], Easing.linear)}} />
);

const Vignette: React.FC<{o?: number}> = ({o = 0.6}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 48%, transparent 48%, rgba(8,4,10,${o}) 100%)`}} />
);

/** Verger dévasté, ciel gris (décor de l'ép.1 après le crash, désaturé). `shift` = parallaxe horizontale. */
const Ruins: React.FC<{f: number; shift?: number; dark?: number}> = ({f, shift = 0, dark = 0.5}) => (
	<g filter="url(#grey)">
		<g transform={`translate(${shift},0) translate(540,1260) scale(1.4) translate(-540,-1260)`}>
			<Orchard frame={f} dark={dark} destroyed birds={false} />
			<Crater x={560} y={1300} s={0.6} glow={0.25} />
			<CoconutShip x={560} y={1285} scale={0.38} rot={-8} frame={f} broken={1} />
		</g>
	</g>
);

const Stamp: React.FC<{text: string; f: number; at: number; x: number; y: number; color?: string; size?: number; rot?: number}> = ({text, f, at, x, y, color = '#FFD23F', size = 130, rot = -8}) => {
	const {fps} = useVideoConfig();
	if (f < at || f > at + 36) return null;
	const p = spring({frame: f - at, fps, config: {damping: 8, stiffness: 200}});
	return (
		<div style={{position: 'absolute', left: x - 400, top: y - 100, width: 800, textAlign: 'center', transform: `rotate(${rot}deg) scale(${0.4 + p * 0.6})`}}>
			<span style={{fontFamily: 'Bangers', fontSize: size, letterSpacing: 4, color, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 #B3261E'}}>{text}</span>
		</div>
	);
};

/** Pomgoku qui ceinture Raditz par-derrière (repère : pieds de Raditz en (0,0), Raditz à l'échelle 0.9). */
const Hold: React.FC<{f: number; x: number; y: number; k?: number; pomMouth?: number; pomMood?: any; radMood?: any; radMouth?: number; struggle?: number; crack?: number}> = ({
	f, x, y, k = 1, pomMouth = 0, pomMood = 'determined', radMood = 'angry', radMouth = 0.3, struggle = 0, crack = 0,
}) => (
	<g transform={`translate(${x},${y}) scale(${k})`}>
		<Pomgoku x={-165} y={-120} scale={0.8} frame={f} mood={pomMood} look={[0.6, -0.2]} noArms shadow={false} mouth={pomMouth} lean={8 + struggle * 0.5} wind={1.5} />
		<Raditz x={0} y={0} scale={0.9} frame={f} mood={radMood} look={[-0.4, -0.3]} lean={struggle} armL={70 + struggle * 3} armR={70 - struggle * 3} hair={1} mouth={radMouth} />
		{crack > 0 && <ArmorCrack x={0} y={0} scale={0.9} lean={struggle} p={crack} />}
		<g transform={`rotate(${struggle},0,0)`}>
			{[-314, -268].map((yy, i) => (
				<g key={i}>
					<path d={`M-75,${yy - 10} Q0,${yy + 34} 105,${yy}`} stroke={INK} strokeWidth={26 + SW * 2} strokeLinecap="round" fill="none" />
					<path d={`M-75,${yy - 10} Q0,${yy + 34} 105,${yy}`} stroke="#B82020" strokeWidth={26} strokeLinecap="round" fill="none" />
					<circle cx={108} cy={yy} r={26} fill="#F7F4EE" stroke={INK} strokeWidth={SW * 0.9} />
				</g>
			))}
		</g>
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
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 80, color: '#FFFFFF', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>Épisode 2</div>
				<div style={{fontFamily: 'Luckiest Guy', fontSize: 96, lineHeight: 1.1, marginTop: 20, color: '#FFB347', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>Sacrifice au verger</div>
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ PRÉCÉDEMMENT (plans de l'ép.1 en accéléré) */
const RECAP_SHOTS = [196, 392, 586, 900];
const Recap: React.FC<{f: number}> = ({f}) => {
	const s = SC.recap[0];
	const len = (SC.recap[1] - s) / RECAP_SHOTS.length;
	const i = Math.min(RECAP_SHOTS.length - 1, Math.floor((f - s) / len));
	const local = f - s - i * len;
	const ep1 = Math.round(RECAP_SHOTS[i] + local * 2);
	const scan = (f * 37) % 1920;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'sepia(0.55) saturate(1.3) contrast(1.05)'}}>
				<Freeze frame={ep1}><Episode recap /></Freeze>
			</AbsoluteFill>
			{/* effet cassette */}
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

/* ------------------------------------------------------------------ SCÈNE 1 : l'alliance (11 s) */
const Scene1: React.FC<{f: number}> = ({f}) => {
	const s = SC.s1[0];
	const land = TL.kiwiLand;
	const th = ip(f, [s, SC.s1[1]], [-0.32, 0.32], Easing.linear);
	// caméra qui tourne lentement autour du duo : parallaxe du décor + permutation de profondeur
	const R = 230;
	const pom = {x: 540 - R * Math.cos(th), z: -R * Math.sin(th)};
	const kiw = {x: 540 + R * Math.cos(th), z: R * Math.sin(th)};
	const sc = (z: number) => 1 + z / 1400;
	const drop = ip(f, [land - 16, land], [0, 1], Easing.in(Easing.quad));
	const sq = ip(f, [land, land + 3, land + 12], [0, 1, 0]);
	const [sx, sy] = shake(f, ip(f, [land, land + 3, land + 22], [0, 30, 0]));
	const l1 = TL.voices.l1;
	const l2 = TL.voices.l2;
	// cibles caméra
	let zoom = ip(f, [s, land - 20], [1.05, 1.12]);
	let fx = 540, fy = ip(f, [s, land - 20], [1200, 1250]);
	if (f >= l1.start - 10 && f < l1.end + 10) { zoom = ip(f, [l1.start - 10, l1.start + 10], [1.12, 1.4]); fx = ip(f, [l1.start - 10, l1.start + 10], [540, kiw.x]); fy = 1290; }
	else if (f >= l1.end + 10 && f < l2.end + 6) { zoom = 1.4; fx = ip(f, [l1.end + 10, l1.end + 22], [kiw.x, pom.x]); fy = 1290; }
	else if (f >= l2.end + 6) { zoom = ip(f, [l2.end + 6, SC.s1[1]], [1.4, 1.1]); fx = ip(f, [l2.end + 6, SC.s1[1]], [pom.x, 540]); fy = ip(f, [l2.end + 6, SC.s1[1]], [1290, 1220]); }
	const pomMood = f < land ? 'determined' : f < land + 30 ? 'shock' : f < l1.end ? 'angry' : 'determined';
	const fist = f > s + 30 && f < land;
	const pomEl = (
		<Pomgoku key="p" x={pom.x} y={1600 + pom.z * 0.25} scale={0.9 * sc(pom.z)} frame={f} mood={pomMood as any}
			look={f < land ? [0, -0.6] : f < l2.start ? [1, -0.1] : [0.2, -0.5]} armL={40} armR={fist || talking('l2', f) ? 150 + Math.sin(f * 0.3) * 6 : 50} fistR={fist || talking('l2', f)}
			mouth={talking('l2', f) ? mouthOf('l2', f) : f >= land && f < land + 30 ? 0.5 : 0} lean={f >= land && f < land + 12 ? -8 : 0} wind={0.9} />
	);
	const kiwEl = f >= land - 16 ? (
		<Kiwikolo key="k" x={kiw.x} y={-600 + (1600 + kiw.z * 0.25 + 600) * drop} scale={0.95 * sc(kiw.z)} frame={f} squash={sq} shadow={drop > 0.85}
			mood="angry" look={f < l1.end ? [-1, 0.1] : [-0.2, -0.5]} crossed={f >= land + 12} armL={160} armR={160} cape={f < land ? 1.8 : 0.8} mouth={mouthOf('l1', f)} />
	) : null;
	return (
		<>
			<Svg cam={focus(zoom, fx, fy, sx, sy)}>
				<Ruins f={f} shift={-th * 520} />
				{/* Raditz au loin, qui attend */}
				<g filter="url(#grey)">
					<Raditz x={540 - th * 820} y={1290} scale={0.3} frame={f} mood="sneer" look={[0, 0.3]} armL={20} armR={20} hair={0.6} darken={0.35} />
				</g>
				<FallingLeaves frame={f} n={6} windX={2} dark={0.6} />
				{pom.z < kiw.z ? [pomEl, kiwEl] : [kiwEl, pomEl]}
				{f >= land && <Dust x={kiw.x} y={1600} t={(f - land) / 30} n={18} seed="kl" color="#A89C8C" spread={0.7} opacity={ip(f, [land, land + 60], [1, 0])} />}
				<Grass frame={f} dark={0.6} wind={1.6} />
			</Svg>
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 2 : combat en plans courts (12 s) */
const Ghosts: React.FC<{f: number; x: number; y: number; s: number; dir: number}> = ({f, x, y, s, dir}) => (
	<>
		{[0.45, 0.28, 0.14].map((o, i) => (
			<g key={i} opacity={o}><Raditz x={x - dir * (i + 1) * 46} y={y} scale={s} frame={f} shadow={false} silhouette={0.8} lean={dir * 14} /></g>
		))}
	</>
);

const Scene2: React.FC<{f: number}> = ({f}) => {
	const [a, b, c, d, e] = TL.s2shots;
	const hits: number[] = TL.s2hits;
	const hitNow = hits.find((h) => f >= h && f < h + 5);
	const [sx, sy] = shake(f, hitNow !== undefined ? 16 : 0);
	let body: React.ReactNode;
	let cam = focus(1, 540, 960, sx, sy);
	if (f < b) {
		// A : les deux chargent depuis les côtés
		const p = ip(f, [a, b], [0, 1], Easing.in(Easing.quad));
		cam = focus(ip(f, [a, b], [1.0, 1.15]), 540, 1250, sx, sy);
		body = (
			<>
				<SpeedLines frame={f} angle={0} opacity={0.5} />
				<Raditz x={540} y={1620} scale={0.85} frame={f} mood="sneer" look={[0, 0.2]} armL={20} armR={20} hair={0.6} />
				<Pomgoku x={-200 + 520 * p} y={1600} scale={0.8} frame={f} mood="angry" look={[1, 0]} lean={24} armL={150} armR={150} fistR wind={2} />
				<Kiwikolo x={1280 - 520 * p} y={1600} scale={0.82} frame={f} mood="angry" look={[-1, 0]} lean={-24} armL={150} armR={150} cape={1.8} flip />
			</>
		);
	} else if (f < c) {
		// B : rafale de Pomgoku, Raditz esquive en ondulant
		const sway = Math.sin((f - b) * 0.32) * 26;
		cam = focus(1.35, 520, 1300, sx, sy, 5);
		body = (
			<>
				<SpeedLines frame={f} angle={180} opacity={0.35} />
				<Ghosts f={f} x={640 + sway * 2} y={1620} s={0.85} dir={Math.sign(Math.cos((f - b) * 0.32)) || 1} />
				<Raditz x={640 + sway * 2} y={1620} scale={0.85} frame={f} mood="sneer" look={[-0.8, 0]} lean={sway} armL={30} armR={30} hair={1} />
				<Pomgoku x={400} y={1600} scale={0.8} frame={f} mood="angry" look={[1, 0]} lean={14} armL={60 + Math.sin(f * 1.6) * 50} armR={90 + Math.cos(f * 1.6) * 60} reachLen={150} fistR wind={1.5} mouth={0.35} />
				{hitNow !== undefined && <Impact x={560} y={1340} s={0.8} rot={f * 9} />}
			</>
		);
	} else if (f < d) {
		// C : Kiwikolo frappe, Raditz glisse de côté
		const sway = Math.sin((f - c) * 0.3 + 1) * 28;
		cam = focus(1.35, 560, 1300, sx, sy, -5);
		body = (
			<>
				<SpeedLines frame={f} angle={0} opacity={0.35} />
				<Ghosts f={f} x={450 + sway * 2} y={1620} s={0.85} dir={-1} />
				<Raditz x={450 + sway * 2} y={1620} scale={0.85} frame={f} mood="sneer" look={[0.8, 0]} lean={sway} armL={30} armR={30} hair={1} />
				<Kiwikolo x={700} y={1600} scale={0.82} frame={f} mood="angry" look={[-1, 0]} lean={-14} flip armL={70 + Math.sin(f * 1.4) * 60} armR={90 + Math.cos(f * 1.4) * 60} armLen={160} cape={1.5} />
				{hitNow !== undefined && <Impact x={540} y={1330} s={0.8} rot={-f * 9} color="#D8FFB0" />}
			</>
		);
	} else if (f < e) {
		// D : attaque combinée, Raditz s'évapore vers le haut
		const p = ip(f, [d, hits[4]], [0, 1], Easing.in(Easing.quad));
		const up = ip(f, [hits[4] - 4, hits[6]], [0, 1], Easing.out(Easing.quad));
		cam = focus(ip(f, [d, e], [1.15, 1.05]), 540, 1180, sx, sy);
		body = (
			<>
				<SpeedLines frame={f} angle={-90} opacity={up * 0.5} />
				{up > 0 && up < 1 && <Ghosts f={f} x={540} y={1620 - up * 700} s={0.85} dir={0} />}
				<Raditz x={540} y={1620 - up * 700} scale={0.85} frame={f} mood="sneer" look={[0, 0.6]} armL={up > 0 ? 160 : 30} armR={up > 0 ? 160 : 30} hair={1} shadow={up < 0.1} />
				<Pomgoku x={60 + 260 * p} y={1600} scale={0.8} frame={f} mood={up > 0.3 ? 'shock' : 'angry'} look={[1, -0.5 * up]} lean={20} armL={130} armR={130} fistR />
				<Kiwikolo x={1020 - 260 * p} y={1600} scale={0.82} frame={f} mood={up > 0.3 ? 'shock' : 'angry'} look={[-1, -0.5 * up]} lean={-20} flip armL={130} armR={130} cape={1.6} />
				{hitNow !== undefined && <Impact x={540} y={1380} s={1.2} rot={f * 5} />}
			</>
		);
	} else {
		// E : Raditz ricane, les deux reprennent leur souffle
		const l3 = TL.voices.l3;
		const zoom = f < l3.end ? ip(f, [e, l3.start + 6], [1.0, 1.5]) : 1.4;
		const fx = f < l3.end ? 540 : ip(f, [l3.end, l3.end + 8, l3.end + 24, l3.end + 30], [540, 230, 230, 850]);
		const fy = f < l3.end ? ip(f, [e, l3.start + 6], [1100, 1000]) : 1380;
		const pant = Math.sin(f * 0.35) * 0.04;
		cam = focus(zoom, fx, fy, sx, sy);
		body = (
			<>
				<Raditz x={540} y={1440 + Math.sin(f * 0.08) * 10} scale={0.72} frame={f} mood="sneer" look={[0, 0.5]} armL={25} armR={25} hair={0.8} shadow={false} mouth={mouthOf('l3', f)} aura={0.5} />
				<Pomgoku x={230} y={1720} scale={0.85} frame={f} mood="angry" look={[0.5, -0.8]} squash={pant} armL={30} armR={f > l3.end ? 160 : 40} fistR={f > l3.end} mouth={0.15} />
				<Kiwikolo x={850} y={1720} scale={0.88} frame={f} mood="angry" look={[-0.5, -0.8]} squash={pant} crossed={f > l3.end + 20} armL={40} armR={40} />
			</>
		);
	}
	return (
		<>
			<Svg cam={cam}>
				<Ruins f={f} dark={0.55} />
				{body}
				<Grass frame={f} dark={0.6} wind={2} />
			</Svg>
			<Vignette o={0.5} />
			{hitNow !== undefined && <Flash f={f} at={hitNow} peak={0.6} len={6} />}
			<Flash f={f} at={b} peak={0.5} len={4} /><Flash f={f} at={c} peak={0.5} len={4} /><Flash f={f} at={d} peak={0.5} len={4} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 3 : la morsure (7 s) */
const Scene3: React.FC<{f: number}> = ({f}) => {
	const s = SC.s3[0];
	const {bite, shakeOff} = TL;
	const radX = 660;
	const hop = f >= bite + 8 && f < shakeOff ? Math.abs(Math.sin((f - bite) * 0.45)) * 70 : 0;
	const radY = 1620 - hop;
	// jambe gauche de Raditz (repère du monde)
	const leg: [number, number] = [radX - 46 * 0.9, radY - 44 * 0.9];
	const run = ip(f, [s, bite], [0, 1]);
	const flyOff = ip(f, [shakeOff, shakeOff + 20], [0, 1], Easing.out(Easing.quad));
	let ppX = -100 + (leg[0] - 70 + 100) * run;
	let ppY = 1630 - (f < bite ? Math.abs(Math.sin(f * 0.6)) * 30 : 0);
	let ppLean = f < bite ? 12 : 60 + Math.sin(f * 0.8) * 10;
	if (f >= bite) { ppX = leg[0] - 62; ppY = leg[1] + 44; }
	if (f >= shakeOff) { ppX = leg[0] - 62 - 900 * flyOff; ppY = leg[1] + 44 - Math.sin(Math.PI * flyOff * 0.8) * 500; ppLean = 60 + 720 * flyOff; }
	const grimace = f >= bite && f < shakeOff + 6;
	const l4 = TL.voices.l4;
	// plans : course (large) / morsure (gros plan jambe) / grimace (visage) / envol (large)
	let cam = focus(1.05, 540, 1200);
	if (f >= bite && f < l4.start) cam = focus(2.2, leg[0] - 20, leg[1] - 20);
	else if (f >= l4.start && f < shakeOff) cam = focus(1.7, radX, radY - 430 * 0.9 + 60);
	else if (f >= shakeOff) cam = focus(ip(f, [shakeOff, shakeOff + 12], [1.7, 1.05]), ip(f, [shakeOff, shakeOff + 12], [radX, 540]), ip(f, [shakeOff, shakeOff + 12], [radY - 330, 1200]));
	const [sx, sy] = shake(f, grimace ? 8 : 0);
	return (
		<>
			<Svg cam={`translate(${sx},${sy}) ${cam}`}>
				<Ruins f={f} dark={0.5} />
				<Pomgoku x={180} y={1600} scale={0.75} frame={f} mood={f < bite ? 'shock' : f < shakeOff ? 'happy' : 'shock'} look={[1, -0.2]} armL={40} armR={40} mouth={f >= bite && f < shakeOff ? 0.3 : 0.4} darken={0.1} />
				<Kiwikolo x={950} y={1600} scale={0.78} frame={f} mood={f < bite ? 'shock' : 'angry'} look={[-1, -0.2]} crossed={f >= bite + 30} armL={40} armR={40} darken={0.1} />
				<Raditz x={radX} y={radY} scale={0.9} frame={f} mood={grimace ? 'shock' : f < bite ? 'sneer' : 'angry'} look={grimace ? [0, -1] : f < bite ? [-0.6, 0.5] : [-1, 0.2]}
					armL={grimace ? 170 + Math.sin(f) * 10 : 30} armR={grimace ? 160 + Math.cos(f) * 10 : 30} hair={grimace ? 1 : 0.5}
					mouth={grimace ? Math.max(0.8, mouthOf('l4', f)) : 0} lean={grimace ? Math.sin(f * 0.5) * 8 : 0} />
				{/* larmes qui giclent */}
				{grimace && f >= l4.start && [-1, 1].map((k) => [0, 1, 2].map((j) => {
					const t = ((f * 0.08 + j / 3) % 1);
					return <ellipse key={`${k}${j}`} cx={radX + k * (60 + t * 160)} cy={radY - 488 * 0.9 - 10 + t * t * 260 - t * 90} rx={12} ry={18} fill="#7CC8FF" stroke="#2E7EC0" strokeWidth={3} opacity={1 - t} />;
				}))}
				<PetitPoirsan x={ppX} y={ppY} scale={0.5} frame={f} mood="angry" look={[1, 0]} lean={ppLean} armL={f >= bite ? 160 : 60 + Math.sin(f * 0.8) * 50} armR={f >= bite ? 160 : 60 + Math.cos(f * 0.8) * 50}
					mouth={f >= bite && f < shakeOff ? 0.9 : mouthOf('p1', f)} shadow={f < bite} kick={f >= bite} />
				<Grass frame={f} dark={0.6} wind={1.4} />
			</Svg>
			<Stamp text="CHOMP !" f={f} at={bite} x={540} y={620} />
			{f >= shakeOff + 14 && f < shakeOff + 22 && <Stamp text="✦" f={f} at={shakeOff + 14} x={140} y={500} size={110} color="#FFFFFF" />}
			<Flash f={f} at={bite} peak={0.5} len={5} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 4 : la prise et le rayon (14,5 s) */
const Beam: React.FC<{x0: number; y0: number; x1: number; y1: number; f: number; w?: number}> = ({x0, y0, x1, y1, f, w = 1}) => {
	const L = Math.hypot(x1 - x0, y1 - y0);
	const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
	const helix = (ph: number) => {
		let d = '';
		for (let t = 0; t <= L; t += 12) d += `${t === 0 ? 'M' : 'L'}${t},${Math.sin(t * 0.045 - f * 0.6 + ph) * 34 * w}`;
		return d;
	};
	return (
		<g transform={`translate(${x0},${y0}) rotate(${ang})`}>
			<path d={`M0,0 L${L},0`} stroke="#9BFF5A" strokeWidth={60 * w} strokeLinecap="round" opacity={0.5} filter="url(#blur8)" />
			<path d={`M0,0 L${L},0`} stroke="#F2FFD0" strokeWidth={22 * w} strokeLinecap="round" />
			<path d={helix(0)} stroke="#5BE03A" strokeWidth={9 * w} fill="none" strokeLinecap="round" />
			<path d={helix(Math.PI)} stroke="#C8FF7A" strokeWidth={9 * w} fill="none" strokeLinecap="round" />
			<circle cx={L} cy={0} r={46 * w} fill="#F2FFD0" stroke="#9BFF5A" strokeWidth={10} />
		</g>
	);
};

const Scene4: React.FC<{f: number}> = ({f}) => {
	const s = SC.s4[0];
	const {grabbed, closeup, holdShot, fire, hit} = TL;
	const l6 = TL.voices.l6;
	const struggle = Math.sin(f * 0.8) * 6;
	if (f < closeup) {
		// prise par-derrière (plan large)
		const jp = ip(f, [s, grabbed], [0, 1], Easing.out(Easing.quad));
		const [sx, sy] = shake(f, f >= grabbed ? ip(f, [grabbed, grabbed + 3, grabbed + 16], [0, 18, 4]) : 0);
		return (
			<>
				<Svg cam={focus(ip(f, [s, closeup], [1.05, 1.25]), 600, 1230, sx, sy)}>
					<Ruins f={f} dark={0.6} />
					<Kiwikolo x={940} y={1620} scale={0.75} frame={f} mood="determined" look={[-1, -0.2]} crossed armL={40} armR={40} darken={0.15} />
					{f < grabbed ? (
						<>
							<Raditz x={640} y={1620} scale={0.9} frame={f} mood="angry" look={[1, 0.1]} armL={40} armR={40} hair={0.6} mouth={0.2} />
							<SpeedLines frame={f} angle={-20} opacity={0.4} />
							<Pomgoku x={60 + 520 * jp} y={1600 - Math.sin(Math.PI * jp) * 380 - 180 * jp} scale={0.8} frame={f} mood="determined" look={[1, -0.2]} lean={25} armL={150} armR={150} shadow={false} wind={2} />
						</>
					) : (
						<Hold f={f} x={640} y={1620} struggle={struggle} radMouth={0.35 + Math.abs(Math.sin(f * 0.6)) * 0.3} />
					)}
					<Grass frame={f} dark={0.65} wind={1.5} />
				</Svg>
				<Vignette />
			</>
		);
	}
	if (f < holdShot) {
		// gros plan : deux doigts sur le front, boule verte qui grandit en tourbillonnant
		return <KiwiCharge f={f} />;
	}
	if (f < fire) {
		// réaction de Pomgoku, puis Raditz qui panique
		const pomShot = f < l6.start;
		const [sx, sy] = shake(f, 5);
		return (
			<>
				<Svg cam={focus(pomShot ? 1.9 : 1.55, pomShot ? 560 : 640, pomShot ? 1260 : 1190, sx, sy)}>
					<Ruins f={f} dark={0.65} />
					<Hold f={f} x={640} y={1620} struggle={struggle} pomMood={pomShot ? (f < holdShot + 22 ? 'determined' : 'happy') : 'determined'}
						radMood={pomShot ? 'angry' : 'shock'} radMouth={pomShot ? 0.3 : Math.max(0.15, mouthOf('l6', f))} />
					{/* lueur verte qui arrive de la droite */}
					<ellipse cx={1200} cy={1100} rx={420} ry={600} fill="#9BFF5A" opacity={0.25 + Math.sin(f * 0.7) * 0.06} filter="url(#blur20)" />
					<Grass frame={f} dark={0.65} wind={1.5} />
				</Svg>
				<Vignette />
			</>
		);
	}
	// tir au ralenti, vue de côté
	const bp = ip(f, [fire, hit], [0, 1], Easing.out(Easing.sin));
	const kx = 140, ky = 1620, ks = 0.8;
	const hand = kiwiHand(kx, ky, ks, 'point');
	const target: [number, number] = [860, 1360];
	const head: [number, number] = [hand[0] + (target[0] - hand[0]) * bp, hand[1] + (target[1] - hand[1]) * bp];
	const after = f >= hit;
	const [sx, sy] = shake(f, after ? 30 : 6);
	const white = ip(f, [hit, hit + 4, SC.s4[1]], [0, 1, 1], Easing.linear);
	return (
		<>
			<Svg cam={focus(ip(f, [fire, hit], [1.05, 1.18]), 520, 1300, sx, sy)}>
				<Ruins f={f} dark={0.7} />
				<Kiwikolo x={kx} y={ky} scale={ks} frame={f} mood="determined" look={[1, 0]} point={1} armL={30} cape={1.8} mouth={0.2} />
				<Hold f={f} x={860} y={1620} k={0.95} struggle={struggle * 0.3} radMood="shock" radMouth={0.7} pomMood="determined" />
				<Beam x0={hand[0]} y0={hand[1]} x1={after ? 1300 : head[0]} y1={after ? target[1] : head[1]} f={f} w={1 + (after ? 0.6 : 0)} />
				<Grass frame={f} dark={0.7} wind={2.5} />
			</Svg>
			<Vignette />
			{/* bandes « ralenti » */}
			<AbsoluteFill style={{borderTop: '120px solid #000', borderBottom: '120px solid #000', opacity: after ? 0 : 0.85}} />
			<AbsoluteFill style={{background: '#FFFFFF', opacity: white}} />
		</>
	);
};

const KiwiCharge: React.FC<{f: number}> = ({f}) => {
	const {closeup} = TL;
	const fing = ip(f, [closeup, closeup + 18], [0, 1]);
	const charge = ip(f, [closeup + 12, TL.holdShot], [0, 0.75]);
	const px = 540, py = 1760, ps = 2.0;
	const hand = kiwiHand(px, py, ps, 'fingers');
	const bx = hand[0], by = hand[1] - 40;
	const orbR = 18 + charge * 110 + Math.sin(f * 1.3) * 5 * charge;
	const [sx, sy] = shake(f, charge * 6);
	return (
		<>
			<Svg cam={focus(ip(f, [closeup, TL.holdShot], [1, 1.12]), 560, 1060, sx, sy)}>
				<defs>
					<radialGradient id="drama2" cx="55%" cy="35%" r="75%">
						<stop offset="0" stopColor="#E6FF9A" />
						<stop offset="0.35" stopColor="#4FAE3B" />
						<stop offset="1" stopColor="#0E1A10" />
					</radialGradient>
				</defs>
				<rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#drama2)" />
				<g transform={`translate(${bx},${by}) rotate(${f * 0.8})`} opacity={0.2 + charge * 0.25}>
					{Array.from({length: 36}, (_, i) => <path key={i} transform={`rotate(${i * 10})`} d="M-8,160 L0,1600 L8,160 Z" fill="#F2FFD0" />)}
				</g>
				<Kiwikolo x={px} y={py} scale={ps} frame={f} mood="determined" look={[0, 0.05]} shadow={false} cape={1.5} armL={20} armR={20} fingers={fing} mouth={mouthOf('l5', f)} />
				{charge > 0 && (
					<g>
						<circle cx={bx} cy={by} r={orbR * 2.3} fill="#9BFF5A" opacity={0.45} filter="url(#blur20)" />
						{/* tourbillon */}
						{[0, 1, 2].map((k) => (
							<ellipse key={k} cx={bx} cy={by} rx={orbR * (1.25 + k * 0.3)} ry={orbR * (0.55 + k * 0.12)} fill="none" stroke={k % 2 ? '#C8FF7A' : '#5BE03A'} strokeWidth={7}
								transform={`rotate(${f * (14 + k * 6) + k * 60},${bx},${by})`} opacity={0.9} />
						))}
						<circle cx={bx} cy={by} r={orbR} fill="#F2FFD0" stroke="#9BFF5A" strokeWidth={9} />
						{Array.from({length: 6}, (_, i) => {
							const q = Math.floor(f / 2);
							const a = random(`ar${i}${q}`) * Math.PI * 2;
							const L = orbR * (1.5 + random(`al${i}${q}`));
							const mx = bx + Math.cos(a + 0.35) * L * 0.5, my = by + Math.sin(a + 0.35) * L * 0.5;
							return <path key={i} d={`M${bx},${by} L${mx},${my} L${bx + Math.cos(a) * L},${by + Math.sin(a) * L}`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={charge} />;
						})}
					</g>
				)}
			</Svg>
			<Vignette o={0.55} />
		</>
	);
};

/* ------------------------------------------------------------------ SCÈNE 5 : le sacrifice (12 s) */
const GreyPom: React.FC<{amount: number; id: string; children: React.ReactNode}> = ({amount, id, children}) => (
	<>
		<filter id={id} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
			<feColorMatrix type="saturate" values={String(1 - amount)} />
		</filter>
		<g filter={`url(#${id})`}>{children}</g>
	</>
);

const Scene5: React.FC<{f: number}> = ({f}) => {
	const s = SC.s5[0];
	const {s5close, eyesClose, fade} = TL;
	const fromWhite = ip(f, [s, s + 30], [1, 0]);
	const grey = ip(f, [s, eyesClose[1]], [0, 1], Easing.inOut(Easing.quad));
	const dim = ip(f, [s5close, fade[0]], [0, 0.55]);
	const black = ip(f, [fade[0], fade[1]], [0, 1], Easing.linear);
	if (f < s5close) {
		// plan large : fumée, Raditz à terre, Kiwikolo tête baissée, Petit-Poirsan en larmes
		return (
			<>
				<Svg cam={focus(ip(f, [s, s5close], [1.05, 1.15]), 540, 1300)}>
					<Ruins f={f} dark={0.75} />
					<Dust x={600} y={1500} t={1.6 + (f - s) / 60} n={20} seed="smk" color="#8A8A8A" spread={1.2} opacity={ip(f, [s, s5close], [0.7, 0.2])} />
					<g filter="url(#grey)"><Raditz x={880} y={1650} scale={0.7} frame={f} mood="shock" lean={92} armL={160} armR={10} darken={0.4} shadow={false} /></g>
					<Kiwikolo x={180} y={1600} scale={0.75} frame={f} mood="angry" look={[1, 0.8]} armL={15} armR={15} darken={0.25} cape={0.8} />
					<PetitPoirsan x={380} y={1640} scale={0.55} frame={f} mood="cry" look={[1, 0.6]} armL={40} armR={40} darken={0.15} />
					<GreyPom amount={grey * 0.5} id="gp1">
						<Pomgoku x={600} y={1690} scale={0.7} frame={f} mood="shock" lean={-88} look={[0, -1]} armL={150} armR={60} mouth={0.1} shadow={false} eyesClosed={0.5} darken={0.2} />
					</GreyPom>
					<Grass frame={f} dark={0.7} wind={0.8} />
				</Svg>
				<Vignette o={0.65} />
				<AbsoluteFill style={{background: '#FFFFFF', opacity: fromWhite}} />
			</>
		);
	}
	// vue du dessus : Pomgoku allongé dans l'herbe, ses couleurs se ternissent
	const closed = ip(f, [eyesClose[0], eyesClose[1]], [0, 1], Easing.inOut(Easing.quad));
	const breath = Math.sin(f * 0.12) * 0.03 * (1 - closed);
	const weak = talking('l7', f) ? mouthOf('l7', f) * 0.6 : 0;
	return (
		<>
			<Svg cam={focus(ip(f, [s5close, fade[1]], [1.15, 1.45]), 540, 1080)}>
				<defs>
					<radialGradient id="lawn" cx="50%" cy="50%" r="70%">
						<stop offset="0" stopColor="#6DA94A" />
						<stop offset="1" stopColor="#2E4A22" />
					</radialGradient>
				</defs>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#lawn)" filter="url(#grey)" />
				{/* touffes d'herbe vues de dessus */}
				{Array.from({length: 70}, (_, i) => {
					const x = random(`hx${i}`) * (W + 200) - 100;
					const y = random(`hy${i}`) * (H + 200) - 100;
					const r = random(`hr${i}`) * 360;
					const sw = Math.sin(f * 0.05 + i) * 6;
					return (
						<g key={i} transform={`translate(${x},${y}) rotate(${r + sw})`}>
							{[-20, 0, 20].map((a) => <path key={a} transform={`rotate(${a})`} d="M0,0 Q6,-30 0,-60" stroke={i % 2 ? '#3E6A2A' : '#82B85A'} strokeWidth={7} fill="none" strokeLinecap="round" />)}
						</g>
					);
				})}
				<GreyPom amount={grey} id="gp2">
					<Pomgoku x={540} y={1380} scale={1.35} frame={f} mood="shock" look={[0, -0.2 - closed * 0.3]} armL={120} armR={110} mouth={weak} shadow={false}
						eyesClosed={Math.max(closed, 0.35)} squash={breath} wind={0.15} />
				</GreyPom>
				{/* pétales et feuilles qui passent avec le vent */}
				<FallingLeaves frame={f} n={5} speed={0.4} windX={3} dark={grey * 0.6} />
			</Svg>
			<AbsoluteFill style={{background: `rgba(10,10,20,${dim})`}} />
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

/* ------------------------------------------------------------------ TEASER : Voyage vers Namek */
const Bolt: React.FC<{f: number; seed: string; x: number}> = ({f, seed, x}) => {
	let d = `M${x},0`;
	let cx = x;
	for (let i = 1; i <= 8; i++) { cx += (random(`${seed}${i}`) - 0.5) * 160; d += ` L${cx},${i * 110}`; }
	return <path d={d} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinejoin="round" opacity={0.95} />;
};

const Teaser: React.FC<{f: number}> = ({f}) => {
	const {fps} = useVideoConfig();
	const [a, b, c] = TL.teaserShots;
	const end = SC.teaser[1];
	const strikes = [a + 18, a + 44, b + 12, b + 40, c + 30];
	const strike = strikes.find((k) => f >= k && f < k + 6);
	const lit = strike !== undefined ? 1 - (f - strike) / 6 : 0;
	let shot: React.ReactNode;
	if (f < b) {
		// planète verte, pics rocheux et arbres ronds en silhouette
		shot = (
			<Svg cam={focus(ip(f, [a, b], [1.0, 1.12]), 540, 1000)}>
				<defs>
					<linearGradient id="nsky" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0" stopColor="#0E3A2E" />
						<stop offset="0.7" stopColor="#3E9A6A" />
						<stop offset="1" stopColor="#B6F0C0" />
					</linearGradient>
				</defs>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#nsky)" />
				{[[260, 520, 60], [700, 380, 40], [880, 640, 30]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFF6D0" opacity={0.8} />)}
				{lit > 0 && <><Bolt f={f} seed={`b${strike}`} x={300 + (strike! % 3) * 220} /><rect width={W} height={H} fill="#FFFFFF" opacity={lit * 0.35} /></>}
				{[[120, 1100, 0.9], [420, 1250, 1.3], [760, 1150, 1.1], [980, 1300, 0.8]].map(([x, y, s], i) => (
					<g key={i} transform={`translate(${x},${y}) scale(${s})`} fill="#06140E">
						<path d="M-60,600 L-40,0 Q0,-30 40,0 L60,600 Z" />
						<circle cx={0} cy={-80} r={90} />
						<path d="M0,-10 L0,-170" stroke="#06140E" strokeWidth={14} />
					</g>
				))}
				<rect y={1500} width={W} height={500} fill="#0A2A20" />
				<path d={`M0,1500 Q540,1460 1080,1500`} stroke="#3E9A6A" strokeWidth={6} fill="none" />
			</Svg>
		);
	} else if (f < c) {
		// deux silhouettes inconnues, révélées par les éclairs
		shot = (
			<Svg cam={focus(ip(f, [b, c], [1.0, 1.2]), 540, 1050)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill={lit > 0 ? '#5A4A8A' : '#120E20'} />
				{lit > 0 && <Bolt f={f} seed={`c${strike}`} x={540} />}
				<g fill="#050308">
					{/* grande silhouette ronde et chauve */}
					<ellipse cx={330} cy={1250} rx={230} ry={260} />
					<rect x={240} y={1450} width={180} height={300} />
					{/* petite silhouette à la mèche en pointe */}
					<path d="M640,1720 L640,1240 Q640,1060 760,1040 L700,880 L780,980 L800,840 L840,990 L900,880 L880,1050 Q960,1100 960,1240 L960,1720 Z" />
				</g>
				{[[270, 1190], [380, 1190], [760, 1150], [850, 1150]].map(([x, y], i) => (
					<ellipse key={i} cx={x} cy={y} rx={24} ry={9} fill="#FF2A2A" opacity={0.6 + lit * 0.4} filter="url(#blur3)" />
				))}
				{/* viseur vert sur l'œil */}
				<path d="M730,1135 L800,1135 L800,1165 L730,1165 Z" fill="#5BE03A" opacity={0.7} />
			</Svg>
		);
	} else {
		// le vaisseau noix de coco file vers une planète verte
		const p = ip(f, [c, end], [0, 1]);
		shot = (
			<Svg cam={focus(ip(f, [c, end], [1, 1.1]), 540, 960)}>
				<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#04040C" />
				{Array.from({length: 80}, (_, i) => <circle key={i} cx={random(`zx${i}`) * W} cy={random(`zy${i}`) * H} r={1.5 + random(`zr${i}`) * 3} fill="#FFFFFF" opacity={0.4 + 0.5 * random(`zo${i}`)} />)}
				<circle cx={760} cy={560} r={300 + p * 60} fill="#3E9A6A" stroke="#B6F0C0" strokeWidth={8} />
				<path d="M520,520 Q700,460 1040,560 M560,680 Q760,640 1020,700" stroke="#2A7050" strokeWidth={30} fill="none" opacity={0.7} />
				<circle cx={760} cy={560} r={360 + p * 60} fill="none" stroke="#9BFF5A" strokeWidth={30} opacity={0.15} filter="url(#blur20)" />
				<CoconutShip x={200 + 420 * p} y={1500 - 700 * p} scale={0.55 - 0.3 * p} rot={-30} frame={f} fire={1} fireAngle={-120} />
			</Svg>
		);
	}
	const title = spring({frame: f - (c + 24), fps, config: {damping: 9, stiffness: 150}});
	const out = ip(f, [end - 24, end], [0, 1], Easing.linear);
	return (
		<AbsoluteFill>
			{shot}
			<Vignette o={0.6} />
			<div style={{position: 'absolute', top: 130, width: '100%', textAlign: 'center'}}>
				<span style={{fontFamily: 'Luckiest Guy', fontSize: 66, color: '#FFFFFF', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill'}}>Dans le prochain épisode</span>
			</div>
			{f >= c + 24 && (
				<div style={{position: 'absolute', top: 1100, width: '100%', textAlign: 'center', transform: `scale(${interpolate(title, [0, 1], [2.6, 1])})`}}>
					<div style={{fontFamily: 'Bangers', fontSize: 150, lineHeight: 1, letterSpacing: 5, color: '#9BFF5A', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 #1E5A2A'}}>VOYAGE<br />VERS NAMEK</div>
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

export const Episode2: React.FC = () => {
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
			<Subtitles f={f} />
			<Audio src={staticFile('audio/ep2/mix.wav')} />
		</AbsoluteFill>
	);
};
