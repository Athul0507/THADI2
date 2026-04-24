import { darkColors, lightColors } from './colors';
import { fonts, fontSizes } from './typography';

export type ThemeMode = 'light' | 'dark';

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const createTheme = (mode: ThemeMode) => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    mode,
    colors,
    spacing,
    radius,
    fonts,
    fontSizes,
  };
};

export type Theme = ReturnType<typeof createTheme>;
