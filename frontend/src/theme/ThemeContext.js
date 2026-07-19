import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LIGHT = {
  primary: '#121417',      // negro casi puro — marca, botones, header
  onPrimary: '#FFFFFF',
  primaryDark: '#000000',
  primaryLight: '#ECECED',

  accent: '#F5A623',        // ámbar — el único color vivo, para resaltar
  onAccent: '#1A1200',

  success: '#1D9A6C', successBg: '#E4F7EE',
  danger: '#E1493F', dangerBg: '#FCEAE8',
  warning: '#F5A623', warningBg: '#FEF3E0',

  background: '#F6F6F7',
  surface: '#FFFFFF',
  border: '#E3E4E6',

  ink: '#121417',
  text: '#22262A',
  muted: '#6B7075',
  faint: '#9CA1A6',
};

const DARK = {
  primary: '#F5F6F7',       // se invierte: el "negro de marca" pasa a blanco sobre fondo oscuro
  onPrimary: '#101315',
  primaryDark: '#FFFFFF',
  primaryLight: '#22262A',

  accent: '#F5A623',         // el ámbar se mantiene igual en ambos modos (identidad constante)
  onAccent: '#1A1200',

  success: '#34C285', successBg: '#123527',
  danger: '#F16158', dangerBg: '#3A1613',
  warning: '#F5A623', warningBg: '#3A2A0D',

  background: '#0B0C0E',
  surface: '#17191C',
  border: '#2A2D31',

  ink: '#F5F6F7',
  text: '#E4E6E8',
  muted: '#9AA0A6',
  faint: '#6B7075',
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((saved) => {
      setIsDark(saved ? saved === 'dark' : Appearance.getColorScheme() === 'dark');
      setReady(true);
    });
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('theme_mode', next ? 'dark' : 'light');
      return next;
    });
  }

  const colors = isDark ? DARK : LIGHT;

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    colors,
    radius: RADIUS,
    shadow: {
      sm: {
        shadowColor: isDark ? '#000000' : '#04191B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
      md: {
        shadowColor: isDark ? '#000000' : '#04191B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.5 : 0.14,
        shadowRadius: 16,
        elevation: 6,
      },
    },
    type: {
      display: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
      title: { fontSize: 20, fontWeight: '700', color: colors.ink },
      subtitle: { fontSize: 15, color: colors.muted },
      body: { fontSize: 15, color: colors.text },
      label: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
    },
  }), [isDark, colors]);

  if (!ready) return null; // evita el parpadeo del tema equivocado al abrir la app

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}