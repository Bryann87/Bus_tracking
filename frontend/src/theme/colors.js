export const COLORS = {
  // Marca — teal profundo, distintivo y serio
  primary: '#0B5566',
  primaryDark: '#073C48',
  primaryLight: '#E4F1F2',

  // Acento — coral cálido, contraste vivo sin ser estridente
  accent: '#FF6B4A',
  accentDark: '#E4502F',

  // Semánticos
  success: '#1D9A6C',
  successBg: '#E5F7EF',
  danger: '#E1493F',
  dangerBg: '#FDEAE8',
  warning: '#F2A93C',
  warningBg: '#FEF6E7',

  // Base
  background: '#F5F8F8',
  surface: '#FFFFFF',
  border: '#DEE7E8',

  // Texto
  ink: '#0D2224',
  text: '#1E3234',
  muted: '#5E7477',
  faint: '#94A6A8',
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
    shadowColor: '#04191B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#04191B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
};