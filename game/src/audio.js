// Procedural sound effects for DAPUR KILAT, synthesized with WebAudio.
// No audio files: every sound is built from oscillators and filtered noise,
// so the game loads nothing over the network. Created lazily on the first
// user gesture (browsers block audio before that) and silent when muted.

export function createAudio() {
  const audio = {
    ctx: null,
    muted: false,
    master: null,
  };

  audio.unlock = () => {
    if (audio.ctx) {
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      return;
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio.ctx = new Ctx();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.35;
      audio.master.connect(audio.ctx.destination);
    } catch {
      audio.ctx = null;
    }
  };

  function tone(freq, dur, type, vol, slideTo) {
    if (!audio.ctx || audio.muted) return;
    const t = audio.ctx.currentTime;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, vol, filterFreq) {
    if (!audio.ctx || audio.muted) return;
    const t = audio.ctx.currentTime;
    const len = Math.max(1, Math.floor(audio.ctx.sampleRate * dur));
    const buffer = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audio.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = audio.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1800;
    const gain = audio.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    src.start(t);
  }

  audio.pickup = () => tone(520, 0.07, 'triangle', 0.18, 700);
  audio.place = () => tone(300, 0.08, 'triangle', 0.18, 220);
  audio.chop = () => { noise(0.06, 0.3, 900); tone(180, 0.05, 'square', 0.08, 120); };
  audio.sizzle = () => noise(0.12, 0.1, 3200);
  audio.done = () => { tone(660, 0.09, 'sine', 0.2); setTimeout(() => tone(880, 0.12, 'sine', 0.2), 90); };
  audio.serve = () => {
    tone(523, 0.1, 'triangle', 0.22);
    setTimeout(() => tone(659, 0.1, 'triangle', 0.22), 100);
    setTimeout(() => tone(784, 0.18, 'triangle', 0.24), 200);
  };
  audio.error = () => tone(160, 0.22, 'sawtooth', 0.16, 110);
  audio.expire = () => { tone(392, 0.15, 'sine', 0.18, 330); setTimeout(() => tone(311, 0.25, 'sine', 0.18, 262), 140); };
  audio.tick = () => tone(980, 0.04, 'square', 0.06);
  audio.rush = () => { tone(440, 0.12, 'triangle', 0.2, 660); setTimeout(() => tone(660, 0.12, 'triangle', 0.2, 880), 120); };

  return audio;
}
