import React from 'react';
import {random} from 'remotion';
import {INK} from './parts';

/** Lignes de vitesse (direction en degrés, 0 = vers la droite). */
export const SpeedLines: React.FC<{frame: number; angle: number; n?: number; opacity?: number}> = ({frame, angle, n = 16, opacity = 0.5}) => (
	<g transform={`translate(540,960) rotate(${angle})`} opacity={opacity}>
		{Array.from({length: n}, (_, i) => {
			const y = (random(`sl${i}`) - 0.5) * 2200;
			const x = ((frame * 90 + random(`slx${i}`) * 3000) % 3000) - 1500;
			return <line key={i} x1={x} y1={y} x2={x - 300 - random(`sll${i}`) * 300} y2={y} stroke="#FFFFFF" strokeWidth={5 + random(`slw${i}`) * 6} strokeLinecap="round" />;
		})}
	</g>
);

/** Étoile d'impact façon manga. */
export const Impact: React.FC<{x: number; y: number; s: number; color?: string; rot?: number}> = ({x, y, s, color = '#FFF3C4', rot = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		<path d="M0,-150 L30,-50 L130,-90 L60,-10 L150,40 L40,40 L50,140 L-10,60 L-90,130 L-60,30 L-150,0 L-60,-30 L-110,-110 L-20,-60 Z" fill={color} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
		<path d="M0,-80 L16,-26 L70,-46 L30,-4 L80,22 L20,22 L26,76 L-6,32 L-50,70 L-32,16 L-80,0 L-32,-16 L-58,-58 L-10,-32 Z" fill="#FFFFFF" />
	</g>
);
