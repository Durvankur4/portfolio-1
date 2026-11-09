import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const animation = { currentTime: 0, effect: { getTiming: () => ({ duration: 54000 }) } };
const element = () => ({
  children: [], listeners: {}, attributes: {}, classList: {
    values: new Set(),
    add(value) { this.values.add(value); },
    remove(value) { this.values.delete(value); },
    contains(value) { return this.values.has(value); },
    toggle(value) { if (this.values.has(value)) { this.values.delete(value); return false; } this.values.add(value); return true; }
  },
  append(child) {
    child.offsetLeft = this.children.length * 380;
    if (this.children.length) this.children.at(-1).nextElementSibling = child;
    this.children.push(child);
  },
  addEventListener(name, callback) { this.listeners[name] = callback; },
  querySelectorAll: () => [], cloneNode: () => element(), setAttribute(key, value) { this.attributes[key] = value; },
  focus() { this.focused = true; },
  getBoundingClientRect: () => ({ width: 360 }),
  scrollBy(options) { this.lastScroll = options.left; },
  getAnimations: () => [animation],
  setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {}
});
const elements = new Map();
const document = {
  listeners: {},
  createElement: element,
  querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  },
  addEventListener(name, callback) { if (name === 'DOMContentLoaded') callback(); else this.listeners[name] = callback; }
};
vm.runInNewContext(await readFile(new URL('../script.js', import.meta.url), 'utf8'), {
  document,
  window: { PORTFOLIO_CONTENT: { projects: [{ title: 'Test', link: 'assets/projects/test.pdf', download: true }] }, addEventListener() {} },
  fetch: () => Promise.resolve({ ok: true, json: () => ({ count: 1 }) })
});
const marquee = elements.get('.project-marquee');
const projectHTML = elements.get('#project-track').children[0].innerHTML;
assert.ok(projectHTML.includes('href="assets/projects/test.pdf" download'));
assert.ok(projectHTML.includes('>View project'));
assert.ok(!projectHTML.includes('View project image'));
assert.ok(!projectHTML.includes('target="_blank"'));
const send = (name, properties = {}) => {
  let prevented = false;
  marquee.listeners[name]({ pointerId: 1, isPrimary: true, button: 0, clientX: 100,
    preventDefault() { prevented = true; }, stopPropagation() {}, ...properties });
  return prevented;
};
assert.ok([...elements.values()].every(node => !node.listeners.wheel));
send('pointerdown');
send('pointermove', { clientX: 62 });
assert.equal(animation.currentTime, 5400);
send('pointermove', { clientX: 138 });
assert.equal(animation.currentTime, 48600);
const pause = elements.get('#project-pause');
pause.listeners.click();
assert.equal(pause.attributes['aria-pressed'], 'true');
assert.ok(marquee.classList.contains('is-paused'));
pause.listeners.click();
assert.equal(pause.attributes['aria-pressed'], 'false');
const navToggle = elements.get('#nav-toggle');
navToggle.listeners.click();
document.listeners.keydown({ key: 'Escape' });
assert.equal(navToggle.attributes['aria-expanded'], 'false');
assert.equal(navToggle.focused, true);
send('pointerup');
assert.equal(send('click'), true);
send('pointerdown');
send('pointerup');
assert.equal(send('click'), false);
send('pointerdown');
send('pointercancel');
send('pointermove', { clientX: 0 });
assert.equal(animation.currentTime, 48600);
const track = elements.get('#project-track');
const focusProject = keyboard => track.listeners.focusin({ target: {
  matches: selector => selector === ':focus-visible' && keyboard,
  closest: () => track.children[1]
} });
send('pointerdown');
focusProject(false);
assert.equal(animation.currentTime, 48600, 'Pointer focus must not move a project before its link is clicked');
send('pointerup');
assert.equal(send('click'), false, 'A project link click must not be prevented');
focusProject(true);
assert.equal(animation.currentTime, 54000, 'Keyboard focus must still bring the focused project into view');
console.log('Passed: pointer focus keeps project links stationary; keyboard focus reveals the project.');
track.getAnimations = () => [];
send('keydown', { key: 'ArrowRight' });
assert.equal(marquee.lastScroll, 380);
console.log('Passed: bidirectional drag, wrapping, click protection, cancellation, keyboard/reduced motion, and no wheel interception.');
const css = await readFile(new URL('../responsive.css', import.meta.url), 'utf8');
assert.ok(!css.includes('.projects-section:hover'));
assert.ok(css.includes('.project-marquee:hover .project-track { animation-play-state: running; }'));
assert.ok(css.includes('.project-marquee:has(.marquee-project-card:hover) .project-track { animation-play-state: paused; }'));
console.log('Passed: card-only hover pause overrides the original container hover pause.');
