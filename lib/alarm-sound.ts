// @ts-nocheck
import { Platform, Vibration } from 'react-native';
import { createAudioPlayer, preload, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/** Pulses while the alarm rings; loops from the start of the pattern until Vibration.cancel(). */
const ALARM_VIBRATION_PATTERN = [0, 800, 400, 800];

export type AlarmSoundId = 'chime' | 'susurrus' | 'mellifluous' | 'penumbra' | 'ephemeral';

export type AlarmSoundOption = {
  id: AlarmSoundId;
  label: string;
  file: number;
};

/** Every selectable alarm sound. Labels borrow real Zazu word-bank vocabulary — see writing-rules.md. */
export const ALARM_SOUNDS: AlarmSoundOption[] = [
  { id: 'chime', label: 'Chime', file: require('../mobile/assets/sounds/alarm-chime.wav') },
  { id: 'susurrus', label: 'Susurrus', file: require('../mobile/assets/sounds/susurrus.wav') },
  { id: 'mellifluous', label: 'Mellifluous', file: require('../mobile/assets/sounds/mellifluous.wav') },
  { id: 'penumbra', label: 'Penumbra', file: require('../mobile/assets/sounds/penumbra.wav') },
  { id: 'ephemeral', label: 'Ephemeral', file: require('../mobile/assets/sounds/ephemeral.wav') },
];

export const DEFAULT_ALARM_SOUND_ID: AlarmSoundId = 'chime';

export function isAlarmSoundId(value: unknown): value is AlarmSoundId {
  return typeof value === 'string' && ALARM_SOUNDS.some((sound) => sound.id === value);
}

function getAlarmSoundFile(soundId: string): number {
  return ALARM_SOUNDS.find((sound) => sound.id === soundId)?.file ?? ALARM_SOUNDS[0].file;
}

let webInterval: ReturnType<typeof setInterval> | null = null;
let webAudioContext: AudioContext | null = null;
let webGain: GainNode | null = null;
let activeSoundId: AlarmSoundId = DEFAULT_ALARM_SOUND_ID;

/** Decoded sounds, keyed by id, kept loaded for the app session so repeat alarms never re-pay the decode cost. */
const loadedSounds = new Map<string, AudioPlayer>();

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

/** Loads a sound into memory once and reuses it; safe to call repeatedly. */
async function ensureSoundLoaded(soundId: AlarmSoundId): Promise<AudioPlayer | null> {
  const cached = loadedSounds.get(soundId);
  if (cached) return cached;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });

    const source = getAlarmSoundFile(soundId);
    // Waits for the file to actually finish decoding — createAudioPlayer()
    // alone returns before that, so playback started immediately after it
    // would run off the end of the not-yet-buffered audio within ~1s.
    await preload(source);

    const player = createAudioPlayer(source);
    player.volume = 0.7;
    loadedSounds.set(soundId, player);
    return player;
  } catch (error) {
    console.warn('[Zazu] Alarm sound load failed:', error);
    return null;
  }
}

/**
 * Decodes and primes a chime ahead of time so the first real play — the
 * highest-stakes, most time-sensitive sound in the app — has no audio-session
 * or file-decode latency. Call early (app boot / once an alarm's sound is
 * known), not from the alarm screen itself.
 */
export async function preloadAlarmSound(soundId: AlarmSoundId = DEFAULT_ALARM_SOUND_ID): Promise<void> {
  if (Platform.OS === 'web') return;
  await ensureSoundLoaded(soundId);
}

async function playNativeChime(soundId: AlarmSoundId) {
  if (Platform.OS === 'web') return;

  const sound = await ensureSoundLoaded(soundId);
  if (!sound) return;

  try {
    sound.loop = true;
    await sound.seekTo(0);
    sound.play();
  } catch (error) {
    console.warn('[Zazu] Alarm sound playback failed:', error);
  }
}

export async function startAlarmSound(soundId: AlarmSoundId = DEFAULT_ALARM_SOUND_ID): Promise<void> {
  activeSoundId = soundId;

  if (Platform.OS !== 'web') {
    // `true` repeats the pattern from the start for as long as the alarm rings.
    Vibration.vibrate(ALARM_VIBRATION_PATTERN, true);
  }

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

  await playNativeChime(soundId);
}

export async function stopAlarmSound(): Promise<void> {
  // Explicit stop, whether the user dismissed, snoozed, or backed out of the
  // demo — a stray repeating vibration is a lot worse than a stray chime.
  Vibration.cancel();

  if (webInterval) {
    clearInterval(webInterval);
    webInterval = null;
  }

  if (webGain && webAudioContext) {
    webGain.gain.linearRampToValueAtTime(0, webAudioContext.currentTime + 0.4);
    webGain = null;
  }

  // Stop, but keep decoded and cached for the next alarm — unloading here
  // would silently undo the whole point of preloading/reusing sounds.
  const sound = loadedSounds.get(activeSoundId);
  if (sound) {
    try {
      sound.loop = false;
      sound.pause();
      await sound.seekTo(0);
    } catch {
      // ignore cleanup errors
    }
  }
}

/** One-off preview playback for the Add Alarm sound picker. */
export async function previewAlarmSound(soundId: AlarmSoundId): Promise<void> {
  const sound = await ensureSoundLoaded(soundId);
  if (!sound) return;

  try {
    sound.loop = false;
    sound.pause();
    await sound.seekTo(0);
    sound.play();
  } catch (error) {
    console.warn('[Zazu] Alarm sound preview failed:', error);
  }
}

export async function stopAlarmSoundPreview(soundId: AlarmSoundId): Promise<void> {
  const sound = loadedSounds.get(soundId);
  if (!sound) return;
  try {
    sound.pause();
    await sound.seekTo(0);
  } catch {
    // ignore cleanup errors
  }
}
