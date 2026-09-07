/* NASCERE V2 — robust sound control. Uses the original sea audio first,
   with a procedural Web Audio fallback if the remote file cannot play. */
(() => {
  const SEA_URL = 'https://cdn.glitch.global/875c914b-5bf9-4bd8-8d5b-92c7da9612b5/sea_theme.mp3?v=1726130217666';

  let enabled = false;
  let media = null;
  let ctx = null;
  let master = null;
  let noise = null;
  let swell = null;
  let fallbackReady = false;

  function setButtonState(button, on) {
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.dataset.audioReady = on ? 'true' : 'false';
    const text = button.querySelector('[data-i18n="sound"]');
    if (text) {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
      text.textContent = on ? (lang === 'en' ? 'SOUND ON' : 'SONIDO ON') : (lang === 'en' ? 'SOUND' : 'SONIDO');
    }
  }

  function getMedia() {
    if (media) return media;
    media = new Audio();
    media.src = SEA_URL;
    media.loop = true;
    media.preload = 'auto';
    media.volume = 0.48;
    media.playsInline = true;
    return media;
  }

  function createNoiseBuffer(audioContext) {
    const seconds = 5;
    const length = Math.floor(audioContext.sampleRate * seconds);
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let pink = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      pink = pink * 0.985 + white * 0.075;
      data[i] = pink * 0.55;
    }
    return buffer;
  }

  function buildFallback() {
    if (fallbackReady) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API no disponible');

    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2100;
    filter.Q.value = 0.35;
    filter.connect(master);

    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx);
    src.loop = true;
    src.connect(filter);
    src.start();
    noise = src;

    swell = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swell.type = 'sine';
    swell.frequency.value = 0.09;
    swellGain.gain.value = 0.10;
    swell.connect(swellGain);
    swellGain.connect(master.gain);
    swell.start();

    fallbackReady = true;
  }

  async function startFallback() {
    buildFallback();
    if (ctx.state === 'suspended') await ctx.resume();
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.001), now);
    master.gain.linearRampToValueAtTime(0.42, now + 0.12);
  }

  function stopFallback() {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.10);
  }

  async function turnOn(button) {
    enabled = true;
    setButtonState(button, true);

    const audio = getMedia();
    try {
      audio.currentTime = audio.currentTime || 0;
      await audio.play();
      stopFallback();
      button.dataset.audioMode = 'file';
      return;
    } catch (error) {
      console.warn('[Nascere] Audio marino remoto no disponible; usando ambiente local.', error);
    }

    try {
      await startFallback();
      button.dataset.audioMode = 'generated';
    } catch (error) {
      console.error('[Nascere] No se pudo iniciar ningún modo de sonido:', error);
      enabled = false;
      setButtonState(button, false);
      button.dataset.audioMode = 'failed';
    }
  }

  function turnOff(button) {
    enabled = false;
    if (media) media.pause();
    stopFallback();
    setButtonState(button, false);
    button.dataset.audioMode = 'off';
  }

  function bind() {
    const original = document.getElementById('sound-toggle');
    if (!original) return;

    /* Replace the element to remove the legacy click listener from script.js.
       This leaves one single owner for sound state and avoids two handlers fighting. */
    const button = original.cloneNode(true);
    original.replaceWith(button);
    button.dataset.soundFixBound = 'true';
    setButtonState(button, false);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (enabled) turnOff(button);
      else turnOn(button);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
