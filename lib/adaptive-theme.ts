/**
 * Gradual light ↔ dark theme over 30 minutes at dusk and dawn.
 * Dusk: 20:30–21:00 · Dawn: 5:30–6:00 · Full dark: 21:00–5:30
 *
 * Matches index.html: eight CSS variables lerp during dawn/dusk;
 * body.night rules snap at blend >= 0.5.
 */

import { colorsDark, colorsLight } from '../mobile/constants/theme';

export type BlendablePalette = {
  bgFrom: string;
  bgMid: string;
  bgTo: string;
  text: string;
  subtext: string;
  ink: string;
  border: string;
  card: string;
};

export type NightSnapPalette = {
  wotdGradientStart: string;
  wotdGradientEnd: string;
  posBadgeBg: string;
  primaryButtonBg: string;
  primaryButtonText: string;
};

export type ThemePalette = BlendablePalette & NightSnapPalette;

const LIGHT_BLEND: BlendablePalette = {
  bgFrom: colorsLight.bgFrom,
  bgMid: colorsLight.bgMid,
  bgTo: colorsLight.bgTo,
  text: colorsLight.text,
  subtext: colorsLight.subtext,
  ink: colorsLight.ink,
  border: colorsLight.border,
  card: colorsLight.card,
};

const DARK_BLEND: BlendablePalette = {
  bgFrom: colorsDark.bgFrom,
  bgMid: colorsDark.bgMid,
  bgTo: colorsDark.bgTo,
  text: colorsDark.text,
  subtext: colorsDark.subtext,
  ink: colorsDark.ink,
  border: colorsDark.border,
  card: colorsDark.card,
};

const LIGHT_SNAP: NightSnapPalette = {
  wotdGradientStart: 'rgba(249,201,168,0.35)',
  wotdGradientEnd: 'rgba(200,180,232,0.35)',
  posBadgeBg: 'rgba(44,31,46,0.07)',
  primaryButtonBg: colorsLight.ink,
  primaryButtonText: colorsLight.white,
};

const DARK_SNAP: NightSnapPalette = {
  wotdGradientStart: 'rgba(249,201,168,0.08)',
  wotdGradientEnd: 'rgba(200,180,232,0.08)',
  posBadgeBg: 'rgba(255,255,255,0.08)',
  primaryButtonBg: 'rgba(255,255,255,0.12)',
  primaryButtonText: colorsDark.text,
};

export const THEME_LIGHT: ThemePalette = { ...LIGHT_BLEND, ...LIGHT_SNAP };
export const THEME_DARK: ThemePalette = { ...DARK_BLEND, ...DARK_SNAP };

/** 0 = full light, 1 = full dark */
export function getThemeBlend(date: Date = new Date()): number {
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  if (minutes >= 330 && minutes < 360) {
    return 1 - (minutes - 330) / 30;
  }

  if (minutes >= 360 && minutes < 1230) {
    return 0;
  }

  if (minutes >= 1230 && minutes < 1260) {
    return (minutes - 1230) / 30;
  }

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

/** Lerp only the eight CSS variables from index.html (:root). */
export function blendThemePalette(
  blend: number,
  light: BlendablePalette = LIGHT_BLEND,
  dark: BlendablePalette = DARK_BLEND,
): BlendablePalette {
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

function snapPalette(isNight: boolean): NightSnapPalette {
  return isNight ? DARK_SNAP : LIGHT_SNAP;
}

export function resolveThemePalette(
  date: Date = new Date(),
  override: 'light' | 'dark' | null = null,
): ThemePalette {
  let blend: number;
  if (override === 'light') blend = 0;
  else if (override === 'dark') blend = 1;
  else blend = getThemeBlend(date);

  return { ...blendThemePalette(blend), ...snapPalette(blend >= 0.5) };
}
