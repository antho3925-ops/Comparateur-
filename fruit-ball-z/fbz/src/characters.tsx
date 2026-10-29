import React from 'react';
import {Arm, blinkAt, Eye, INK, Mood, Mouth, Shadow, SW, useUid} from './parts';

type Common = {
	x: number; y: number; scale?: number; flip?: boolean; frame: number;
	mouth?: number; mood?: Mood; look?: [number, number]; lean?: number;
	squash?: number; shadow?: boolean; armL?: number; armR?: number; darken?: number;
};

const place = (x: number, y: number, scale: number, flip?: boolean, lean = 0, squash = 0) =>
	`translate(${x},${y}) rotate(${lean}) scale(${scale * (flip ? -1 : 1) * (1 + squash * 0.12)},${scale * (1 - squash * 0.12)})`;

/** Assombrissement (silhouette / ciel d'orage) appliqué via feColorMatrix. */
const Darken: React.FC<{id: string; amount: number}> = ({id, amount}) => {
	const k = 1 - amount;
	return (
		<filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
			<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.05} 0 ${amount * 0.02}  0 0 0 1 0`} />
		</filter>
	);
};

/* ============================== POMGOKU ============================== */
const POM_BODY = 'M0,-372 C55,-430 192,-410 180,-255 C170,-122 96,-62 0,-82 C-96,-62 -170,-122 -180,-255 C-192,-410 -55,-430 0,-372 Z';
const SPIKES: Array<[number, number, string, number]> = [
	// angle, longueur, couleur, largeur
	[-78, 140, '#7A4A22', 46], [-55, 185, '#3E9B3A', 52], [-30, 215, '#7A4A22', 56], [-8, 245, '#3E9B3A', 60],
	[16, 225, '#7A4A22', 56], [38, 200, '#3E9B3A', 54], [62, 165, '#7A4A22', 48], [82, 120, '#3E9B3A', 40],
];

export const Pomgoku: React.FC<Common & {wind?: number; fistR?: boolean; noArms?: boolean; reachLen?: number}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'happy', look = [0, 0], lean = 0, squash = 0,
	shadow = true, armL = 25, armR = 25, wind = 0.2, darken = 0, fistR, noArms, reachLen = 120,
}) => {
	const gid = useUid('pomg');
	const did = useUid('pomd');
	const blink = mood === 'shock' ? 0 : blinkAt(frame, 3);
	const anger = mood === 'angry' ? 0.55 : mood === 'determined' ? 0.75 : 0;
	const browY = mood === 'shock' ? -342 : mood === 'happy' ? -330 : -312;
	const browTilt = mood === 'angry' || mood === 'determined' ? 26 : mood === 'shock' ? -8 : -6;
	const skin = '#C92626';
	return (
		<g transform={place(x, y, scale, flip, lean, squash)} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="38%" cy="32%" r="75%">
					<stop offset="0" stopColor="#FF6B5C" />
					<stop offset="0.45" stopColor="#D22B2B" />
					<stop offset="1" stopColor="#7E1010" />
				</radialGradient>
				<Darken id={did} amount={darken} />
			</defs>
			{shadow && <Shadow w={150} />}
			{/* jambes */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M${s * 55},-95 L${s * 62},-22`} stroke={INK} strokeWidth={26 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 55},-95 L${s * 62},-22`} stroke="#A01B1B" strokeWidth={26} strokeLinecap="round" />
					<ellipse cx={s * 72} cy={-14} rx={42} ry={22} fill="#3B2314" stroke={INK} strokeWidth={SW} />
					<ellipse cx={s * 62} cy={-22} rx={16} ry={7} fill="#6B4A33" />
				</g>
			))}
			{/* tiges en pétard (derrière le corps) */}
			{SPIKES.map(([a, L, c, w], i) => {
				const sway = Math.sin(frame * 0.22 + i * 1.3) * 7 * wind + Math.sin(frame * 0.07 + i) * 2;
				const bx = Math.sin((a * Math.PI) / 180) * 70;
				const by = -360 + Math.abs(a) * 0.55;
				const tipx = w * 0.18;
				const d = `M${-w / 2},0 C${-w / 2},${-L * 0.45} ${-w * 0.12},${-L * 0.82} ${tipx},${-L} C${w * 0.22},${-L * 0.72} ${w / 2},${-L * 0.4} ${w / 2},0 Z`;
				return (
					<g key={i} transform={`translate(${bx},${by}) rotate(${a + sway})`}>
						<path d={d} fill={c} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
						<path d={`M${-w * 0.18},-10 C${-w * 0.18},${-L * 0.4} ${-w * 0.02},${-L * 0.7} ${tipx * 0.6},${-L * 0.9}`} stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={7} fill="none" strokeLinecap="round" />
					</g>
				);
			})}
			{/* bras gauche (derrière) */}
			{!noArms && <Arm sx={-150} sy={-205} angle={armL} len={120} side={-1} color="#B82020" glove="#F7F4EE" handR={30} />}
			{/* corps pomme */}
			<g filter="url(#soft)">
				<path d={POM_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
			</g>
			<ellipse cx={-90} cy={-300} rx={34} ry={52} fill="#FFFFFF" opacity={0.42} transform="rotate(28,-90,-300)" />
			<ellipse cx={-62} cy={-345} rx={10} ry={14} fill="#FFFFFF" opacity={0.6} />
			{/* creux de la pomme */}
			<path d="M-34,-378 Q0,-358 34,-378" stroke="#5A0C0C" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
			{/* joues */}
			<ellipse cx={-122} cy={-175} rx={30} ry={17} fill="#FF8FA0" opacity={0.45} />
			<ellipse cx={122} cy={-175} rx={30} ry={17} fill="#FF8FA0" opacity={0.45} />
			{/* yeux */}
			<Eye x={-62} y={-250} rx={46} ry={60} side={-1} look={look} blink={blink} anger={anger} skin={skin} pupil={mood === 'shock' ? 0.6 : mood === 'determined' ? 0.85 : 1} />
			<Eye x={62} y={-250} rx={46} ry={60} side={1} look={look} blink={blink} anger={anger} skin={skin} pupil={mood === 'shock' ? 0.6 : mood === 'determined' ? 0.85 : 1} />
			{/* sourcils */}
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * 22},${browY + (browTilt > 0 ? 8 : 0)} L${s * 100},${browY - browTilt + (browTilt > 0 ? 8 : 0)}`} stroke="#2A1408" strokeWidth={17} strokeLinecap="round" />
			))}
			<Mouth x={0} y={-160} w={150} open={mouth} mood={mood} />
			{/* bras droit (devant) */}
			{!noArms && <Arm sx={150} sy={-205} angle={armR} len={reachLen} side={1} color="#B82020" glove="#F7F4EE" handR={30} fist={fistR} />}
		</g>
	);
};

/* ============================== PETIT-POIRSAN ============================== */
export const PetitPoirsan: React.FC<Common & {kick?: boolean}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'happy', look = [0, 0], lean = 0, squash = 0,
	shadow = true, armL = 30, armR = 30, darken = 0, kick,
}) => {
	const gid = useUid('ppg');
	const did = useUid('ppd');
	const blink = mood === 'happy' ? blinkAt(frame, 11) : 0;
	const skin = '#B6D23E';
	const legSw = kick ? Math.sin(frame * 0.9) * 18 : 0;
	const crying = mood === 'cry';
	return (
		<g transform={place(x, y, scale, flip, lean, squash)} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="38%" cy="30%" r="75%">
					<stop offset="0" stopColor="#F3F79A" />
					<stop offset="0.5" stopColor="#BFD94A" />
					<stop offset="1" stopColor="#6E9420" />
				</radialGradient>
				<Darken id={did} amount={darken} />
			</defs>
			{shadow && <Shadow w={90} />}
			{[-1, 1].map((s) => (
				<g key={s} transform={`rotate(${s * legSw},${s * 32},-50)`}>
					<path d={`M${s * 32},-50 L${s * 36},-16`} stroke={INK} strokeWidth={18 + SW * 1.6} strokeLinecap="round" />
					<path d={`M${s * 32},-50 L${s * 36},-16`} stroke="#7FA028" strokeWidth={18} strokeLinecap="round" />
					<ellipse cx={s * 42} cy={-10} rx={26} ry={14} fill="#5C3A22" stroke={INK} strokeWidth={SW * 0.8} />
				</g>
			))}
			{/* tige + feuille unique */}
			<path d="M0,-212 Q4,-235 14,-250" stroke={INK} strokeWidth={14 + SW} strokeLinecap="round" fill="none" />
			<path d="M0,-212 Q4,-235 14,-250" stroke="#6B4423" strokeWidth={14} strokeLinecap="round" fill="none" />
			<g transform={`translate(12,-240) rotate(${-30 + Math.sin(frame * 0.18) * 10})`}>
				<path d="M0,0 C20,-30 70,-30 88,0 C70,26 20,26 0,0 Z" fill="#4DB33D" stroke={INK} strokeWidth={SW * 0.8} />
				<path d="M6,0 L78,0" stroke="#2E7D25" strokeWidth={4} />
			</g>
			<Arm sx={-92} sy={-110} angle={armL} len={62} side={-1} color="#9BBF30" glove="#F7F4EE" handR={20} width={16} />
			<g filter="url(#soft)">
				<path d="M0,-205 C40,-232 112,-212 112,-130 C112,-60 60,-38 0,-44 C-60,-38 -112,-60 -112,-130 C-112,-212 -40,-232 0,-205 Z" fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.1} />
			</g>
			<ellipse cx={-55} cy={-160} rx={20} ry={30} fill="#FFFFFF" opacity={0.5} transform="rotate(28,-55,-160)" />
			<ellipse cx={-72} cy={-92} rx={20} ry={12} fill="#FF8FA0" opacity={0.55} />
			<ellipse cx={72} cy={-92} rx={20} ry={12} fill="#FF8FA0" opacity={0.55} />
			<Eye x={-36} y={-132} rx={30} ry={38} side={-1} look={look} blink={blink} skin={skin} sad={crying || mood === 'fear' ? 0.25 : 0} pupil={mood === 'shock' ? 0.7 : 1.1} />
			<Eye x={36} y={-132} rx={30} ry={38} side={1} look={look} blink={blink} skin={skin} sad={crying || mood === 'fear' ? 0.25 : 0} pupil={mood === 'shock' ? 0.7 : 1.1} />
			{(crying || mood === 'fear') && [-1, 1].map((s) => (
				<path key={s} d={`M${s * 18},-182 L${s * 52},${-190 + 10}`} stroke="#3A2A08" strokeWidth={8} strokeLinecap="round" />
			))}
			{crying && [-1, 1].map((s) =>
				[0, 1, 2].map((k) => {
					const p = ((frame * 0.06 + k / 3 + (s > 0 ? 0.15 : 0)) % 1);
					return <path key={`${s}${k}`} d={`M${s * (40 + p * 30)},${-100 + p * 80} q-7,12 0,18 q7,-6 0,-18`} fill="#7CC8FF" stroke="#2E7EC0" strokeWidth={3} opacity={1 - p} transform={`scale(${1 + p * 0.5}) translate(${s * -4 * p},0)`} />;
				}),
			)}
			<Mouth x={0} y={-80} w={62} open={crying ? 0.45 + Math.sin(frame * 0.5) * 0.15 : mouth} mood={mood} scale={0.55} />
			<Arm sx={92} sy={-110} angle={armR} len={62} side={1} color="#9BBF30" glove="#F7F4EE" handR={20} width={16} />
		</g>
	);
};

/* ============================== RADITZ (banane plantain) ============================== */
const RAD_BODY = 'M-62,-600 C-20,-642 52,-640 72,-588 C112,-478 132,-300 116,-160 C106,-62 62,-26 4,-26 C-58,-26 -102,-62 -106,-152 C-116,-300 -102,-478 -62,-600 Z';

export const Raditz: React.FC<Common & {silhouette?: number; aura?: number; holding?: React.ReactNode; hair?: number; holdLeft?: boolean}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'sneer', look = [0, 0], lean = 0, shadow = true,
	armL = 18, armR = 18, silhouette = 0, aura = 0, holding, darken = 0, hair = 0, holdLeft,
}) => {
	const gid = useUid('rdg');
	const aid = useUid('rda');
	const did = useUid('rdd');
	const blink = silhouette > 0.5 ? 0 : blinkAt(frame, 23);
	const skin = '#4A2E18';
	const dk = Math.max(silhouette, darken);
	// longue mèche sombre qui flotte derrière
	const wv = (k: number) => Math.sin(frame * 0.12 + k) * (14 + hair * 30);
	const mech = `M-30,-600 C${-130 + wv(0)},-560 ${-150 + wv(1)},-420 ${-170 + wv(2)},-300 C${-185 + wv(3)},-200 ${-150 + wv(4)},-120 ${-200 + wv(5)},-40 C${-120 + wv(5) * 0.5},-90 ${-110 + wv(3) * 0.4},-200 ${-95 + wv(2) * 0.3},-300 C-80,-420 -40,-540 10,-610 Z`;
	const armColor = '#3A2312';
	return (
		<g transform={place(x, y, scale, flip, lean)}>
			<defs>
				<linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor="#24150A" />
					<stop offset="0.35" stopColor="#5E3B1F" />
					<stop offset="0.6" stopColor="#4C2F18" />
					<stop offset="1" stopColor="#1E1208" />
				</linearGradient>
				<linearGradient id={aid} x1="0" x2="1" y1="0" y2="1">
					<stop offset="0" stopColor="#E3E8EE" />
					<stop offset="0.45" stopColor="#9AA3AD" />
					<stop offset="1" stopColor="#4B525B" />
				</linearGradient>
				<Darken id={did} amount={dk} />
			</defs>
			{shadow && <Shadow w={140} o={0.38} />}
			{aura > 0 && (
				<g opacity={aura}>
					<ellipse cx={0} cy={-320} rx={230 + Math.sin(frame * 0.8) * 10} ry={400 + Math.sin(frame * 0.6) * 14} fill="#8A3DFF" opacity={0.35} filter="url(#blur20)" />
					<ellipse cx={0} cy={-320} rx={180} ry={350} fill="#C9A4FF" opacity={0.25} filter="url(#blur20)" />
				</g>
			)}
			<g filter={dk > 0 ? `url(#${did})` : undefined}>
				<path d={mech} fill="#140C07" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
				{/* jambes + bottes */}
				{[-1, 1].map((s) => (
					<g key={s}>
						<path d={`M${s * 42},-60 L${s * 50},-24`} stroke={INK} strokeWidth={30 + SW * 2} strokeLinecap="round" />
						<path d={`M${s * 42},-60 L${s * 50},-24`} stroke={armColor} strokeWidth={30} strokeLinecap="round" />
						<path d={`M${s * 26},-58 L${s * 74},-58 L${s * 82},-4 Q${s * 50},8 ${s * 18},-4 Z`} fill="#E9E4D8" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
						<path d={`M${s * 26},-46 L${s * 76},-46`} stroke="#B9A86A" strokeWidth={8} />
					</g>
				))}
				<Arm sx={-112} sy={-340} angle={armL} len={150} side={-1} color={armColor} glove="#E9E4D8" handR={30} width={26} fist={!holdLeft} />
				{/* corps banane plantain */}
				<g filter="url(#soft)">
					<path d={RAD_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
				</g>
				<path d="M-40,-590 C-75,-450 -82,-280 -70,-110" stroke="#7A5232" strokeWidth={6} fill="none" opacity={0.6} />
				<path d="M40,-600 C78,-460 92,-300 82,-120" stroke="#120A04" strokeWidth={6} fill="none" opacity={0.5} />
				{[[-48, -540, 10], [56, -505, 13], [-70, -230, 12], [80, -250, 9], [30, -90, 14]].map(([a, b, r], i) => (
					<ellipse key={i} cx={a} cy={b} rx={r} ry={r * 1.4} fill="#160C05" opacity={0.75} />
				))}
				{/* bout de la plantain */}
				<path d="M-16,-628 L-10,-670 Q6,-680 20,-668 L22,-626 Z" fill="#1A110A" stroke={INK} strokeWidth={SW * 0.8} />
				{/* armure */}
				<path d="M-104,-392 Q0,-418 110,-392 L118,-232 Q4,-190 -112,-232 Z" fill={`url(#${aid})`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
				<path d="M-86,-375 Q0,-396 92,-375" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={6} fill="none" />
				<path d="M-104,-292 Q2,-268 112,-292" stroke="#3F454C" strokeWidth={5} fill="none" />
				<path d="M-108,-262 Q2,-232 114,-262" stroke="#3F454C" strokeWidth={5} fill="none" />
				<path d="M0,-404 L4,-205" stroke="#3F454C" strokeWidth={4} />
				<path d="M-60,-350 l26,22 M40,-330 l18,-18" stroke="#3F454C" strokeWidth={3} />
				{/* épaulettes */}
				{[-1, 1].map((s) => (
					<g key={s} transform={`translate(${s * 120},-372) rotate(${s * 18})`}>
						<path d="M-62,10 Q-60,-40 0,-40 Q60,-40 62,10 Q0,24 -62,10 Z" fill={`url(#${aid})`} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
						<path d="M-40,-14 Q0,-30 40,-14" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={5} fill="none" />
					</g>
				))}
				<rect x={-112} y={-214} width={228} height={30} rx={8} fill="#2A2A2E" stroke={INK} strokeWidth={SW * 0.8} transform="rotate(-1)" />
				<rect x={-16} y={-216} width={34} height={34} rx={6} fill="#B9A86A" stroke={INK} strokeWidth={4} />
				{/* visage */}
				<Eye x={-36} y={-488} rx={30} ry={20} side={-1} look={look} blink={blink} anger={mood === 'sneer' || mood === 'angry' ? 0.5 : 0.2} skin={skin} iris="#7A0D12" pupil={0.95} />
				<Eye x={40} y={-488} rx={30} ry={20} side={1} look={look} blink={blink} anger={mood === 'sneer' || mood === 'angry' ? 0.5 : 0.2} skin={skin} iris="#7A0D12" pupil={0.95} />
				{/* sourcils froncés épais */}
				<path d="M-78,-534 L-8,-510 L-10,-498 L-80,-516 Z" fill="#0E0805" stroke={INK} strokeWidth={4} />
				<path d="M84,-534 L14,-510 L16,-498 L86,-516 Z" fill="#0E0805" stroke={INK} strokeWidth={4} />
				{/* cicatrices */}
				<path d="M-62,-548 L-18,-452 M-56,-512 L-30,-520" stroke="#C99A7A" strokeWidth={5} strokeLinecap="round" />
				<path d="M58,-445 L88,-420 M64,-420 L80,-440" stroke="#C99A7A" strokeWidth={4} strokeLinecap="round" />
				<Mouth x={2} y={-430} w={84} open={mouth} mood={mood} scale={0.75} />
				<Arm sx={112} sy={-340} angle={armR} len={150} side={1} color={armColor} glove="#E9E4D8" handR={30} width={26} fist={!(holding && !holdLeft)} />
			</g>
			{/* yeux rouges qui brillent en silhouette */}
			{silhouette > 0.05 && (
				<g opacity={silhouette}>
					<ellipse cx={-36} cy={-488} rx={22} ry={8} fill="#FF2A2A" filter="url(#blur3)" />
					<ellipse cx={40} cy={-488} rx={22} ry={8} fill="#FF2A2A" filter="url(#blur3)" />
					<ellipse cx={-36} cy={-488} rx={12} ry={4} fill="#FFD0D0" />
					<ellipse cx={40} cy={-488} rx={12} ry={4} fill="#FFD0D0" />
				</g>
			)}
			{holding}
		</g>
	);
};

/** Main de Raditz pour une pose de bras donnée (repère local). */
export const raditzHand = (angle: number, side: 1 | -1 = 1): [number, number] => {
	const a = (angle * Math.PI) / 180;
	return [side * 112 + side * Math.sin(a) * 150, -340 + Math.cos(a) * 150];
};

/* ============================== VAISSEAU NOIX DE COCO ============================== */
export const CoconutShip: React.FC<{x: number; y: number; scale: number; rot: number; frame: number; fire?: number; broken?: number; fireAngle?: number}> = ({x, y, scale, rot, frame, fire = 0, broken = 0, fireAngle = 0}) => {
	const gid = useUid('coco');
	const fibers = React.useMemo(() => Array.from({length: 46}, (_, i) => {
		const a = (i * 137.5 * Math.PI) / 180;
		const r = 40 + ((i * 53) % 80);
		return [Math.cos(a) * r, Math.sin(a) * r, a + 0.6] as const;
	}), []);
	const shell = (
		<>
			<circle r={130} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.3} />
			{fibers.map(([fx, fy, a], i) => (
				<path key={i} d={`M${fx},${fy} l${Math.cos(a) * 22},${Math.sin(a) * 22}`} stroke="#3A2210" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
			))}
			<path d="M-128,10 Q0,48 128,10 L126,34 Q0,72 -126,34 Z" fill="#9AA3AD" stroke={INK} strokeWidth={6} />
			{[-80, -26, 28, 82].map((bx) => <circle key={bx} cx={bx} cy={34 + Math.abs(bx) * -0.12} r={6} fill="#FFE27A" stroke={INK} strokeWidth={3} />)}
			<circle cx={-36} cy={-60} r={15} fill="#24140A" />
			<circle cx={4} cy={-82} r={15} fill="#24140A" />
			<circle cx={40} cy={-58} r={15} fill="#24140A" />
			<circle cx={-52} cy={-22} r={30} fill="#9FE3FF" stroke={INK} strokeWidth={6} />
			<circle cx={-60} cy={-30} r={9} fill="#FFFFFF" />
			<path d="M0,-130 L6,-178" stroke={INK} strokeWidth={6} />
			<circle cx={6} cy={-182} r={10} fill={frame % 10 < 5 ? '#FF3B3B' : '#FFB0B0'} stroke={INK} strokeWidth={4} />
		</>
	);
	return (
		<g transform={`translate(${x},${y}) scale(${scale})`}>
			<defs>
				<radialGradient id={gid} cx="35%" cy="30%" r="80%">
					<stop offset="0" stopColor="#9A6A3E" />
					<stop offset="0.6" stopColor="#6B4423" />
					<stop offset="1" stopColor="#3A2210" />
				</radialGradient>
			</defs>
			{fire > 0 && (
				<g opacity={fire} transform={`rotate(${fireAngle})`}>
					<path d={`M-120,0 Q-110,-${380 + (frame % 4) * 30} 0,-${640 + (frame % 3) * 40} Q110,-380 120,0 Z`} fill="#FF7A1A" opacity={0.85} filter="url(#blur8)" />
					<path d={`M-80,0 Q-70,-260 0,-${420 + (frame % 2) * 30} Q70,-260 80,0 Z`} fill="#FFE27A" opacity={0.9} filter="url(#blur8)" />
				</g>
			)}
			{broken > 0 ? (
				<>
					<g transform={`translate(${-60 * broken},${10 * broken}) rotate(${-25 * broken})`}>
						<clipPath id={`${gid}L`}><path d="M-200,-200 L10,-200 L-20,-60 L20,20 L-10,200 L-200,200 Z" /></clipPath>
						<g clipPath={`url(#${gid}L)`}>{shell}</g>
					</g>
					<g transform={`translate(${60 * broken},${10 * broken}) rotate(${25 * broken})`}>
						<clipPath id={`${gid}R`}><path d="M200,-200 L10,-200 L-20,-60 L20,20 L-10,200 L200,200 Z" /></clipPath>
						<g clipPath={`url(#${gid}R)`}>{shell}</g>
					</g>
					<ellipse cx={0} cy={30} rx={70 * broken} ry={40} fill="#FFF3C4" opacity={0.6 * broken} filter="url(#blur8)" />
				</>
			) : <g transform={`rotate(${rot})`}>{shell}</g>}
		</g>
	);
};
