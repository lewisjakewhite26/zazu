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

async function playNativeChime() {
  if (Platform.OS === 'web') return;

  try {
    if (nativeSound) {
      await nativeSound.replayAsync();
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      require('../mobile/assets/sounds/alarm-chime.wav'),
      { shouldPlay: true, volume: 0.7 },
    );
    nativeSound = sound;
  } catch (error) {
    console.warn('[Zazu] Alarm chime failed:', error);
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
