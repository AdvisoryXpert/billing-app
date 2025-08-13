import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
  type MD3Theme,
} from 'react-native-paper';
import { Platform } from 'react-native';

const palette = {
  primary: '#2563EB',           // Indigo-600
  onPrimary: '#FFFFFF',
  primaryContainer: '#DCE8FF',
  onPrimaryContainer: '#0B2B73',

  secondary: '#0EA5E9',         // Sky-500
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D7F5FF',
  onSecondaryContainer: '#073042',

  tertiary: '#8B5CF6',          // Violet-500
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E9E1FF',
  onTertiaryContainer: '#2C1A64',

  background: '#F7F8FA',
  onBackground: '#0F172A',      // slate-900

  surface: '#FFFFFF',
  onSurface: '#0F172A',
  surfaceVariant: '#EEF2F7',
  onSurfaceVariant: '#475569',
  outline: '#CBD5E1',

  error: '#EF4444',
  onError: '#FFFFFF',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const webShadow =
  Platform.select({
    web: { boxShadow: '0 10px 30px rgba(2,6,23,0.08)' } as any,
    default: { elevation: 3 },
  }) || {};

const fonts = configureFonts({
  config: {
    // Dial these to your installed fonts if needed (Inter/SF/etc.)
    displayLarge:   { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '800', fontSize: 44, lineHeight: 52, letterSpacing: 0 },
    displayMedium:  { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '800', fontSize: 36, lineHeight: 44, letterSpacing: 0 },
    headlineLarge:  { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700', fontSize: 28, lineHeight: 34 },
    headlineMedium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700', fontSize: 22, lineHeight: 28 },
    titleLarge:     { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700', fontSize: 18, lineHeight: 24 },
    titleMedium:    { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '600', fontSize: 16, lineHeight: 22 },
    bodyLarge:      { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '500', fontSize: 16, lineHeight: 22 },
    bodyMedium:     { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '500', fontSize: 14, lineHeight: 20 },
    labelLarge:     { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700', fontSize: 14, lineHeight: 18 },
  },
});

const lightColors: MD3Theme['colors'] = {
  ...MD3LightTheme.colors,
  ...palette,
  // tasty MD3 elevation tints
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#FAFBFF',
    level3: '#F7F9FF',
    level4: '#F4F7FF',
    level5: '#F1F5FF',
  },
};

const darkColors: MD3Theme['colors'] = {
  ...MD3DarkTheme.colors,
  primary: '#93C5FD',
  onPrimary: '#0B2B73',
  primaryContainer: '#1E293B',
  onPrimaryContainer: '#DCE8FF',

  secondary: '#7DD3FC',
  onSecondary: '#052231',
  secondaryContainer: '#0B2B3A',
  onSecondaryContainer: '#D7F5FF',

  tertiary: '#C4B5FD',
  onTertiary: '#20114E',
  tertiaryContainer: '#1F153E',
  onTertiaryContainer: '#E9E1FF',

  background: '#0B1220',
  onBackground: '#E5E7EB',
  surface: '#0F172A',
  onSurface: '#E5E7EB',
  surfaceVariant: '#111827',
  onSurfaceVariant: '#CBD5E1',
  outline: '#334155',

  error: '#F87171',
  onError: '#140404',
  success: '#22C55E',
  warning: '#FBBF24',
  info: '#60A5FA',

  elevation: {
    level0: 'transparent',
    level1: '#0F172A',
    level2: '#111b31',
    level3: '#12203a',
    level4: '#132442',
    level5: '#15294b',
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  mode: 'exact',
  roundness: 12,
  fonts,
  colors: lightColors,
  // extras you can use in your own components
  custom: {
    spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
    radii: { sm: 10, md: 14, lg: 20, xl: 28 },
    shadow: webShadow,
    gradient: {
      brand: ['#2563EB', '#0EA5E9'] as const,
      subtle: ['#FFFFFF', '#F7F8FA'] as const,
    },
  },
} as const;

export const darkTheme = {
  ...MD3DarkTheme,
  mode: 'exact',
  roundness: 12,
  fonts,
  colors: darkColors,
  custom: {
    spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
    radii: { sm: 10, md: 14, lg: 20, xl: 28 },
    shadow: webShadow,
    gradient: {
      brand: ['#60A5FA', '#7DD3FC'] as const,
      subtle: ['#0F172A', '#0B1220'] as const,
    },
  },
} as const;

export type AppTheme = typeof lightTheme;
