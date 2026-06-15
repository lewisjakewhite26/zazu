/**
 * Writes a short dual-tone chime WAV for the alarm screen.
 * Usage: node scripts/generate-alarm-chime.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../mobile/assets/sounds');
const outPath = resolve(outDir, 'alarm-chime.wav');

const sampleRate = 22050;
const duration = 0.55;
const numSamples = Math.floor(sampleRate * duration);
const dataSize = numSamples * 2;
const buffer = Buffer.alloc(44 + dataSize);

function writeString(offset, value) {
  buffer.write(value, offset, value.length, 'ascii');
}

writeString(0, 'RIFF');
buffer.writeUInt32LE(36 + dataSize, 4);
writeString(8, 'WAVE');
writeString(12, 'fmt ');
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
writeString(36, 'data');
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i += 1) {
  const t = i / sampleRate;
  const envelope = Math.min(1, t * 20) * Math.max(0, 1 - (t - 0.1) * 3);
  const sample =
    envelope *
    (Math.sin(2 * Math.PI * 440 * t) * 0.55 + Math.sin(2 * Math.PI * 660 * t) * 0.35);
  const clamped = Math.max(-1, Math.min(1, sample));
  buffer.writeInt16LE(Math.floor(clamped * 32767 * 0.35), 44 + i * 2);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath}`);
