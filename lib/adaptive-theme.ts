/**
 * Gradual light ↔ dark theme over 30 minutes at dusk and dawn.
 * Dusk: 20:30–21:00 · Dawn: 5:30–6:00 · Full dark: 21:00–5:30
 */

export type ThemePalette = {
  bgFrom: string;
  bgMid: string;
  bgTo: string;
  text: string;
  subtext: string;
  ink: string;
  border: string;
  card: string;
};

export const THEME_LIGHT: ThemePalette = {
  bgFrom: '#fde8d8',
  bgMid: '#dde8f8',
  bgTo: '#ede0f8',
  text: '#2c1f2e',
  subtext: '#9080a0',
  ink: '#2c1f2e',
  border: 'rgba(44,31,46,0.1)',
  card: 'rgba(255,255,255,0.72)',
};

export const THEME_DARK: ThemePalette = {
  bgFrom: '#1a1225',
  bgMid: '#1a1830',
  bgTo: '#0e0c1a',
  text: '#f0e8f8',
  subtext: '#b0a0c8',
  ink: '#f0e8f8',
  border: 'rgba(255,255,255,0.13)',
  card: 'rgba(255,255,255,0.11)',
};

/** 0 = full light, 1 = full dark */
export function getThemeBlend(date: Date = new Date()): number {
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  // Dawn 5:30–6:00: dark → light
  if (minutes >= 330 && minutes < 360) {
    return 1 - (minutes - 330) / 30;
  }

  // Day 6:00–20:30
  if (minutes >= 360 && minutes < 1230) {
    return 0;
  }

  // Dusk 20:30–21:00: light → dark
  if (minutes >= 1230 && minutes < 1260) {
    return (minutes - 1230) / 30;
  }

  // Night 21:00–5:30
  return 1;
}

function parseHex(hex: string): [number, number, number] | null {
  const value = hex.replace('#', '');
  if (value.length !== 6) return null;
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function parseRgba(input: string): [number, number, number, number] | null {
  const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(
    input,
  );
  if (!match) return null;
  return [
    Number.parseFloat(match[1]),
    Number.parseFloat(match[2]),
    Number.parseFloat(match[3]),
    match[4] != null ? Number.parseFloat(match[4]) : 1,
  ];
}

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function lerpColor(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const fromRgba = parseRgba(from);
  const toRgba = parseRgba(to);
  if (fromRgba && toRgba) {
    return `rgba(${lerpChannel(fromRgba[0], toRgba[0], clamped)}, ${lerpChannel(fromRgba[1], toRgba[1], clamped)}, ${lerpChannel(fromRgba[2], toRgba[2], clamped)}, ${(fromRgba[3] + (toRgba[3] - fromRgba[3]) * clamped).toFixed(2)})`;
  }

  const fromHex = parseHex(from);
  const toHex = parseHex(to);
  if (!fromHex || !toHex) return clamped >= 0.5 ? to : from;

  const [r, g, b] = fromHex.map((channel, index) =>
    lerpChannel(channel, toHex[index], clamped),
  );
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function blendThemePalette(
  blend: number,
  light: ThemePalette = THEME_LIGHT,
  dark: ThemePalette = THEME_DARK,
): ThemePalette {
  return {
    bgFrom: lerpColor(light.bgFrom, dark.bgFrom, blend),
    bgMid: lerpColor(light.bgMid, dark.bgMid, blend),
    bgTo: lerpColor(light.bgTo, dark.bgTo, blend),
    text: lerpColor(light.text, dark.text, blend),
    subtext: lerpColor(light.subtext, dark.subtext, blend),
    ink: lerpColor(light.ink, dark.ink, blend),
    border: lerpColor(light.border, dark.border, blend),
    card: lerpColor(light.card, dark.card, blend),
  };
}

export function resolveThemePalette(
  date: Date = new Date(),
  override: 'light' | 'dark' | null = null,
): ThemePalette {
  if (override === 'light') return { ...THEME_LIGHT };
  if (override === 'dark') return { ...THEME_DARK };
  return blendThemePalette(getThemeBlend(date));
}
