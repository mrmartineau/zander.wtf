import { createSignal } from 'solid-js';

// All sounds are synthesised — no audio files to ship. Off by default;
// browsers block audio until the user interacts anyway.
const KEY = 'desktop:sound';

const [soundOn, setSoundOn] = createSignal(
  typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1',
);

export { soundOn };

export function setSound(on: boolean) {
  setSoundOn(on);
  localStorage.setItem(KEY, on ? '1' : '0');
  if (on) play('open');
}

let ctx: AudioContext | undefined;

function tone(
  freq: number,
  ms: number,
  type: OscillatorType = 'square',
  gain = 0.04,
  delay = 0,
) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + ms / 1000);
}

export type Sound = 'open' | 'close' | 'zoom' | 'scroll' | 'tick';

export function play(name: Sound) {
  if (!soundOn()) return;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  switch (name) {
    case 'open':
      tone(523, 60);
      tone(784, 90, 'square', 0.04, 0.05);
      break;
    case 'close':
      tone(660, 60);
      tone(392, 100, 'square', 0.04, 0.05);
      break;
    case 'zoom':
      tone(440, 40, 'triangle', 0.05);
      tone(880, 60, 'triangle', 0.05, 0.04);
      break;
    case 'scroll':
      // The Mac OS 9 scroll "tick": short, quiet, dry.
      tone(1400, 12, 'square', 0.015);
      break;
    case 'tick':
      tone(1000, 15, 'sine', 0.03);
      break;
  }
}
