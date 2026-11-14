import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const listeners = {};
const played = [];
const stored = new Map();
const toggle = { setAttribute() {}, hidden: true };
let now = 0;
class AudioContext {
  state = 'running';
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({}); }
  createBufferSource() { return { connect: node => node, start: (...args) => played.push(args) }; }
  createGain() { return { gain: {}, connect() {} }; }
}
const document = {
  hidden: false,
  querySelector: () => toggle,
  addEventListener: (name, callback) => { listeners[name] = callback; },
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
listeners.pointerdown();
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
console.log('Sound playback, mute, persistence, toggle, and hidden-tab checks passed.');
