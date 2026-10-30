import React from 'react';
import {random} from 'remotion';
import {Namekian} from './characters3';
import {Arm, blinkAt, Eye, INK, Mood, Mouth, SW, useUid} from './parts';

/* ============================== LITCHEEZER (litchi, façon Freezer) ============================== */
// silhouette fine et élancée : œuf étiré, plus étroit en haut
const LTZ_BODY = 'M0,-560 C78,-562 128,-500 132,-410 C138,-300 128,-200 0,-150 C-128,-200 -138,-300 -132,-410 C-128,-500 -78,-562 0,-560 Z';
// petites écailles nacrées très discrètes (souvenir de la peau du litchi)
const LTZ_SCALES = Array.from({length: 26}, (_, i) => {
	const a = (i * 137.5 * Math.PI) / 180;
	const r = 0.35 + ((i * 41) % 60) / 100;
	return [Math.cos(a) * 110 * r, -360 + Math.sin(a) * 170 * r] as const;
});

export const Litcheezer: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; darken?: number; armL?: number; armR?: number;
	/** 0..1 : lève l'index droit vers le ciel */
	finger?: number; smile?: number; pod?: boolean; tail?: number; glow?: number;
}> = ({
	x, y, scale = 1, flip, frame, mouth = 0, mood = 'sneer', look = [0, 0], lean = 0, darken = 0,
	armL = 50, armR = 50, finger = 0, smile = 1, pod = true, tail = 1, glow = 0,
}) => {
	const gid = useUid('ltzg');
	const hid = useUid('ltzh');
	const pid = useUid('ltzp');
	const did = useUid('ltzd');
	const blink = mood === 'shock' ? 0 : blinkAt(frame, 53);
	const skin = '#F7C6D9';
	const k = 1 - darken;
	// la capsule flotte doucement
	const bob = Math.sin(frame * 0.08) * 10;
	// queue qui fouette derrière lui
	const w1 = Math.sin(frame * 0.14) * 50 * tail;
	const w2 = Math.sin(frame * 0.14 - 1.2) * 70 * tail;
	const tailD = `M-60,-200 C-260,-170 ${-330 + w1 * 0.4},-300 ${-300 + w1},-420 C${-280 + w2},-520 ${-200 + w2},-560 ${-170 + w2 * 1.2},-500`;
	const armRA = armR * (1 - finger) + 168 * finger;
	const armRL = 95 * (1 - finger) + 150 * finger;
	const ra = (armRA * Math.PI) / 180;
	const hx = 104 + Math.sin(ra) * armRL;
	const hy = -300 + Math.cos(ra) * armRL;
	const talking = mouth > 0.06;
	return (
		<g transform={`translate(${x},${y + bob}) rotate(${lean}) scale(${scale * (flip ? -1 : 1)},${scale})`} filter={darken > 0 ? `url(#${did})` : undefined}>
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
				<linearGradient id={pid} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#F2EEF8" />
					<stop offset="0.45" stopColor="#B9AEC8" />
					<stop offset="1" stopColor="#6E6284" />
				</linearGradient>
				<filter id={did} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.08} 0 ${darken * 0.03}  0 0 0 1 0`} />
				</filter>
			</defs>
			{/* halo bleu froid sous la capsule */}
			{pod && <ellipse cx={0} cy={60 - bob} rx={170} ry={40} fill="#7FC8FF" opacity={0.35 + glow * 0.3} filter="url(#blur20)" />}
			{/* longue queue (derrière) */}
			<path d={tailD} stroke={INK} strokeWidth={44 + SW * 2} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke="#F7C6D9" strokeWidth={44} fill="none" strokeLinecap="round" />
			<path d={tailD} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.55} transform="translate(-6,-8)" />
			{/* cornes courtes */}
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * 70},-520 Q${s * 120},-570 ${s * 150},-640 Q${s * 112},-600 ${s * 96},-500 Z`} fill="#F4EEF6" stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
			))}
			{/* bras gauche (derrière, posé sur le rebord) */}
			<Arm sx={-104} sy={-300} angle={armL} len={95} side={-1} color="#F7C6D9" glove="#F7C6D9" handR={22} width={22} />
			{/* corps nacré */}
			<g filter="url(#soft)">
				<path d={LTZ_BODY} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
			</g>
			{LTZ_SCALES.map(([sx, sy], i) => (
				<path key={i} d={`M${sx - 10},${sy} q10,-9 20,0`} stroke="#D89AB6" strokeWidth={3} fill="none" opacity={0.45} />
			))}
			{/* reflets blancs métalliques */}
			<path d="M-92,-470 C-112,-400 -110,-330 -84,-270" stroke={`url(#${hid})`} strokeWidth={22} fill="none" strokeLinecap="round" />
			<ellipse cx={-56} cy={-516} rx={20} ry={11} fill="#FFFFFF" opacity={0.9} transform="rotate(-30,-56,-516)" />
			<path d="M100,-450 C112,-390 110,-330 96,-280" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
			{/* gemme violette sur le crâne et aux épaules */}
			<ellipse cx={0} cy={-532} rx={44} ry={20} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
			<ellipse cx={-14} cy={-538} rx={14} ry={6} fill="#E6C8FF" opacity={0.85} />
			{[-1, 1].map((s) => (
				<g key={s}>
					<ellipse cx={s * 112} cy={-322} rx={30} ry={22} fill="#9A5ABF" stroke={INK} strokeWidth={SW * 0.8} />
					<ellipse cx={s * 112 - 8} cy={-328} rx={9} ry={5} fill="#E6C8FF" opacity={0.85} />
				</g>
			))}
			{/* regard étroit et cruel, iris rouges */}
			<Eye x={-42} y={-440} rx={30} ry={22} side={-1} look={look} blink={blink} anger={mood === 'shock' ? 0 : 0.42} skin={skin} iris="#C0204A" pupil={0.7} />
			<Eye x={42} y={-440} rx={30} ry={22} side={1} look={look} blink={blink} anger={mood === 'shock' ? 0 : 0.42} skin={skin} iris="#C0204A" pupil={0.7} />
			{/* lèvres violettes */}
			{talking || smile <= 0 ? (
				<Mouth x={0} y={-372} w={78} open={mouth} mood={mood} scale={0.6} />
			) : (
				<g>
					<path d={`M-52,${-378 - smile * 8} Q0,${-354 + smile * 10} 52,${-378 - smile * 8}`} stroke="#5A2A6A" strokeWidth={9} fill="none" strokeLinecap="round" />
					<path d={`M-52,${-378 - smile * 8} l-8,-8 M52,${-378 - smile * 8} l8,-8`} stroke="#5A2A6A" strokeWidth={6} strokeLinecap="round" />
				</g>
			)}
			{/* capsule flottante (devant) */}
			{pod && (
				<g>
					<path d="M-210,-230 Q-214,-40 0,0 Q214,-40 210,-230 Z" fill={`url(#${pid})`} stroke={INK} strokeWidth={SW * 1.2} strokeLinejoin="round" />
					<ellipse cx={0} cy={-230} rx={210} ry={34} fill="#DCD4E8" stroke={INK} strokeWidth={SW} />
					<path d="M-160,-160 Q0,-120 160,-160" stroke="#9A5ABF" strokeWidth={16} fill="none" />
					<path d="M-150,-200 Q-150,-90 -60,-50" stroke="#FFFFFF" strokeWidth={12} fill="none" opacity={0.6} strokeLinecap="round" />
					{[-90, 0, 90].map((lx) => <circle key={lx} cx={lx} cy={-100 + Math.abs(lx) * 0.2} r={9} fill={frame % 30 < 15 ? '#7FD8FF' : '#C8F0FF'} stroke={INK} strokeWidth={3} />)}
					{/* petite antenne */}
					<path d="M180,-240 L200,-310" stroke={INK} strokeWidth={6} />
					<circle cx={200} cy={-314} r={9} fill={frame % 20 < 10 ? '#FF4A6A' : '#FFC0CC'} stroke={INK} strokeWidth={3} />
				</g>
			)}
			{/* bras droit (devant), index levé */}
			<Arm sx={104} sy={-300} angle={armRA} len={armRL} side={1} color="#F7C6D9" glove="#F7C6D9" handR={22} width={22} />
			{finger > 0.4 && (
				<g opacity={Math.min(1, (finger - 0.4) * 3)}>
					<path d={`M${hx},${hy - 10} L${hx + 4},${hy - 62}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
					<path d={`M${hx},${hy - 10} L${hx + 4},${hy - 62}`} stroke="#F7C6D9" strokeWidth={12} strokeLinecap="round" />
					{glow > 0 && <circle cx={hx + 4} cy={hy - 66} r={14 + glow * 30} fill="#FFFFFF" opacity={0.6 + glow * 0.4} filter="url(#blur8)" />}
					{glow > 0 && <circle cx={hx + 4} cy={hy - 66} r={8 + glow * 8} fill="#FFFFFF" />}
				</g>
			)}
		</g>
	);
};

/** Bout de l'index levé de Litcheezer (repère du monde, finger = 1). */
export const ltzFinger = (x: number, y: number, scale: number, frame: number): [number, number] => {
	const a = (168 * Math.PI) / 180;
	return [x + (104 + Math.sin(a) * 150 + 4) * scale, y + Math.sin(frame * 0.08) * 10 + (-300 + Math.cos(a) * 150 - 66) * scale];
};

/* ============================== SBIRES : fruits secs en armure grise ============================== */
export const DriedSoldier: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; kind?: 'raisin' | 'date'; seed?: number;
	look?: [number, number]; darken?: number; salute?: number;
}> = ({x, y, scale = 1, flip, frame, kind = 'raisin', seed = 0, look = [0, 0], darken = 0, salute = 0}) => {
	const gid = useUid('sold');
	const did = useUid('soldd');
	const k = 1 - darken;
	const raisin = kind === 'raisin';
	const rx = raisin ? 100 : 80;
	const ry = raisin ? 110 : 150;
	const cy = -40 - ry;
	const skin = raisin ? '#4A2A44' : '#7A4A22';
	const blink = blinkAt(frame, 61 + seed);
	// rides du fruit sec
	const wr = Array.from({length: raisin ? 7 : 5}, (_, i) => {
		const yy = cy - ry * 0.7 + (i / (raisin ? 6 : 4)) * ry * 1.3 + (random(`w${seed}${i}`) - 0.5) * 12;
		const ww = rx * (0.5 + random(`ww${seed}${i}`) * 0.4);
		return `M${-ww},${yy} q${ww * 0.5},${-10 - random(`wq${seed}${i}`) * 10} ${ww},0 t${ww},0`;
	});
	return (
		<g transform={`translate(${x},${y}) scale(${scale * (flip ? -1 : 1)},${scale})`} filter={darken > 0 ? `url(#${did})` : undefined}>
			<defs>
				<radialGradient id={gid} cx="38%" cy="30%" r="80%">
					<stop offset="0" stopColor={raisin ? '#8A5A80' : '#B07A44'} />
					<stop offset="0.6" stopColor={skin} />
					<stop offset="1" stopColor={raisin ? '#220E20' : '#3E2410'} />
				</radialGradient>
				<filter id={did} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
					<feColorMatrix type="matrix" values={`${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k * 1.08} 0 ${darken * 0.03}  0 0 0 1 0`} />
				</filter>
			</defs>
			<ellipse cx={0} cy={-4} rx={rx * 0.9} ry={14} fill="#000" opacity={0.3} filter="url(#blur8)" />
			{/* jambes grises */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M${s * 30},-50 L${s * 34},-14`} stroke={INK} strokeWidth={20 + SW * 2} strokeLinecap="round" />
					<path d={`M${s * 30},-50 L${s * 34},-14`} stroke="#6A707A" strokeWidth={20} strokeLinecap="round" />
					<ellipse cx={s * 40} cy={-10} rx={26} ry={14} fill="#3A3E46" stroke={INK} strokeWidth={SW * 0.8} />
				</g>
			))}
			<g filter="url(#soft)">
				<ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW} />
			</g>
			{wr.map((d, i) => <path key={i} d={d} stroke="#1A0A12" strokeWidth={4} fill="none" opacity={0.45} strokeLinecap="round" />)}
			{/* armure grise : plastron et épaulettes */}
			<path d={`M${-rx * 0.92},${cy + ry * 0.15} Q0,${cy + ry * 0.05} ${rx * 0.92},${cy + ry * 0.15} L${rx * 0.8},${cy + ry * 0.8} Q0,${cy + ry * 1.0} ${-rx * 0.8},${cy + ry * 0.8} Z`} fill="#9AA0AA" stroke={INK} strokeWidth={SW * 0.9} strokeLinejoin="round" />
			<path d={`M${-rx * 0.6},${cy + ry * 0.32} Q0,${cy + ry * 0.24} ${rx * 0.6},${cy + ry * 0.32}`} stroke="#D8DCE2" strokeWidth={6} fill="none" />
			{[-1, 1].map((s) => (
				<path key={s} d={`M${s * rx * 0.55},${cy + ry * 0.1} Q${s * rx * 1.25},${cy - ry * 0.05} ${s * rx * 1.15},${cy + ry * 0.38} Q${s * rx * 0.9},${cy + ry * 0.3} ${s * rx * 0.6},${cy + ry * 0.3} Z`} fill="#7E848E" stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
			))}
			{/* petits bras */}
			<Arm sx={-rx * 0.9} sy={cy + ry * 0.3} angle={15} len={50} side={-1} color="#6A707A" glove="#3A3E46" handR={16} width={16} fist />
			<Arm sx={rx * 0.9} sy={cy + ry * 0.3} angle={15 + salute * 150} len={50} side={1} color="#6A707A" glove="#3A3E46" handR={16} width={16} fist />
			{/* yeux et viseur vert */}
			<Eye x={-rx * 0.34} y={cy - ry * 0.3} rx={18} ry={18} side={-1} look={look} blink={blink} anger={0.5} skin={skin} pupil={0.7} />
			<Eye x={rx * 0.34} y={cy - ry * 0.3} rx={18} ry={18} side={1} look={look} blink={blink} anger={0.5} skin={skin} pupil={0.7} />
			<path d={`M${rx * 0.1},${cy - ry * 0.48} L${rx * 0.72},${cy - ry * 0.48} L${rx * 0.72},${cy - ry * 0.14} L${rx * 0.1},${cy - ry * 0.14} Z`} fill="#5BE03A" opacity={0.55} stroke={INK} strokeWidth={4} />
			<path d={`M${rx * 0.72},${cy - ry * 0.32} L${rx * 0.98},${cy - ry * 0.32}`} stroke="#3A3E46" strokeWidth={8} />
			<path d={`M${-rx * 0.22},${cy - ry * 0.02} Q0,${cy + ry * 0.04} ${rx * 0.22},${cy - ry * 0.02}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
		</g>
	);
};

/* ============================== VIEUX NAMEKIEN (grand kiwi âgé, barbe de duvet blanc) ============================== */
const BEARD = Array.from({length: 14}, (_, i) => {
	const t = i / 13;
	const a = Math.PI * (0.05 + t * 0.9);
	return [Math.cos(a) * 92, -196 + Math.sin(a) * 120, 26 + Math.sin(t * Math.PI) * 10] as const;
});

export const NamekElder: React.FC<{
	x: number; y: number; scale?: number; flip?: boolean; frame: number; mouth?: number; mood?: Mood;
	look?: [number, number]; lean?: number; darken?: number; armL?: number; armR?: number;
}> = (p) => {
	const {x, y, scale = 1, flip, lean = 0} = p;
	const sway = Math.sin(p.frame * 0.05) * 4;
	return (
		<g>
			<Namekian {...p} elder seed={1} />
			{/* barbe de duvet blanc (même placement que le Namekien, sous la bouche) */}
			<g transform={`translate(${x},${y}) rotate(${lean + 4}) scale(${scale * (flip ? -1 : 1)},${scale})`}>
				<path d={`M-92,-190 Q-100,-120 -40,-78 Q${sway},-40 40,-78 Q100,-120 92,-190 Q60,-170 30,-178 Q0,-168 -30,-178 Q-60,-170 -92,-190 Z`} fill="#F8F8F2" stroke={INK} strokeWidth={SW * 0.8} strokeLinejoin="round" />
				{BEARD.map(([bx, by, r], i) => <circle key={i} cx={bx + sway * 0.3} cy={by} r={r * 0.55} fill="#F8F8F2" />)}
				<path d="M-50,-140 Q-40,-110 -24,-96 M10,-150 Q14,-110 6,-86 M54,-140 Q46,-112 34,-98" stroke="#D2D2CA" strokeWidth={4} fill="none" strokeLinecap="round" />
				{/* sourcils broussailleux blancs */}
				{[-1, 1].map((s) => <path key={s} d={`M${s * 10},-298 Q${s * 44},-318 ${s * 80},-300`} stroke="#F8F8F2" strokeWidth={14} strokeLinecap="round" fill="none" />)}
			</g>
		</g>
	);
};

/* ============================== VAISSEAU ROND DE LITCHEEZER ============================== */
export const SaucerShip: React.FC<{x: number; y: number; scale: number; frame: number; legs?: number; ramp?: number; glow?: number}> = ({x, y, scale, frame, legs = 0, ramp = 0, glow = 1}) => {
	const gid = useUid('sauc');
	const did = useUid('saucd');
	return (
		<g transform={`translate(${x},${y}) scale(${scale})`}>
			<defs>
				<linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.45" stopColor="#E4DCEC" />
					<stop offset="1" stopColor="#8E809E" />
				</linearGradient>
				<radialGradient id={did} cx="40%" cy="30%" r="80%">
					<stop offset="0" stopColor="#E8D8FF" />
					<stop offset="0.6" stopColor="#9A6ACB" />
					<stop offset="1" stopColor="#4A2A6A" />
				</radialGradient>
			</defs>
			{/* faisceau bleu froid */}
			{glow > 0 && <path d="M-300,120 L-520,1100 L520,1100 L300,120 Z" fill="#9FD8FF" opacity={0.18 * glow} filter="url(#blur20)" />}
			{/* pieds */}
			{[-1, 0, 1].map((s) => (
				<g key={s} opacity={legs > 0 ? 1 : 0}>
					<path d={`M${s * 300},110 L${s * (300 + 60 * legs)},${110 + 200 * legs}`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
					<path d={`M${s * 300},110 L${s * (300 + 60 * legs)},${110 + 200 * legs}`} stroke="#B8AEC6" strokeWidth={20} strokeLinecap="round" />
					<ellipse cx={s * (300 + 60 * legs)} cy={110 + 200 * legs} rx={50} ry={16} fill="#8E809E" stroke={INK} strokeWidth={6} />
				</g>
			))}
			{/* dessous et disque */}
			<ellipse cx={0} cy={60} rx={420} ry={110} fill="#6E6284" stroke={INK} strokeWidth={SW * 1.4} />
			<ellipse cx={0} cy={0} rx={520} ry={150} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.6} />
			<path d="M-500,20 Q0,140 500,20" stroke="#9A5ABF" strokeWidth={24} fill="none" />
			{Array.from({length: 9}, (_, i) => (
				<circle key={i} cx={-400 + i * 100} cy={46 + Math.abs(i - 4) * -6} r={16} fill="#FF4A6A" opacity={0.55 + 0.45 * Math.sin(frame * 0.3 + i)} stroke={INK} strokeWidth={4} />
			))}
			{/* dôme */}
			<path d="M-300,-60 C-300,-260 300,-260 300,-60 Z" fill={`url(#${did})`} stroke={INK} strokeWidth={SW * 1.4} />
			<path d="M-210,-90 C-200,-190 -80,-230 20,-220" stroke="#FFFFFF" strokeWidth={18} fill="none" opacity={0.55} strokeLinecap="round" />
			<ellipse cx={0} cy={-60} rx={300} ry={30} fill="none" stroke={INK} strokeWidth={6} />
			{/* rampe */}
			{ramp > 0 && <path d={`M-70,120 L70,120 L${90 + 30 * ramp},${120 + 260 * ramp} L${-90 - 30 * ramp},${120 + 260 * ramp} Z`} fill="#CFC6DC" stroke={INK} strokeWidth={6} />}
			{ramp > 0 && <rect x={-70} y={60} width={140} height={60} fill="#FFF6FF" opacity={0.8 * ramp} />}
		</g>
	);
};

/* ============================== PETIT VAISSEAU ROND DE POMGOKU ============================== */
/** Capsule ronde avec un grand hublot ; `inside` est dessiné dans le hublot (repère centré sur le hublot, rayon 120). */
export const PomShip: React.FC<{x: number; y: number; scale: number; rot?: number; frame: number; trail?: number; inside?: React.ReactNode}> = ({x, y, scale, rot = 0, frame, trail = 1, inside}) => {
	const gid = useUid('poms');
	const cid = useUid('pomsc');
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${scale})`}>
			<defs>
				<radialGradient id={gid} cx="35%" cy="30%" r="80%">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.55" stopColor="#E6E8EE" />
					<stop offset="1" stopColor="#8A909C" />
				</radialGradient>
				<clipPath id={cid}><circle cx={30} cy={-10} r={120} /></clipPath>
			</defs>
			{/* traînée de lumière dorée (vers l'arrière, à gauche) */}
			{trail > 0 && (
				<g opacity={trail}>
					<path d={`M-200,-120 L${-1400 - (frame % 5) * 40},-40 L${-1400 - (frame % 5) * 40},40 L-200,120 Z`} fill="#FFC23A" opacity={0.45} filter="url(#blur20)" />
					<path d={`M-200,-60 L${-900 - (frame % 4) * 30},0 L-200,60 Z`} fill="#FFE89A" opacity={0.85} filter="url(#blur8)" />
					<path d="M-210,-26 L-420,0 L-210,26 Z" fill="#FFFFFF" />
				</g>
			)}
			{/* ailerons */}
			<path d="M-150,-150 L-250,-250 L-190,-260 L-80,-200 Z" fill="#D22B2B" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<path d="M-150,150 L-250,250 L-190,260 L-80,200 Z" fill="#D22B2B" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			<circle r={220} fill={`url(#${gid})`} stroke={INK} strokeWidth={SW * 1.4} />
			<path d="M-218,30 Q0,110 218,30" stroke="#D22B2B" strokeWidth={30} fill="none" />
			{/* petite tige verte sur le dessus, comme une pomme */}
			<path d="M0,-218 Q10,-270 -6,-300" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
			<path d="M0,-218 Q10,-270 -6,-300" stroke="#3E9B3A" strokeWidth={12} fill="none" strokeLinecap="round" />
			{/* hublot */}
			<circle cx={30} cy={-10} r={132} fill="#2A3A5A" stroke={INK} strokeWidth={SW * 1.2} />
			<circle cx={30} cy={-10} r={120} fill="#9FD8FF" />
			<g clipPath={`url(#${cid})`}>{inside}</g>
			<circle cx={30} cy={-10} r={120} fill="none" stroke="#C8D0DC" strokeWidth={14} />
			<path d="M-50,-80 Q-10,-120 50,-118" stroke="#FFFFFF" strokeWidth={14} fill="none" opacity={0.55} strokeLinecap="round" />
			{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={30 + Math.cos((a * Math.PI) / 180) * 132} cy={-10 + Math.sin((a * Math.PI) / 180) * 132} r={7} fill="#8A909C" stroke={INK} strokeWidth={3} />)}
		</g>
	);
};
