import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const listeners = {};
const played = [];
const gains = [];
const stored = new Map();
const toggle = { setAttribute() {}, hidden: true };
let now = 0;
class AudioContext {
  state = 'suspended';
  currentTime = 0;
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({}); }
  createBufferSource() { return { connect: node => node, start: (...args) => played.push(args) }; }
  createOscillator() {
    return { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: node => node, start: () => played.push(['hover']), stop() {} };
  }
  createGain() {
    const node = { gain: { setValueAtTime() {}, linearRampToValueAtTime(value) { this.peak = value; }, exponentialRampToValueAtTime() {} }, connect() {} };
    gains.push(node.gain);
    return node;
  }
}
const document = {
  hidden: false,
  querySelector: () => toggle,
  addEventListener: (name, callback) => {
    const previous = listeners[name];
    listeners[name] = event => { previous?.(event); callback(event); };
  },
};
runInNewContext(readFileSync(new URL('../sounds.js', import.meta.url), 'utf8'), {
  window: { AudioContext }, document, performance: { now: () => now },
  localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
  fetch: async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }),
});
const click = control => {
  now += 100;
  listeners.click({ target: { closest: () => control } });
};
const link = { hasAttribute: () => false, matches: () => true };
assert.equal(toggle.textContent, 'Sound on');
listeners.pointerdown({ target: { closest: () => null } });
await new Promise(resolve => setImmediate(resolve));
click(link);
assert.deepEqual(played[0], [0, 0, .12]);
click(toggle);
assert.equal(stored.get('portfolio-sound'), 'off');
click(link);
assert.equal(played.length, 1);
click(toggle);
await new Promise(resolve => setImmediate(resolve));
assert.equal(played[1][1], 42);
document.hidden = true;
click(link);
assert.equal(played.length, 2);
assert.equal(toggle.hidden, false);
document.hidden = false;
const child = {};
const card = { contains: node => node === child };
const hover = (overrides = {}) => listeners.pointerover({
  pointerType: 'mouse', buttons: 0, target: { closest: () => card }, relatedTarget: null, ...overrides,
});
now += 200;
hover();
assert.equal(played.length, 3);
assert.equal(gains.at(-1).peak, .045);
hover();
assert.equal(played.length, 3, 'Rapid card entries are throttled');
now += 200;
hover({ relatedTarget: child });
hover({ pointerType: 'touch' });
hover({ buttons: 1 });
assert.equal(played.length, 3, 'Child movement, touch, and dragging stay silent');
click(toggle);
now += 200;
hover();
assert.equal(played.length, 3, 'Muted hover stays silent');
stored.clear();
for (const name of Object.keys(listeners)) delete listeners[name];
runInNewContext(readFileSync(new URL('../sounds.js', import.meta.url), 'utf8'), {
  window: { AudioContext }, document, performance: { now: () => now },
  localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
  fetch: () => new Promise(() => {}),
});
assert.equal(toggle.textContent, 'Sound on');
listeners.pointerdown({ target: { closest: () => toggle } });
click(toggle);
assert.equal(toggle.textContent, 'Sound off', 'The toggle only controls the sound preference');
click(toggle);
assert.equal(toggle.textContent, 'Sound on');
listeners.pointerup({ target: { closest: () => null } });
now += 200;
hover();
assert.equal(played.length, 4, 'Hover works even when the external sound kit never loads');
assert.deepEqual(played.at(-1), ['hover']);
stored.clear();
for (const name of Object.keys(listeners)) delete listeners[name];
runInNewContext(readFileSync(new URL('../sounds.js', import.meta.url), 'utf8'), {
  window: { AudioContext }, document, performance: { now: () => now },
  localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
  fetch: () => new Promise(() => {}),
});
listeners.pointerup({ target: { closest: () => null } });
now += 200;
hover();
assert.equal(played.length, 5, 'An ordinary tap unlocks hover without using the sound toggle');
console.log('Sound playback, mute, persistence, toggle, and hidden-tab checks passed.');
console.log('Quiet card hover, throttling, child movement, touch, drag, and mute checks passed.');
