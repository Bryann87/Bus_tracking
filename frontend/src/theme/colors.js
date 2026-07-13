// src/theme/colors.js
//
// Sistema de diseño único de la app — importar SIEMPRE desde aquí,
// nunca hardcodear hex codes sueltos en las pantallas (eso fue lo que
// causó que Login y Registro tuvieran dos azules distintos).

export const COLORS = {
  // Marca — azul transporte, más profundo y saturado que un azul Material genérico
  primary: '#1C4E9E',
  primaryDark: '#12315F',
  primaryLight: '#E8F0FC',

  // Acento — ámbar "línea de ruta", inspirado en la señalética de paradas de bus
  accent: '#F2A93C',
  accentDark: '#C7841E',

  // Semánticos
  success: '#1F9D55',
  successBg: '#E7F7ED',
  danger: '#E5484D',
  dangerBg: '#FDECEC',
  warning: '#F2A93C',
  warningBg: '#FEF6E7',

  // Base
  background: '#F5F7FB',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  // Texto
  ink: '#101B33',
  text: '#1E293B',
  muted: '#64748B',
  faint: '#94A3B8',
};

export const TYPE = {
  display: { fontSize: 28, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.3 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.ink },
  subtitle: { fontSize: 15, color: COLORS.muted },
  body: { fontSize: 15, color: COLORS.text },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const SHADOW = {
  sm: {
    shadowColor: '#0B1B3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B1B3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
};