/* NASCERE V2 — reliable sound toggle without external audio dependencies. */
(() => {
  let ctx = null;
  let master = null;
  let surfGain = null;
  let source = null;
  let lfo = null;
  let lfoDepth = null;
  let enabled = false;
  let ready = false;

  function createOceanBuffer(audioContext) {
    const seconds = 8;
    const length = audioContext.sampleRate * seconds;
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;

    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.018 * white) / 1.018;
      const t = i / audioContext.sampleRate;
      const swell = 0.58 + 0.22 * Math.sin(t * Math.PI * 0.42) + 0.10 * Math.sin(t * Math.PI * 1.13);
      data[i] = brown * 3.2 * swell;
    }
    return buffer;
  }

  function buildAudioGraph() {
    if (ready) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('Web Audio API no disponible');

    ctx = new AudioCtx();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    surfGain = ctx.createGain();
    surfGain.gain.value = 0.58;
    surfGain.connect(master);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1450;
    lowpass.Q.value = 0.55;
    lowpass.connect(surfGain);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 120;
    highpass.Q.value = 0.4;

    source = ctx.createBufferSource();
    source.buffer = createOceanBuffer(ctx);
    source.loop = true;
    source.connect(highpass);
    highpass.connect(lowpass);

    /* Slow swell so the ambience feels like surf instead of static noise. */
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.075;
    lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.22;
    lfo.connect(lfoDepth);
    lfoDepth.connect(surfGain.gain);

    source.start();
    lfo.start();
    ready = true;
  }

  async function setSound(next, button) {
    try {
      buildAudioGraph();
      if (ctx.state === 'suspended') await ctx.resume();

      enabled = next;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(enabled ? 0.34 : 0, now + 0.18);

      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      button.dataset.audioReady = 'true';
    } catch (error) {
      console.error('[Nascere] No se pudo iniciar el sonido:', error);
      enabled = false;
      button.setAttribute('aria-pressed', 'false');
      button.dataset.audioReady = 'false';
    }
  }

  function bind() {
    const button = document.getElementById('sound-toggle');
    if (!button || button.dataset.webAudioBound === 'true') return;
    button.dataset.webAudioBound = 'true';

    /* Capture phase prevents the older A-Frame/remote-MP3 handler from running. */
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setSound(!enabled, button);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
