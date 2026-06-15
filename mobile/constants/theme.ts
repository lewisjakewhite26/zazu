export const colors = {
  peach: '#f9c9a8',
  blush: '#f0a0bc',
  lavender: '#c8b4e8',
  dawn: '#fde8d8',
  dusk: '#ede0f8',
  ink: '#2c1f2e',
  muted: '#9080a0',
  gold: '#c9963a',
  white: '#fefcfb',
  bgFrom: '#fde8d8',
  bgMid: '#dde8f8',
  bgTo: '#ede0f8',
  text: '#2c1f2e',
  subtext: '#9080a0',
  border: 'rgba(44,31,46,0.1)',
  card: 'rgba(255,255,255,0.72)',
} as const;

export const fonts = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  serif: 'DMSerifDisplay_400Regular',
} as const;

export type ThemeColors = typeof colors;
