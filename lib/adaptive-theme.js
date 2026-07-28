/**
 * Browser helper for zazu.html gradual theme (see adaptive-theme.ts).
 */
(function (global) {
  const THEME_LIGHT = {
    bgFrom: '#fde8d8',
    bgMid: '#dde8f8',
    bgTo: '#ede0f8',
    text: '#2c1f2e',
    subtext: '#9080a0',
    ink: '#2c1f2e',
    border: 'rgba(44,31,46,0.1)',
    card: 'rgba(255,255,255,0.72)',
  };

  const THEME_DARK = {
    bgFrom: '#1a1225',
    bgMid: '#1a1830',
    bgTo: '#0e0c1a',
    text: '#f0e8f8',
    subtext: '#b0a0c8',
    ink: '#f0e8f8',
    border: 'rgba(255,255,255,0.13)',
    card: 'rgba(255,255,255,0.11)',
  };

  function getThemeBlend(date) {
    const d = date || new Date();
    const minutes = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

    if (minutes >= 330 && minutes < 360) return 1 - (minutes - 330) / 30;
    if (minutes >= 360 && minutes < 1230) return 0;
    if (minutes >= 1230 && minutes < 1260) return (minutes - 1230) / 30;
    return 1;
  }

  function parseHex(hex) {
    const value = hex.replace('#', '');
    if (value.length !== 6) return null;
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  function parseRgba(input) {
    const match = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(
      input,
    );
    if (!match) return null;
    return [
      parseFloat(match[1]),
      parseFloat(match[2]),
      parseFloat(match[3]),
      match[4] != null ? parseFloat(match[4]) : 1,
    ];
  }

  function lerpChannel(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function lerpColor(from, to, t) {
    const clamped = Math.min(1, Math.max(0, t));
    const fromRgba = parseRgba(from);
    const toRgba = parseRgba(to);
    if (fromRgba && toRgba) {
      const alpha = (fromRgba[3] + (toRgba[3] - fromRgba[3]) * clamped).toFixed(2);
      return `rgba(${lerpChannel(fromRgba[0], toRgba[0], clamped)}, ${lerpChannel(fromRgba[1], toRgba[1], clamped)}, ${lerpChannel(fromRgba[2], toRgba[2], clamped)}, ${alpha})`;
    }
    const fromHex = parseHex(from);
    const toHex = parseHex(to);
    if (!fromHex || !toHex) return clamped >= 0.5 ? to : from;
    const r = lerpChannel(fromHex[0], toHex[0], clamped);
    const g = lerpChannel(fromHex[1], toHex[1], clamped);
    const b = lerpChannel(fromHex[2], toHex[2], clamped);
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  }

  function blendPalette(blend) {
    return {
      bgFrom: lerpColor(THEME_LIGHT.bgFrom, THEME_DARK.bgFrom, blend),
      bgMid: lerpColor(THEME_LIGHT.bgMid, THEME_DARK.bgMid, blend),
      bgTo: lerpColor(THEME_LIGHT.bgTo, THEME_DARK.bgTo, blend),
      text: lerpColor(THEME_LIGHT.text, THEME_DARK.text, blend),
      subtext: lerpColor(THEME_LIGHT.subtext, THEME_DARK.subtext, blend),
      ink: lerpColor(THEME_LIGHT.ink, THEME_DARK.ink, blend),
      border: lerpColor(THEME_LIGHT.border, THEME_DARK.border, blend),
      card: lerpColor(THEME_LIGHT.card, THEME_DARK.card, blend),
    };
  }

  function applyCssVars(root, palette) {
    root.style.setProperty('--bg-from', palette.bgFrom);
    root.style.setProperty('--bg-mid', palette.bgMid);
    root.style.setProperty('--bg-to', palette.bgTo);
    root.style.setProperty('--text', palette.text);
    root.style.setProperty('--subtext', palette.subtext);
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--card', palette.card);
    root.style.setProperty('--theme-blend', String(getThemeBlend()));
  }

  global.ZazuAdaptiveTheme = {
    getThemeBlend,
    blendPalette,
    applyCssVars,
    THEME_LIGHT,
    THEME_DARK,
  };
})(typeof window !== 'undefined' ? window : globalThis);
