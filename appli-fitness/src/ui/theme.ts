export const couleurs = {
  fond: '#0E1116',
  surface: '#171B22',
  surfaceHaute: '#1F242D',
  bordure: '#2A313C',
  texte: '#F2F5F9',
  texteAttenue: '#9AA5B4',
  accent: '#4ADE80',
  accentSombre: '#166534',
  alerte: '#F87171',
  attention: '#FBBF24',
  or: '#FACC15',
  argent: '#CBD5E1',
  bronze: '#D29A6A',
} as const;

export const espace = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const rayon = {
  s: 8,
  m: 12,
  l: 18,
  rond: 999,
} as const;

export const typo = {
  titre: { fontSize: 26, fontWeight: '700' },
  sousTitre: { fontSize: 18, fontWeight: '600' },
  corps: { fontSize: 15, fontWeight: '400' },
  petit: { fontSize: 13, fontWeight: '400' },
  chiffre: { fontSize: 40, fontWeight: '700' },
} as const;
