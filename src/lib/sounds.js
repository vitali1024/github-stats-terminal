class SoundManagerClass {
    constructor() {
        this.audioContext = null;
        this.audioEnabled = true;
        this.initialized = false;
        this.pendingCallback = null;
        this.keyCount = 0;

        this._initOnInteraction = this._initOnInteraction.bind(this);
        this._addInteractionListeners();
    }

    _addInteractionListeners() {
        const events = ["click", "keydown", "touchstart"];
        events.forEach(event => {
            document.addEventListener(event, this._initOnInteraction, {
                once: true,
                capture: true,
                passive: true
            });
        });
    }

    _removeInteractionListeners() {
        const events = ["click", "keydown", "touchstart"];
        events.forEach(event => {
            document.removeEventListener(event, this._initOnInteraction, { capture: true });
        });
    }

    _initOnInteraction() {
        if (this.initialized) return;
        this._removeInteractionListeners();
        this._getAudioContext();
        this.initialized = true;
        if (this.pendingCallback) {
            const cb = this.pendingCallback;
            this.pendingCallback = null;
            cb();
        }
    }

    _playOrQueue(soundFn, queueIfBlocked = false) {
        const ctx = this._getAudioContext();
        if (ctx && ctx.state === "running") {
            soundFn(ctx);
        } else if (queueIfBlocked && !this.pendingCallback) {
            this.pendingCallback = () => soundFn(this._getAudioContext());
        }
    }

    _getAudioContext() {
        if (!this.audioEnabled) return null;
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume().catch(() => {
                    this.audioEnabled = false;
                });
            }
            return this.audioContext;
        } catch {
            this.audioEnabled = false;
            return null;
        }
    }

    isReady() {
        const ctx = this._getAudioContext();
        return ctx && ctx.state === "running";
    }

    unlock() {
        this._initOnInteraction();
    }

    playTyping() {
        this._playOrQueue((ctx) => {
            try {
                const now = ctx.currentTime;
                this.keyCount++;

                this._playClick(ctx, now);

                if (this.keyCount % (8 + Math.floor(Math.random() * 5)) === 0) {
                    this._playThock(ctx, now);
                }

                if (this.keyCount % (18 + Math.floor(Math.random() * 8)) === 0) {
                    this._playBip(ctx, now + 0.01);
                }
            } catch { }
        });
    }

    _playClick(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "square";
        osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.008);

        filter.type = "highpass";
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.055, now + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.02);

        this._playNoiseBurst(ctx, 0.03, 0.01);
    }

    _playThock(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    _playBip(ctx, now) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.015);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
    }

    playBackspace() {
        this._playOrQueue((ctx) => {
            try {
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "triangle";
                osc.frequency.setValueAtTime(350, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.065, now + 0.002);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.05);

                this._playNoiseBurst(ctx, 0.025, 0.008);
            } catch { }
        });
    }

    _playNoiseBurst(ctx, volume, duration) {
        try {
            const now = ctx.currentTime;
            const bufferSize = Math.floor(ctx.sampleRate * duration);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);

            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.3;
            }

            const noiseSource = ctx.createBufferSource();
            const noiseGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            filter.type = "highpass";
            filter.frequency.setValueAtTime(2500, now);

            noiseSource.buffer = noiseBuffer;
            noiseGain.gain.setValueAtTime(volume, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseSource.start(now);
        } catch { }
    }

    playEnter() {
        this._playOrQueue((ctx) => {
            try {
                const now = ctx.currentTime;

                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc1.type = "square";
                osc2.type = "square";
                osc1.frequency.setValueAtTime(800, now);
                osc1.frequency.setValueAtTime(1000, now + 0.05);
                osc2.frequency.setValueAtTime(1200, now);
                osc2.frequency.setValueAtTime(1500, now + 0.05);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.07, now + 0.01);
                gain.gain.setValueAtTime(0.05, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.12);
                osc2.stop(now + 0.12);
            } catch { }
        });
    }

    playError() {
        this._playOrQueue((ctx) => {
            try {
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.12);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.12);
            } catch { }
        });
    }

    playBootBeep() {
        this._playOrQueue((ctx) => {
            try {
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "square";
                osc.frequency.setValueAtTime(600 + Math.random() * 200, now);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.04, now + 0.003);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.03);
            } catch { }
        }, true);
    }

    destroy() {
        this._removeInteractionListeners();
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }
    }
}

export const SoundManager = new SoundManagerClass();
export default SoundManager;
