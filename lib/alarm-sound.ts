// @ts-nocheck
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

let webInterval: ReturnType<typeof setInterval> | null = null;
let webAudioContext: AudioContext | null = null;
let webGain: GainNode | null = null;
let nativeSound: Audio.Sound | null = null;
let nativeInterval: ReturnType<typeof setInterval> | null = null;

function getWebAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!webAudioContext) webAudioContext = new Ctx();
  return webAudioContext;
}

function playWebChime() {
  const context = getWebAudioContext();
  if (!context || !webGain) return;

  [[440, 0], [660, 0.3], [440, 1.2], [660, 1.5]].forEach(([freq, delay]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(webGain);
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    const start = context.currentTime + delay;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.5, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1);
    oscillator.start(start);
    oscillator.stop(start + 1.1);
  });
}

/** Loads the chime into memory once and reuses it; safe to call repeatedly. */
async function ensureNativeSoundLoaded(): Promise<Audio.Sound | null> {
  if (nativeSound) return nativeSound;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      require('../mobile/assets/sounds/alarm-chime.wav'),
      { shouldPlay: false, volume: 0.7 },
    );
    nativeSound = sound;
    return nativeSound;
  } catch (error) {
    console.warn('[Zazu] Alarm chime load failed:', error);
    return null;
  }
}

/**
 * Decodes and primes the chime ahead of time so the first real play — the
 * highest-stakes, most time-sensitive sound in the app — has no audio-session
 * or file-decode latency. Call once, early (app boot), not from the alarm
 * screen itself.
 */
export async function preloadAlarmSound(): Promise<void> {
  if (Platform.OS === 'web') return;
  await ensureNativeSoundLoaded();
}

async function playNativeChime() {
  if (Platform.OS === 'web') return;

  const sound = await ensureNativeSoundLoaded();
  if (!sound) return;

  try {
    await sound.replayAsync();
  } catch (error) {
    console.warn('[Zazu] Alarm chime playback failed:', error);
  }
}

export async function startAlarmSound(): Promise<void> {
  if (Platform.OS === 'web') {
    const context = getWebAudioContext();
    if (!context) return;

    webGain = context.createGain();
    webGain.connect(context.destination);
    webGain.gain.setValueAtTime(0, context.currentTime);
    webGain.gain.linearRampToValueAtTime(0.18, context.currentTime + 8);

    playWebChime();
    webInterval = setInterval(playWebChime, 3000);
    return;
  }

  await playNativeChime();
  nativeInterval = setInterval(() => {
    void playNativeChime();
  }, 3000);
}

export async function stopAlarmSound(): Promise<void> {
  if (webInterval) {
    clearInterval(webInterval);
    webInterval = null;
  }

  if (webGain && webAudioContext) {
    webGain.gain.linearRampToValueAtTime(0, webAudioContext.currentTime + 0.4);
    webGain = null;
  }

  if (nativeInterval) {
    clearInterval(nativeInterval);
    nativeInterval = null;
  }

  if (nativeSound) {
    try {
      await nativeSound.stopAsync();
      await nativeSound.unloadAsync();
    } catch {
      // ignore cleanup errors
    }
    nativeSound = null;
  }
}
