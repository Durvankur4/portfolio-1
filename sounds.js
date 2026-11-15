(() => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const toggle = document.querySelector('#sound-toggle');
  if (!AudioContext || !toggle) return;
  // Same public SND kit, sprite timings, and gain used by dzcommune.com.
  const url = 'https://cdn.jsdelivr.net/gh/snd-lib/snd-lib@v1.2.4/assets/sounds/sprite/01/audioSprite.mp3';
  const clips = { button: [0, .12], select: [16, .12], toggle: [42, .12], open: [46, .12], close: [44, .12], tap: [30, .03] };
  let enabled = true;
  let context;
  let buffer;
  let loading;
  let lastPlayed = -Infinity;
  try { enabled = localStorage.getItem('portfolio-sound') !== 'off'; } catch {}
  const draw = () => {
    toggle.textContent = enabled ? 'Sound on' : 'Sound off';
    toggle.setAttribute('aria-pressed', String(enabled));
  };
  draw();
  toggle.hidden = false;
  const prepare = () => {
    if (!enabled) return;
    try {
      if (!context) {
        context = new AudioContext();
        context.onstatechange = draw;
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
      draw();
      loading ||= fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Sound kit unavailable');
          return response.arrayBuffer();
        })
        .then(data => context.decodeAudioData(data))
        .then(decoded => { buffer = decoded; })
        .catch(() => { loading = null; });
    } catch {}
  };
  const play = (name, volume = .55) => {
    if (!enabled || document.hidden) return;
    prepare();
    // Never queue stale interaction sounds while the kit loads or audio unlocks.
    if (context?.state !== 'running' || (name !== 'hover' && !buffer) || performance.now() - lastPlayed < 45) return;
    lastPlayed = performance.now();
    if (name === 'hover') {
      const tone = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      tone.frequency.setValueAtTime(900, now);
      tone.frequency.exponentialRampToValueAtTime(600, now + .08);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.045, now + .005);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .08);
      tone.connect(gain).connect(context.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(now);
      tone.stop(now + .09);
      return;
    }
    const [offset, duration] = clips[name];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain).connect(context.destination);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(0, offset + (name === 'tap' ? 2 * Math.floor(Math.random() * 5) : 0), duration);
  };
  const unlock = event => {
    if (event.target.closest?.('#sound-toggle')) return;
    prepare();
  };
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('pointerup', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  document.addEventListener('click', unlock);
  let lastHover = -Infinity;
  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse' || event.buttons || context?.state !== 'running') return;
    const card = event.target.closest('.marquee-project-card');
    if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
    if (performance.now() - lastHover < 180) return;
    lastHover = performance.now();
    play('hover');
  });
  document.addEventListener('click', event => {
    const control = event.target.closest('a, button');
    if (!control || event.defaultPrevented || control.disabled) return;
    if (control === toggle) {
      enabled = !enabled;
      try { localStorage.setItem('portfolio-sound', enabled ? 'on' : 'off'); } catch {}
      draw();
      if (!enabled) { context?.suspend().catch(() => {}); return; }
      prepare();
      Promise.all([loading, context?.resume()]).then(() => play('toggle')).catch(() => {});
      return;
    }
    if (control.id === 'nav-toggle') play(control.getAttribute('aria-expanded') === 'true' ? 'open' : 'close');
    else if (control.hasAttribute('aria-pressed')) play('select');
    else play(control.matches('.btn-primary, .btn-outline, .nav-cta') ? 'button' : 'tap');
  });
})();
