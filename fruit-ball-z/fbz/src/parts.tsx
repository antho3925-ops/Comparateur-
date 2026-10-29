import React from 'react';
import {random} from 'remotion';

export const INK = '#1E0F0A';
export const SW = 9;

let idc = 0;
export const useUid = (p: string) => React.useMemo(() => `${p}${++idc}`, [p]);

export const blinkAt = (frame: number, seed: number) => {
	// clignement de 5 images toutes les ~80-110 images
	const period = 80 + Math.floor(random(seed) * 30);
	const ph = (frame + seed * 13) % period;
	return ph < 5 ? Math.sin((ph / 5) * Math.PI) : 0;
};

export type Mood = 'happy' | 'shock' | 'angry' | 'determined' | 'sneer' | 'cry' | 'fear';

/** Oeil cartoon : blanc + iris + reflets, paupière (clignement) et paupière en colère inclinée. */
export const Eye: React.FC<{
	x: number; y: number; rx: number; ry: number;
	look?: [number, number]; blink?: number; anger?: number; side: 1 | -1;
	iris?: string; pupil?: number; skin: string; sad?: number; glow?: string;
}> = ({x, y, rx, ry, look = [0, 0], blink = 0, anger = 0, side, iris = '#2B1A12', pupil = 1, skin, sad = 0, glow}) => {
	const id = useUid('eye');
	const ir = Math.min(rx, ry) * 0.62 * pupil;
	const lx = x + look[0] * rx * 0.38;
	const ly = y + look[1] * ry * 0.35;
	// paupière en colère : triangle qui descend côté intérieur (side=-1 => oeil gauche, intérieur à droite)
	const inner = x - side * rx;
	const outer = x + side * rx;
	const top = y - ry - 4;
	const angerDrop = anger * ry * 1.05;
	const sadDrop = sad * ry * 0.9;
	return (
		<g>
			<clipPath id={id}>
				<ellipse cx={x} cy={y} rx={rx} ry={ry} />
			</clipPath>
			<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#FFFFFF" />
			<g clipPath={`url(#${id})`}>
				<ellipse cx={x} cy={y + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#D9E2F0" opacity={0.6} />
				<circle cx={lx} cy={ly} r={ir} fill={iris} />
				<circle cx={lx} cy={ly} r={ir * 0.55} fill="#080404" />
				<circle cx={lx - ir * 0.35} cy={ly - ir * 0.4} r={ir * 0.36} fill="#FFFFFF" />
				<circle cx={lx + ir * 0.35} cy={ly + ir * 0.35} r={ir * 0.15} fill="#FFFFFF" />
				{glow && <circle cx={lx} cy={ly} r={ir * 1.1} fill={glow} opacity={0.9} />}
				{/* paupière colère */}
				{anger > 0 && (
					<polygon points={`${inner - 4},${top} ${outer + 4},${top} ${outer + 4},${top + angerDrop * 0.25} ${inner - 4},${top + angerDrop}`} fill={skin} />
				)}
				{sad > 0 && (
					<polygon points={`${inner - 4},${top} ${outer + 4},${top} ${outer + 4},${top + sadDrop} ${inner - 4},${top + sadDrop * 0.2}`} fill={skin} />
				)}
				{/* clignement */}
				{blink > 0 && <rect x={x - rx - 5} y={y - ry - 5} width={rx * 2 + 10} height={(ry * 2 + 10) * blink} fill={skin} />}
			</g>
			<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={SW * 0.85} />
			{blink > 0.6 && <line x1={x - rx} y1={y} x2={x + rx} y2={y} stroke={INK} strokeWidth={SW * 0.8} strokeLinecap="round" />}
		</g>
	);
};

/** Bouche : `open` 0..1 (synchro labiale), forme selon l'humeur. */
export const Mouth: React.FC<{x: number; y: number; w: number; open: number; mood: Mood; scale?: number}> = ({x, y, w, open, mood, scale = 1}) => {
	const id = useUid('mouth');
	const hw = w / 2;
	const s = scale;
	if (open < 0.06) {
		let d: string;
		if (mood === 'happy') d = `M${x - hw},${y - 8 * s} Q${x},${y + 62 * s} ${x + hw},${y - 8 * s}`;
		else if (mood === 'sneer') d = `M${x - hw * 0.8},${y + 6 * s} Q${x},${y + 10 * s} ${x + hw},${y - 22 * s}`;
		else if (mood === 'determined' || mood === 'angry') d = `M${x - hw * 0.7},${y + 6 * s} Q${x},${y - 6 * s} ${x + hw * 0.7},${y + 6 * s}`;
		else if (mood === 'cry' || mood === 'fear') d = `M${x - hw * 0.6},${y + 10 * s} Q${x},${y - 14 * s} ${x + hw * 0.6},${y + 10 * s}`;
		else return <ellipse cx={x} cy={y} rx={hw * 0.28} ry={hw * 0.36} fill="#4A0C0C" stroke={INK} strokeWidth={SW * 0.8} />;
		return (
			<g>
				<path d={d} fill="none" stroke={INK} strokeWidth={SW * 1.1} strokeLinecap="round" />
				{mood === 'happy' && (
					<>
						<path d={`M${x - hw - 10 * s},${y - 18 * s} q8,${4 * s} 12,${16 * s}`} fill="none" stroke={INK} strokeWidth={SW * 0.6} strokeLinecap="round" />
						<path d={`M${x + hw + 10 * s},${y - 18 * s} q-8,${4 * s} -12,${16 * s}`} fill="none" stroke={INK} strokeWidth={SW * 0.6} strokeLinecap="round" />
					</>
				)}
			</g>
		);
	}
	const h = (14 + open * 70) * s;
	let topCurve = 0;
	let ww = hw;
	let tilt = 0;
	if (mood === 'happy') topCurve = 12 * s;
	if (mood === 'angry') { topCurve = -6 * s; ww = hw * 0.95; }
	if (mood === 'determined') { topCurve = -4 * s; ww = hw * 0.75; }
	if (mood === 'sneer') { topCurve = 2 * s; tilt = -14 * s; ww = hw * 0.85; }
	if (mood === 'shock' || mood === 'fear' || mood === 'cry') { ww = hw * (0.55 + open * 0.15); topCurve = -4 * s; }
	let d = `M${x - ww},${y} Q${x},${y + topCurve} ${x + ww},${y + tilt} C${x + ww * 0.9},${y + h * 1.1} ${x - ww * 0.9},${y + h * 1.1} ${x - ww},${y} Z`;
	const clench = mood === 'determined' || mood === 'angry';
	if (clench) {
		// bouche serrée : rectangle arrondi avec dents du haut et du bas
		const hh = (10 + open * 46) * s;
		const w2 = hw * (mood === 'angry' ? 0.95 : 0.8);
		d = `M${x - w2},${y - hh / 2 + 4 * s} Q${x},${y - hh / 2 - 6 * s} ${x + w2},${y - hh / 2 + 4 * s} Q${x + w2 + 8 * s},${y + hh / 2} ${x + w2 * 0.8},${y + hh / 2 + 6 * s} Q${x},${y + hh / 2 + 12 * s} ${x - w2 * 0.8},${y + hh / 2 + 6 * s} Q${x - w2 - 8 * s},${y + hh / 2} ${x - w2},${y - hh / 2 + 4 * s} Z`;
		return (
			<g>
				<clipPath id={id}><path d={d} /></clipPath>
				<path d={d} fill="#4A0C0C" />
				<g clipPath={`url(#${id})`}>
					<rect x={x - w2 - 10} y={y - hh / 2 - 12 * s} width={w2 * 2 + 20} height={16 * s + hh * 0.18} fill="#FFFFFF" />
					<rect x={x - w2 - 10} y={y + hh / 2 + 10 * s - (12 * s + hh * 0.16)} width={w2 * 2 + 20} height={30 * s} fill="#FFFFFF" />
					{[-0.5, 0, 0.5].map((k) => <line key={k} x1={x + k * w2} y1={y - hh} x2={x + k * w2} y2={y + hh} stroke="#C9C2B8" strokeWidth={3} />)}
				</g>
				<path d={d} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
			</g>
		);
	}
	if (mood === 'shock' || mood === 'fear') {
		const ry = (18 + open * 40) * s;
		const rx = (14 + open * 20) * s;
		d = `M${x - rx},${y + ry * 0.5} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;
	}
	return (
		<g>
			<clipPath id={id}>
				<path d={d} />
			</clipPath>
			<path d={d} fill="#4A0C0C" />
			<g clipPath={`url(#${id})`}>
				<ellipse cx={x} cy={y + h * 0.95} rx={ww * 0.65} ry={h * 0.42} fill="#E2566A" />
				{mood === 'sneer' && (
					<rect x={x - ww} y={y - 30 * s + topCurve * 0.5} width={ww * 2} height={30 * s + 10 * s} fill="#FFFFFF" stroke="#BBB" strokeWidth={2} />
				)}
				{mood === 'happy' && <rect x={x - ww} y={y - 20 * s} width={ww * 2} height={26 * s} fill="#FFFFFF" />}
			</g>
			<path d={d} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
		</g>
	);
};

/** Bras caoutchouc : épaule -> main, angle en degrés (0 = vers le bas, 90 = vers l'extérieur, 180 = vers le haut). */
export const Arm: React.FC<{
	sx: number; sy: number; angle: number; len: number; side: 1 | -1; color: string;
	glove: string; handR: number; width?: number; fist?: boolean;
}> = ({sx, sy, angle, len, side, color, glove, handR, width = 22, fist}) => {
	const a = (angle * Math.PI) / 180;
	const hx = sx + side * Math.sin(a) * len;
	const hy = sy + Math.cos(a) * len;
	// léger coude
	const mx = (sx + hx) / 2 + side * Math.cos(a) * 14;
	const my = (sy + hy) / 2 - Math.sin(a) * 6;
	const d = `M${sx},${sy} Q${mx},${my} ${hx},${hy}`;
	return (
		<g>
			<path d={d} stroke={INK} strokeWidth={width + SW * 2} strokeLinecap="round" fill="none" />
			<path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
			<circle cx={hx} cy={hy} r={handR} fill={glove} stroke={INK} strokeWidth={SW * 0.9} />
			{fist ? (
				<path d={`M${hx - handR * 0.5},${hy - handR * 0.2} h${handR}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
			) : (
				<circle cx={hx - handR * 0.3} cy={hy - handR * 0.35} r={handR * 0.28} fill="#FFFFFF" opacity={0.7} />
			)}
		</g>
	);
};

export const Shadow: React.FC<{w: number; o?: number}> = ({w, o = 0.32}) => (
	<ellipse cx={0} cy={-4} rx={w} ry={w * 0.16} fill="#000" opacity={o} filter="url(#blur8)" />
);

export const SharedDefs: React.FC = () => (
	<defs>
		<filter id="blur8" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="8" />
		</filter>
		<filter id="blur20" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="20" />
		</filter>
		<filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="3" />
		</filter>
		<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
			<feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#1a0a00" floodOpacity="0.35" />
		</filter>
	</defs>
);
