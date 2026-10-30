import React from 'react';
import {random} from 'remotion';
import {Arm, blinkAt, Eye, INK, Mood, Mouth, Shadow, SW, useUid} from './parts';

/* ============================== VÉGÉNADE (grenade, façon Vegeta) ============================== */
const VEG_BODY = 'M0,-412 C122,-414 186,-330 183,-234 C179,-128 110,-74 0,-74 C-110,-74 -179,-128 -183,-234 C-186,-330 -122,-414 0,-412 Z';
// couronne de la grenade dressée en flammes, comme la coiffure de Vegeta : angle, longueur, largeur
const CROWN: Array<[number, number, number]> = [[-44, 120, 54], [-24, 170, 62], [-6, 205, 66], [12, 185, 62], [32, 150, 56], [50, 110, 46]];
// fissures de la carapace (repère local)
const CRACKS = [
	'M-150,-330 L-112,-300 L-124,-262 L-88,-238 L-96,-200',
	'M-112,-300 L-70,-318',
	'M140,-340 L108,-306 L126,-270 L96,-244',
	'M108,-306 L70,-322 L52,-300',
	'M-164,-180 L-126,-160 L-136,-124 L-104,-104',
	'M160,-176 L124,-166 L132,-128 L100,-110',
	'M-40,-96 L-20,-118 L6,-104 L24,-124 L46,-98',
];
// pépins visibles dans les fissures : point sur la fissure (x, y)
const ARILS: Array<[number, number]> = [[-116, -298], [-104, -244], [116, -286], [80, -312], [-130, -150], [128, -146], [-6, -108], [-90, -216], [112, -256]];

export const Vegenade: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; squash?: number; shadow?: boolean; armL?: number; armR?: number;
	darken?: number; crossed?: boolean; rage?: number; wristUp?: number;
}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'sneer', look = [0, 0], lean = 0, squash = 0,
	shadow = true, armL = 20, armR = 20, darken = 0, crossed = true, rage = 0, wristUp = 0,
}) => {
	const gid = useUid('vegg');
	const did = useUid('vegd');
	const blink = mood === 'shock' ? 0 : blinkAt(frame, 29);
	const skin = '#7B1E3A';
	const anger = mood === 'angry' ? 0.75 : mood === 'sneer' ? 0.6 : mood === 'determined' ? 0.8 : 0.2;
	const k = 1 - darken;
	const sx = scale * (flip ? -1 : 1) * (1 + squash * 0.12);
	const sy = scale * (1 - squash * 0.12);
	const pulse = rage > 0 ? rage * (0.75 + 0.25 * Math.sin(frame * 0.5)) : 0;
	// bras droit levé (poignet qui projette l'hologramme)
	const armRA = armR * (1 - wristUp) + 120 * wristUp;
	return (
		<g transform={`translate(${x},${y}) rotate(${lean}) scale(${sx},${sy})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="36%" cy="30%" r="80%">
					<stop offset="0" stopColor="#B8435F" />
					<stop offset="0.5" stopColor="#7B1E3A" />
					<stop offset="1" stopColor="#3A0816" />
				</radialGradient>
				<filter id={did} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.05} 0 ${darken * 0.02}  0 0 0 1 0`} />
				</filter>
			</defs>
			{shadow && <Shadow w={160} />}
			{/* jambes : combinaison bleue, bottes blanches à bout doré */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M${s * 58},-96 L${s * 66},-26`} stroke={INK} strokeWidth={30 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 58},-96 L${s * 66},-26`} stroke="#23408E" strokeWidth={30} strokeLinecap="round" />
					<path d={`M${s * 40},-56 L${s * 92},-56 L${s * 98},-4 Q${s * 66},8 ${s * 32},-4 Z`} fill="#F4F1EA" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
					<path d={`M${s * 40},-44 L${s * 94},-44`} stroke="#D9A93A" strokeWidth={8} />
				</g>
			))}
			{/* couronne en flammes (derrière le corps) */}
			{CROWN.map(([a, L, w], i) => {
				const sway = Math.sin(frame * 0.15 + i) * 2.5 + rage * Math.sin(frame * 0.9 + i) * 3;
				const bx = Math.sin((a * Math.PI) / 180) * 60;
				const by = -392 + Math.abs(a) * 0.4;
				const d = `M${-w / 2},0 C${-w / 2},${-L * 0.4} ${-w * 0.2},${-L * 0.8} ${w * 0.1},${-L} C${w * 0.25},${-L * 0.7} ${w / 2},${-L * 0.4} ${w / 2},0 Z`;
				return (
					<g key={i} transform={`translate(${bx},${by}) rotate(${a + sway})`}>
						<path d={d} fill={i % 2 ? '#5A1028' : '#7B1E3A'} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
						<path d={`M${-w * 0.16},-10 C${-w * 0.16},${-L * 0.4} ${-w * 0.02},${-L * 0.7} ${w * 0.05},${-L * 0.88}`} stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={7} fill="none" strokeLinecap="round" />
					</g>
				);
			})}
			{/* bras gauche (derrière) */}
			{!crossed && <Arm sx={-160} sy={-215} angle={armL} len={120} side={-1} color="#23408E" glove="#F4F1EA" handR={30} width={26} fist />}
			{/* corps grenade */}
			<g filter="url(#soft)">
				<path d={VEG_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
			</g>
			<ellipse cx={-96} cy={-318} rx={30} ry={46} fill="#FFFFFF" opacity={0.28} transform="rotate(30,-96,-318)" />
			{/* fissures : lueur rouge des pépins quand il s'énerve, puis trait doré */}
			{pulse > 0 && (
				<g opacity={pulse}>
					{CRACKS.map((d, i) => <path key={i} d={d} stroke="#FF2A4A" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#blur8)" />)}
					{ARILS.map(([ax, ay], i) => <ellipse key={i} cx={ax} cy={ay} rx={20} ry={24} fill="#FF4A6A" filter="url(#blur8)" />)}
				</g>
			)}
			{CRACKS.map((d, i) => <path key={i} d={d} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
			{CRACKS.map((d, i) => <path key={i} d={d} stroke={pulse > 0.3 ? '#FFD86A' : '#D9A93A'} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
			{ARILS.map(([ax, ay], i) => (
				<g key={i} opacity={0.35 + pulse * 0.65}>
					<ellipse cx={ax} cy={ay} rx={9} ry={11} fill={pulse > 0.2 ? '#FF3355' : '#9E1530'} stroke={INK} strokeWidth={3} />
					<circle cx={ax - 3} cy={ay - 4} r={3} fill="#FFD0D8" opacity={0.8} />
				</g>
			))}
			{/* plastron d'armure blanc (épaulettes jaunes) */}
			{[-1, 1].map((s) => (
				<g key={s} transform={`translate(${s * 148},-318) rotate(${s * 22})`}>
					<path d="M-58,14 Q-56,-40 0,-40 Q56,-40 58,14 Q0,26 -58,14 Z" fill="#E8C24A" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
					<path d="M-36,-14 Q0,-28 36,-14" stroke="#FFF3B0" strokeWidth={6} fill="none" />
				</g>
			))}
			{/* regard fier et sévère */}
			<Eye x={-58} y={-276} rx={38} ry={34} side={-1} look={look} blink={blink} anger={anger} skin={skin} iris="#1A0A10" pupil={mood === 'shock' ? 0.6 : 0.85} glow={pulse > 0.6 ? 'rgba(255,60,90,0.35)' : undefined} />
			<Eye x={58} y={-276} rx={38} ry={34} side={1} look={look} blink={blink} anger={anger} skin={skin} iris="#1A0A10" pupil={mood === 'shock' ? 0.6 : 0.85} glow={pulse > 0.6 ? 'rgba(255,60,90,0.35)' : undefined} />
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * 14},-300 L${s * 104},-342`} stroke="#2A0610" strokeWidth={18} strokeLinecap="round" />
			))}
			<Mouth x={4} y={-206} w={110} open={mouth} mood={mood} scale={0.8} />
			{/* bras croisés */}
			{crossed && (
				<g>
					<path d="M-162,-196 Q-96,-112 44,-128" stroke={INK} strokeWidth={28 + SW * 2} strokeLinecap="round" fill="none" />
					<path d="M-162,-196 Q-96,-112 44,-128" stroke="#23408E" strokeWidth={28} strokeLinecap="round" fill="none" />
					<path d="M162,-196 Q96,-140 -44,-150" stroke={INK} strokeWidth={28 + SW * 2} strokeLinecap="round" fill="none" />
					<path d="M162,-196 Q96,-140 -44,-150" stroke="#23408E" strokeWidth={28} strokeLinecap="round" fill="none" />
					{[[50, -128], [-50, -150]].map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r={28} fill="#F4F1EA" stroke={INK} strokeWidth={SW * 0.9} />)}
				</g>
			)}
			{!crossed && <Arm sx={160} sy={-215} angle={armRA} len={120} side={1} color="#23408E" glove="#F4F1EA" handR={30} width={26} fist={wristUp < 0.5} />}
		</g>
	);
};

/** Main droite de Végénade levée (repère du monde), pour placer l'hologramme. */
export const vegWrist = (x: number, y: number, scale: number): [number, number] => {
	const a = (120 * Math.PI) / 180;
	return [x + (160 + Math.sin(a) * 120) * scale, y + (-215 + Math.cos(a) * 120) * scale];
};

/* ============================== NAMEKIEN (petit kiwi vert clair) ============================== */
const NAM_FUZZ = Array.from({length: 40}, (_, i) => {
	const a = (i / 40) * Math.PI * 2;
	return [Math.cos(a) * 130, -230 + Math.sin(a) * 150, a] as const;
});

export const Namekian: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; shadow?: boolean; seed?: number; elder?: boolean; darken?: number; armL?: number; armR?: number;
}> = ({x, y, scale = 1, flip, frame, mouth = 0, mood = 'angry', look = [0, 0], lean = 0, shadow = true, seed = 1, elder, darken = 0, armL = 15, armR = 15}) => {
	const gid = useUid('namg');
	const did = useUid('namd');
	const blink = blinkAt(frame, 40 + seed);
	const skin = '#BFE88A';
	// méfiance : paupières mi-closes, plus pour l'ancien
	const anger = mood === 'shock' ? 0 : elder ? 0.45 : 0.35;
	const k = 1 - darken;
	const hue = ['#A6DA6A', '#9CD266', '#B2E07A', '#94CC5E'][seed % 4];
	const ant = (s: number) => {
		const w = Math.sin(frame * 0.17 + s + seed) * 5;
		return `M${s * 30},-370 Q${s * 40},-420 ${s * 64 + w},-462`;
	};
	return (
		<g transform={`translate(${x},${y}) rotate(${lean + (elder ? 4 : 0)}) scale(${scale * (flip ? -1 : 1)},${scale})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="38%" cy="32%" r="78%">
					<stop offset="0" stopColor="#DFF7B0" />
					<stop offset="0.55" stopColor={hue} />
					<stop offset="1" stopColor="#4E8A2E" />
				</radialGradient>
				<filter id={did} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.05} 0 0  0 0 0 1 0`} />
				</filter>
			</defs>
			{shadow && <Shadow w={120} />}
			{/* antennes */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={ant(s)} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
					<path d={ant(s)} stroke="#7DBA4A" strokeWidth={7} fill="none" strokeLinecap="round" />
				</g>
			))}
			{/* corps kiwi duveteux vert clair */}
			<g filter="url(#soft)">
				{NAM_FUZZ.map(([fx, fy, a], i) => (
					<path key={i} d={`M${fx},${fy} l${Math.cos(a + 0.4) * 13},${Math.sin(a + 0.4) * 13}`} stroke="#5E9A38" strokeWidth={5} strokeLinecap="round" />
				))}
				<ellipse cx={0} cy={-230} rx={130} ry={150} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.1} />
			</g>
			<ellipse cx={-62} cy={-300} rx={22} ry={34} fill="#FFFFFF" opacity={0.35} transform="rotate(28,-62,-300)" />
			{/* robe blanche avec ceinture */}
			<path d="M-118,-170 Q0,-140 118,-170 L150,-12 Q0,10 -150,-12 Z" fill="#F7F4EE" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<path d="M-60,-150 L-70,-16 M60,-150 L70,-16" stroke="#D9D2C4" strokeWidth={5} />
			<path d="M-122,-150 Q0,-120 122,-150 L118,-126 Q0,-96 -118,-126 Z" fill={elder ? '#3A64B8' : '#4A86C8'} stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
			{[-1, 1].map((s) => <ellipse key={s} cx={s * 60} cy={-6} rx={36} ry={18} fill="#6B3A1E" stroke={INK} strokeWidth={SW * 0.8} />)}
			<Arm sx={-120} sy={-170} angle={armL} len={elder ? 70 : 80} side={-1} color="#F7F4EE" glove={hue} handR={22} width={26} />
			<Arm sx={120} sy={-170} angle={armR} len={elder ? 70 : 80} side={1} color="#F7F4EE" glove={hue} handR={22} width={26} />
			{elder && (
				<g>
					{/* rides et canne */}
					<path d="M-40,-322 Q0,-332 40,-322 M-30,-308 Q0,-316 30,-308" stroke="#5E9A38" strokeWidth={5} fill="none" strokeLinecap="round" />
					<path d="M170,-100 L190,10" stroke={INK} strokeWidth={22} strokeLinecap="round" />
					<path d="M170,-100 L190,10" stroke="#8A5A2A" strokeWidth={12} strokeLinecap="round" />
					<path d="M150,-110 Q170,-140 190,-112" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
					<path d="M150,-110 Q170,-140 190,-112" stroke="#8A5A2A" strokeWidth={12} fill="none" strokeLinecap="round" />
				</g>
			)}
			{/* yeux méfiants */}
			<Eye x={-40} y={-262} rx={30} ry={30} side={-1} look={look} blink={blink} anger={anger} skin={hue} iris="#2A3A10" pupil={0.8} />
			<Eye x={40} y={-262} rx={30} ry={30} side={1} look={look} blink={blink} anger={anger} skin={hue} iris="#2A3A10" pupil={0.8} />
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * 12},-296 Q${s * 40},${-304 + (elder ? 4 : 0)} ${s * 70},-300`} stroke="#3E6A22" strokeWidth={10} strokeLinecap="round" fill="none" />
			))}
			<Mouth x={0} y={-200} w={70} open={mouth} mood={mood} scale={0.6} />
		</g>
	);
};

/* ============================== VAISSEAU GOUSSE DE PETIT POIS ============================== */
export const PeaShip: React.FC<{x: number; y: number; scale: number; rot?: number; frame: number; fire?: number; open?: boolean}> = ({x, y, scale, rot = 0, frame, fire = 0}) => {
	const gid = useUid('pea');
	const fl = (frame % 4) * 26;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`}>
			<defs>
				<linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#A8E05A" />
					<stop offset="0.5" stopColor="#5DAA2E" />
					<stop offset="1" stopColor="#2E6A18" />
				</linearGradient>
			</defs>
			{/* flammes des réacteurs (à gauche = arrière) */}
			{fire > 0 && (
				<g opacity={fire}>
					<path d={`M-300,-40 Q-${520 + fl},-20 -${640 + fl},0 Q-${520 + fl},20 -300,40 Z`} fill="#FF7A1A" opacity={0.85} filter="url(#blur8)" />
					<path d={`M-300,-24 Q-${420 + fl * 0.6},-10 -${500 + fl * 0.6},0 Q-${420 + fl * 0.6},10 -300,24 Z`} fill="#FFE27A" filter="url(#blur3)" />
					<path d="M-300,-12 L-380,0 L-300,12 Z" fill="#FFFFFF" />
				</g>
			)}
			{/* ailerons */}
			<path d="M-230,-60 L-320,-170 L-250,-170 L-150,-70 Z" fill="#3E8A22" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<path d="M-230,60 L-320,170 L-250,170 L-150,70 Z" fill="#3E8A22" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			{/* gousse */}
			<path d="M-300,0 C-280,-110 -60,-120 120,-96 C240,-80 330,-40 360,0 C330,40 240,80 120,96 C-60,120 -280,110 -300,0 Z" fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.3} strokeLinejoin="round" />
			{/* couture de la gousse */}
			<path d="M-290,-8 C-160,-30 80,-34 350,-4" stroke="#2E6A18" strokeWidth={6} fill="none" />
			<path d="M-250,-54 C-150,-78 20,-84 140,-70" stroke="#E2FFB0" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
			{/* hublots en forme de petits pois */}
			{[-170, -60, 50, 160].map((px, i) => (
				<g key={i}>
					<circle cx={px} cy={26} r={40} fill="#BFE8FF" stroke={INK} strokeWidth={SW * 0.9} />
					<circle cx={px} cy={26} r={30} fill="#7FD04A" opacity={0.55} />
					<circle cx={px - 12} cy={14} r={10} fill="#FFFFFF" opacity={0.85} />
				</g>
			))}
			{/* tige à l'avant */}
			<path d="M350,0 Q390,-30 380,-70" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
			<path d="M350,0 Q390,-30 380,-70" stroke="#4E9A2A" strokeWidth={12} fill="none" strokeLinecap="round" />
			<circle cx={380} cy={-74} r={10} fill={frame % 12 < 6 ? '#FF3B3B' : '#FFB0B0'} stroke={INK} strokeWidth={4} />
			{/* tuyères */}
			{[-28, 28].map((ty) => <rect key={ty} x={-318} y={ty - 18} width={34} height={36} rx={8} fill="#7A828C" stroke={INK} strokeWidth={6} />)}
		</g>
	);
};

/* ============================== CAPSULE DE VÉGÉNADE (sphère grenade) ============================== */
export const VegPod: React.FC<{x: number; y: number; scale: number; frame: number; trail?: number}> = ({x, y, scale, frame, trail = 1}) => (
	<g transform={`translate(${x},${y}) scale(${scale})`}>
		{trail > 0 && <path d={`M-40,0 L${-600 - (frame % 6) * 20},-30 L${-600 - (frame % 6) * 20},30 Z`} fill="#FF6A8A" opacity={0.45 * trail} filter="url(#blur8)" />}
		<circle r={90} fill="#7B1E3A" stroke={INK} strokeWidth={SW * 1.2} />
		<path d="M-60,-60 L-30,-30 L-50,0 M50,-60 L30,-20 L56,10" stroke="#D9A93A" strokeWidth={6} fill="none" />
		<circle cx={20} cy={-10} r={36} fill="#FF4A6A" stroke={INK} strokeWidth={7} />
		<circle cx={10} cy={-20} r={10} fill="#FFD0D8" />
		{[[-20, -120], [0, -132], [20, -120]].map(([a, b], i) => <path key={i} d={`M${a * 0.5},-86 L${a},${b} L${a + 12},-86 Z`} fill="#5A1028" stroke={INK} strokeWidth={5} />)}
	</g>
);

/* ============================== BOULE ORANGE (étoiles rouges) ============================== */
const star = (r: number) => {
	let d = '';
	for (let i = 0; i < 10; i++) {
		const a = (i * Math.PI) / 5 - Math.PI / 2;
		const rr = i % 2 ? r * 0.45 : r;
		d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
	}
	return d + 'Z';
};
const STAR_POS: Record<number, Array<[number, number]>> = {
	1: [[0, 0]], 2: [[-18, 0], [18, 0]], 3: [[0, -18], [-18, 12], [18, 12]], 4: [[-18, -18], [18, -18], [-18, 18], [18, 18]],
	5: [[0, 0], [-22, -22], [22, -22], [-22, 22], [22, 22]], 6: [[-18, -26], [18, -26], [-24, 0], [24, 0], [-18, 26], [18, 26]],
	7: [[0, 0], [-18, -28], [18, -28], [-30, 0], [30, 0], [-18, 28], [18, 28]],
};
export const OrangeBall: React.FC<{x: number; y: number; r: number; stars: number; holo?: boolean; frame: number}> = ({x, y, r, stars, holo, frame}) => {
	const k = r / 60;
	return (
		<g transform={`translate(${x},${y})`}>
			<circle r={r * 1.6} fill={holo ? '#6FD8FF' : '#FFB040'} opacity={0.25 + Math.sin(frame * 0.2 + stars) * 0.08} filter="url(#blur20)" />
			<circle r={r} fill={holo ? '#FFB347' : '#FF9A1F'} stroke={holo ? '#BFF2FF' : INK} strokeWidth={holo ? 5 : SW} opacity={holo ? 0.85 : 1} />
			<circle cx={-r * 0.32} cy={-r * 0.36} r={r * 0.28} fill="#FFFFFF" opacity={0.65} />
			{STAR_POS[stars].map(([sx, sy], i) => <path key={i} d={star(13)} transform={`translate(${sx * k},${sy * k}) scale(${k})`} fill="#E0201E" />)}
		</g>
	);
};

/* ============================== OISEAU ÉTRANGE DE NAMEK ============================== */
export const OddBird: React.FC<{x: number; y: number; s: number; frame: number; seed?: number}> = ({x, y, s, frame, seed = 0}) => {
	const fl = Math.sin(frame * 0.35 + seed) * 26;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<path d={`M-70,${fl * 0.5} Q-40,${-30 - fl} 0,0 Q40,${-30 - fl} 70,${fl * 0.5}`} fill="none" stroke="#2E4A5A" strokeWidth={9} strokeLinecap="round" />
			<path d="M0,0 L-6,-12 L30,-6 Z" fill="#2E4A5A" />
			<path d="M-4,4 Q-24,20 -40,14" stroke="#2E4A5A" strokeWidth={6} fill="none" strokeLinecap="round" />
		</g>
	);
};

/** Champ d'étoiles (fixe), avec scintillement. */
export const Stars: React.FC<{frame: number; n?: number; seed?: string; w?: number; h?: number}> = ({frame, n = 110, seed = 'st', w = 1080, h = 1920}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const r = 1.5 + random(`${seed}r${i}`) * 3.5;
			const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.06 + i * 1.7));
			return <circle key={i} cx={random(`${seed}x${i}`) * (w + 200) - 100} cy={random(`${seed}y${i}`) * (h + 200) - 100} r={r} fill="#FFFFFF" opacity={tw * (0.5 + random(`${seed}o${i}`) * 0.5)} />;
		})}
	</g>
);
