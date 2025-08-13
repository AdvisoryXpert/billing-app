import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#0EA5E9',
    background: '#F7F8FA',
    surface: '#FFFFFF',
  },
  roundness: 10,
} as const;
