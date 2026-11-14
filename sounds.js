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
      context ||= new AudioContext();
      if (context.state === 'suspended') context.resume().catch(() => {});
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
  const play = name => {
    if (!enabled || document.hidden) return;
    prepare();
    // Never queue stale interaction sounds while the kit loads or audio unlocks.
    if (!buffer || context.state !== 'running' || performance.now() - lastPlayed < 45) return;
    lastPlayed = performance.now();
    const [offset, duration] = clips[name];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = .55;
    source.connect(gain).connect(context.destination);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(0, offset + (name === 'tap' ? 2 * Math.floor(Math.random() * 5) : 0), duration);
  };
  document.addEventListener('pointerdown', prepare, { passive: true });
  document.addEventListener('keydown', prepare);
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
