import { SoundTheme } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private errorGain: GainNode | null = null;
  private customKeystrokeBuffer: AudioBuffer | null = null;
  private customErrorBuffer: AudioBuffer | null = null;
  
  private currentTheme: SoundTheme = 'clicky-kailh';
  private masterVolume: number = 0.75;
  private errorVolume: number = 0.6;
  private soundEnabled: boolean = true;
  private errorSoundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.errorGain = this.ctx.createGain();
      this.errorGain.gain.setValueAtTime(this.errorVolume, this.ctx.currentTime);
      this.errorGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public ensureContext(): void {
    this.initContext();
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public setErrorSoundEnabled(enabled: boolean): void {
    this.errorSoundEnabled = enabled;
  }

  public setSoundTheme(theme: SoundTheme): void {
    this.currentTheme = theme;
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setErrorVolume(vol: number): void {
    this.errorVolume = Math.max(0, Math.min(1, vol));
    if (this.errorGain && this.ctx) {
      this.errorGain.gain.setValueAtTime(this.errorVolume, this.ctx.currentTime);
    }
  }

  public async loadCustomAudio(file: File, type: 'keystroke' | 'error'): Promise<boolean> {
    try {
      const ctx = this.initContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      if (type === 'keystroke') {
        this.customKeystrokeBuffer = audioBuffer;
      } else {
        this.customErrorBuffer = audioBuffer;
      }
      return true;
    } catch (err) {
      console.error('Failed to decode custom audio file:', err);
      return false;
    }
  }

  public hasCustomAudio(type: 'keystroke' | 'error'): boolean {
    return type === 'keystroke' ? this.customKeystrokeBuffer !== null : this.customErrorBuffer !== null;
  }

  public playKeySound(isSpace = false): void {
    if (!this.soundEnabled || this.currentTheme === 'off') return;
    const ctx = this.initContext();
    if (!this.masterGain) return;

    // Slight random pitch variation (humanized acoustic feel)
    const pitchJitter = 0.95 + Math.random() * 0.1;

    if (this.currentTheme === 'custom' && this.customKeystrokeBuffer) {
      this.playBuffer(this.customKeystrokeBuffer, this.masterGain, pitchJitter);
      return;
    }

    const now = ctx.currentTime;

    switch (this.currentTheme) {
      case 'clicky-kailh':
        this.synthesizeKailhBox(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'clicky-clack':
        this.synthesizeClickyClack(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'cherry-blue':
        this.synthesizeCherryBlue(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'holy-panda':
        this.synthesizeHolyPanda(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'gateron-black':
        this.synthesizeGateronBlack(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'cherry-brown':
        this.synthesizeCherryBrown(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'thocky':
        this.synthesizeThocky(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'typewriter':
        this.synthesizeTypewriter(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'digital-pop':
        this.synthesizeDigitalPop(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      case 'laptop':
        this.synthesizeLaptop(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
      default:
        this.synthesizeKailhBox(ctx, this.masterGain, now, isSpace, pitchJitter);
        break;
    }
  }

  public playErrorSound(): void {
    if (!this.errorSoundEnabled) return;
    const ctx = this.initContext();
    if (!this.errorGain) return;

    if (this.customErrorBuffer) {
      this.playBuffer(this.customErrorBuffer, this.errorGain, 1.0);
      return;
    }

    const now = ctx.currentTime;
    
    // Distinct muffled error thud + dissonant alert tick
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Dissonant interval (minor second)
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    osc2.frequency.setValueAtTime(155, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    // Lowpass filter to keep it pleasant and not harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.errorGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // Play celebratory level-up fanfare for game-like lesson progression
  public playLevelUpFanfare(): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const startTime = now + idx * 0.09;
      const duration = idx === notes.length - 1 ? 0.35 : 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  private playBuffer(buffer: AudioBuffer, destination: GainNode, playbackRate = 1.0): void {
    if (!this.ctx) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(destination);
    source.start();
  }

  // Synthesis 1: Cherry MX Blue (Crisp tactile snap + high frequency click + body)
  private synthesizeCherryBlue(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    // 1. High-frequency click burst (tactile leaf click)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime((isSpace ? 2800 : 3400) * jitter, now);
    clickFilter.Q.setValueAtTime(4, now);

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1800 * jitter, now);
    clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

    clickGain.gain.setValueAtTime(isSpace ? 0.35 : 0.45, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(dest);

    clickOsc.start(now);
    clickOsc.stop(now + 0.03);

    // 2. Body bottom-out resonance (keycap plastic strike)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    
    bodyOsc.type = 'sine';
    const baseFreq = (isSpace ? 210 : 320) * jitter;
    bodyOsc.frequency.setValueAtTime(baseFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.045);

    bodyGain.gain.setValueAtTime(isSpace ? 0.4 : 0.3, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(dest);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.055);
  }

  // Synthesis 2: Thocky Cream Switch (Deep, lubed, creamy thud with low resonance)
  private synthesizeThocky(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime((isSpace ? 650 : 850) * jitter, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    osc.type = 'triangle';
    const startFreq = (isSpace ? 190 : 260) * jitter;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, now + 0.055);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.065);
  }

  // Synthesis 3: Vintage Typewriter (Metal striker snap + spring resonance)
  private synthesizeTypewriter(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    // Metal impact
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    const bandpass = ctx.createBiquadFilter();

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime((isSpace ? 1400 : 2100) * jitter, now);
    bandpass.Q.setValueAtTime(3.5, now);

    strikeOsc.type = 'sawtooth';
    strikeOsc.frequency.setValueAtTime(800 * jitter, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    strikeGain.gain.setValueAtTime(0.5, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    strikeOsc.connect(bandpass);
    bandpass.connect(strikeGain);
    strikeGain.connect(dest);

    strikeOsc.start(now);
    strikeOsc.stop(now + 0.045);

    // Spring clink / frame ringing
    const ringOsc = ctx.createOscillator();
    const ringGain = ctx.createGain();

    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime((isSpace ? 820 : 1250) * jitter, now);
    ringGain.gain.setValueAtTime(0.2, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    ringOsc.connect(ringGain);
    ringGain.connect(dest);

    ringOsc.start(now);
    ringOsc.stop(now + 0.09);
  }

  // Synthesis 4: Typing.com Digital Pop (Friendly round bubble pop)
  private synthesizeDigitalPop(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const topFreq = (isSpace ? 480 : 640) * jitter;
    osc.frequency.setValueAtTime(topFreq, now);
    osc.frequency.exponentialRampToValueAtTime(topFreq * 0.35, now + 0.04);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Synthesis 5: Laptop Scissor Switch (Cushioned quiet tap)
  private synthesizeLaptop(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime((isSpace ? 700 : 1100) * jitter, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isSpace ? 280 : 380) * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Synthesis 6: Kailh Box White (Sharp, ultra-crisp click bar snap)
  private synthesizeKailhBox(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    // 1. Crystal-clear high frequency click-bar snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const snapFilter = ctx.createBiquadFilter();

    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime((isSpace ? 3400 : 4600) * jitter, now);
    snapFilter.Q.setValueAtTime(5, now);

    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(2600 * jitter, now);
    snapOsc.frequency.exponentialRampToValueAtTime(800, now + 0.016);

    snapGain.gain.setValueAtTime(isSpace ? 0.45 : 0.55, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(dest);

    snapOsc.start(now);
    snapOsc.stop(now + 0.02);

    // 2. Secondary tactile click release
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime((isSpace ? 420 : 640) * jitter, now + 0.003);
    popOsc.frequency.exponentialRampToValueAtTime(220, now + 0.032);

    popGain.gain.setValueAtTime(0.4, now + 0.003);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    popOsc.connect(popGain);
    popGain.connect(dest);

    popOsc.start(now + 0.003);
    popOsc.stop(now + 0.04);

    // 3. Housing bottom-out thud
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    const baseFreq = (isSpace ? 190 : 280) * jitter;
    bodyOsc.frequency.setValueAtTime(baseFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.04);

    bodyGain.gain.setValueAtTime(isSpace ? 0.45 : 0.3, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(dest);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.05);
  }

  // Synthesis 7: Clicky Clack (Crisp double tactile strike + spring impact)
  private synthesizeClickyClack(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    // Primary leaf snap
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((isSpace ? 2900 : 3800) * jitter, now);
    filter.Q.setValueAtTime(4.5, now);

    click.type = 'triangle';
    click.frequency.setValueAtTime(2200 * jitter, now);
    click.frequency.exponentialRampToValueAtTime(500, now + 0.02);

    clickGain.gain.setValueAtTime(0.5, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    click.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(dest);

    click.start(now);
    click.stop(now + 0.025);

    // Secondary clack (stem hits plate 5ms later)
    const clack = ctx.createOscillator();
    const clackGain = ctx.createGain();
    const clackTime = now + 0.005;

    clack.type = 'square';
    clack.frequency.setValueAtTime((isSpace ? 340 : 490) * jitter, clackTime);
    clack.frequency.exponentialRampToValueAtTime(140, clackTime + 0.035);

    const clackFilter = ctx.createBiquadFilter();
    clackFilter.type = 'lowpass';
    clackFilter.frequency.setValueAtTime(1200, clackTime);

    clackGain.gain.setValueAtTime(0.35, clackTime);
    clackGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.04);

    clack.connect(clackFilter);
    clackFilter.connect(clackGain);
    clackGain.connect(dest);

    clack.start(clackTime);
    clack.stop(clackTime + 0.045);
  }

  // Synthesis 8: Holy Panda (Crispy rounded tactile pop + bottom out clack)
  private synthesizeHolyPanda(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((isSpace ? 1100 : 1600) * jitter, now);
    filter.Q.setValueAtTime(2.5, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isSpace ? 520 : 780) * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.038);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Synthesis 9: Gateron Black Ink (Deep, buttery, thocky linear switch)
  private synthesizeGateronBlack(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime((isSpace ? 550 : 700) * jitter, now);

    osc.type = 'sine';
    const baseFreq = (isSpace ? 160 : 220) * jitter;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.048);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.052);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  // Synthesis 10: Cherry MX Brown (Subtle tactile bump + muffled tap)
  private synthesizeCherryBrown(ctx: AudioContext, dest: GainNode, now: number, isSpace: boolean, jitter: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((isSpace ? 950 : 1350) * jitter, now);
    filter.Q.setValueAtTime(2.0, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime((isSpace ? 360 : 540) * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.032);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.036);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundEngine = new SoundEngine();
