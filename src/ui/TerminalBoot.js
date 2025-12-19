import { SoundManager } from "../lib/sounds.js";

export class TerminalBoot {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.stage = 0;
        this.lines = [];
        this.isRunning = false;
        this.waitingForKey = false;
        this.timers = [];
        this.intervals = [];
        this.audioContext = null;
        this.audioEnabled = true;
        this.elements = {};
        this._handleKeyPress = this._handleKeyPress.bind(this);

        this.bootMessages = [
            { text: "BIOS v3.14.159 - GitHub Stats Terminal", delay: 100 },
            { text: "Copyright (c) 2025 Retro Systems Inc.", delay: 50 },
            { text: "", delay: 200 },
            { text: "Detecting hardware...", delay: 300 },
            { text: "  CPU: RetroCore 8086 @ 4.77MHz.......... OK", delay: 150 },
            { text: "  RAM: 640KB conventional memory......... OK", delay: 120 },
            { text: "  GPU: CRT Phosphor Display.............. OK", delay: 100 },
            { text: "  NET: Dial-up Modem 56K................. OK", delay: 180 },
            { text: "", delay: 100 },
            { text: "Loading kernel modules...", delay: 250 },
            { text: "  [████████████████████████] 100%", delay: 400 },
            { text: "", delay: 100 },
            { text: "Initializing GitHub API connection...", delay: 300 },
            { text: "  Establishing secure tunnel............. OK", delay: 200 },
            { text: "  Authenticating......................... OK", delay: 150 },
            { text: "", delay: 200 },
        ];

        this.asciiLogo = `
   ██████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗ 
  ██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗
  ██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝
  ██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗
  ╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝
   ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
       ███████╗████████╗ █████╗ ████████╗███████╗
       ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
       ███████╗   ██║   ███████║   ██║   ███████╗
       ╚════██║   ██║   ██╔══██║   ██║   ╚════██║
       ███████║   ██║   ██║  ██║   ██║   ███████║
       ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝`;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.body.classList.add("boot-active");
        this._render();
        this._startCursorBlink();
        this._startGlitchEffect();
        this._runBootSequence();
    }

    destroy() {
        this.isRunning = false;
        this.waitingForKey = false;
        document.body.classList.remove("boot-active");
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        document.removeEventListener("keydown", this._handleKeyPress);
        if (this.audioContext) {
            this.audioContext.close().catch(() => { });
            this.audioContext = null;
        }
    }

    _render() {
        this._injectBlinkStyle();
        const message = "SYSTEM READY - Press any key to continue...";
        const barChars = "─".repeat(message.length);

        this.container.innerHTML = `
      <div class="terminal-boot h-screen bg-background p-3 sm:p-4 md:p-8 font-pixel overflow-hidden flex flex-col">
        <div class="fixed inset-0 scanlines pointer-events-none z-20 opacity-30"></div>
        <div class="fixed inset-0 pointer-events-none z-10" style="background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%);"></div>
        <div class="relative z-0 flex-1 overflow-hidden flex flex-col">
          <div id="power-flash" class="fixed inset-0 bg-foreground/10 animate-pulse"></div>
          <div id="boot-lines" class="space-y-0 text-xs sm:text-sm md:text-base hidden flex-shrink-0"></div>
          <span id="boot-cursor" class="text-foreground text-glow hidden">█</span>
          <div id="ascii-logo" class="mt-2 sm:mt-4 hidden flex-shrink-0">
            <pre class="text-primary text-glow text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs leading-tight">${this.asciiLogo}</pre>
          </div>
          <div id="system-ready" class="mt-4 sm:mt-6 hidden inline-block">
            <pre class="text-accent text-glow text-xs sm:text-base md:text-lg font-pixel whitespace-pre" style="text-shadow: 0 0 8px hsl(60 100% 50% / 0.6);">${barChars}</pre>
            <p id="ready-text" class="text-foreground text-glow text-xs sm:text-base md:text-lg py-0.5 terminal-blink font-pixel whitespace-pre">${message}</p>
            <pre class="text-accent text-glow text-xs sm:text-base md:text-lg font-pixel whitespace-pre" style="text-shadow: 0 0 8px hsl(60 100% 50% / 0.6);">${barChars}</pre>
          </div>
        </div>
      </div>
    `;

        this.elements = {
            container: this.container.querySelector(".terminal-boot"),
            powerFlash: this.container.querySelector("#power-flash"),
            bootLines: this.container.querySelector("#boot-lines"),
            cursor: this.container.querySelector("#boot-cursor"),
            asciiLogo: this.container.querySelector("#ascii-logo"),
            systemReady: this.container.querySelector("#system-ready"),
            readyText: this.container.querySelector("#ready-text"),
        };
    }

    _injectBlinkStyle() {
        if (document.getElementById("terminal-blink-style")) return;
        const style = document.createElement("style");
        style.id = "terminal-blink-style";
        style.textContent = `
      @keyframes terminal-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .terminal-blink {
        animation: terminal-blink 1s step-end infinite;
      }
    `;
        document.head.appendChild(style);
    }

    _runBootSequence() {
        this._advanceStage();
    }

    _advanceStage() {
        switch (this.stage) {
            case 0:
                this._addTimer(() => {
                    this.stage = 1;
                    this._advanceStage();
                }, 500);
                break;
            case 1:
                this._hidePowerFlash();
                this._showBootLines();
                this._typeBootMessages();
                break;
            case 2:
                this._playEnterSound();
                this._hideCursor();
                this._showAsciiLogo();
                this._addTimer(() => {
                    this.stage = 3;
                    this._advanceStage();
                }, 1500);
                break;
            case 3:
                this._playEnterSound();
                this._showSystemReady();
                this._waitForKeyPress();
                break;
        }
    }

    _typeBootMessages() {
        let totalDelay = 0;
        this.bootMessages.forEach((msg, index) => {
            totalDelay += msg.delay;
            this._addTimer(() => {
                if (msg.text) {
                    SoundManager.playBootBeep();
                }
                this._addBootLine(msg.text);
                if (index === this.bootMessages.length - 1) {
                    this._addTimer(() => {
                        this.stage = 2;
                        this._advanceStage();
                    }, 300);
                }
            }, totalDelay);
        });
    }

    _addBootLine(text) {
        const line = document.createElement("p");
        line.className = "text-foreground text-glow whitespace-pre";
        line.textContent = text;
        this.elements.bootLines.appendChild(line);
        this.lines.push(line);
    }

    _startCursorBlink() {
        let visible = true;
        const interval = setInterval(() => {
            if (!this.isRunning) return;
            visible = !visible;
            if (this.elements.cursor) {
                this.elements.cursor.style.opacity = visible ? "1" : "0";
            }
        }, 530);
        this.intervals.push(interval);
    }

    _startGlitchEffect() {
        const interval = setInterval(() => {
            if (!this.isRunning) return;
            if (Math.random() > 0.95) {
                this._triggerGlitch();
            }
        }, 2000);
        this.intervals.push(interval);
    }

    _triggerGlitch() {
        const container = this.elements.container;
        if (!container) return;
        container.style.opacity = "0.95";
        container.style.transform = "translateX(1px)";
        const duration = 30 + Math.random() * 50;
        this._addTimer(() => {
            container.style.opacity = "1";
            container.style.transform = "translateX(0)";
        }, duration);
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

    _playEnterSound() {
        const ctx = this._getAudioContext();
        if (!ctx) return;
        try {
            const now = ctx.currentTime;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc1.type = "square";
            osc2.type = "square";
            osc1.frequency.setValueAtTime(600, now);
            osc2.frequency.setValueAtTime(900, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.15);
            osc2.stop(now + 0.15);
        } catch { }
    }

    _waitForKeyPress() {
        this.waitingForKey = true;
        document.addEventListener("keydown", this._handleKeyPress);
    }

    _handleKeyPress(event) {
        if (!this.waitingForKey) return;
        if (!event.key.startsWith("F") && event.key !== "Escape") {
            event.preventDefault();
        }
        this.waitingForKey = false;
        document.removeEventListener("keydown", this._handleKeyPress);
        this._playEnterSound();
        this._addTimer(() => {
            this.destroy();
            if (this.onComplete) {
                this.onComplete();
            }
        }, 200);
    }

    _hidePowerFlash() {
        this.elements.powerFlash?.classList.add("hidden");
    }

    _showBootLines() {
        this.elements.bootLines?.classList.remove("hidden");
        this.elements.cursor?.classList.remove("hidden");
    }

    _hideCursor() {
        this.elements.cursor?.classList.add("hidden");
    }

    _showAsciiLogo() {
        this.elements.asciiLogo?.classList.remove("hidden");
    }

    _showSystemReady() {
        this.elements.systemReady?.classList.remove("hidden");
    }

    _addTimer(callback, delay) {
        const timer = setTimeout(callback, delay);
        this.timers.push(timer);
        return timer;
    }
}

export default TerminalBoot;
