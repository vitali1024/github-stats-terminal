import { validateGitHubUsername } from "../utils/validators.js";
import { Toast } from "./Toast.js";
import { SoundManager } from "../lib/sounds.js";

export class TerminalInput {
  constructor(container, onSubmit) {
    this.container = container;
    this.onSubmit = onSubmit;
    this.value = "";
    this.isLoading = false;
    this.isFocused = false;
    this.elements = {};
    this._handleInput = this._handleInput.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleFocus = this._handleFocus.bind(this);
    this._handleBlur = this._handleBlur.bind(this);
    this._handleWrapperClick = this._handleWrapperClick.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  mount() {
    this._render();
    this._attachEventListeners();
    this._focusInput();
  }

  destroy() {
    this._detachEventListeners();
  }

  setLoading(loading) {
    this.isLoading = loading;
    if (this.elements.input) {
      this.elements.input.disabled = loading;
    }
    if (this.elements.loadingText) {
      this.elements.loadingText.classList.toggle("hidden", !loading);
    }
    if (this.elements.cursor) {
      this.elements.cursor.classList.toggle("hidden", loading);
    }
  }

  focus() {
    this._focusInput();
  }

  _render() {
    this.container.innerHTML = `
      <div class="terminal-input-wrapper min-h-screen flex items-center justify-center bg-background p-4">
        <div class="fixed inset-0 scanlines pointer-events-none z-20 opacity-30"></div>
        <div class="fixed inset-0 pointer-events-none z-10" style="background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%);"></div>
        <div class="w-full max-w-2xl relative z-0">
          <div class="relative p-1 rainbow-border rounded-sm">
            <div class="bg-background p-1">
              <div class="border-2 border-primary box-glow rounded-sm overflow-hidden">
                <div class="relative bg-background p-4">
                  <div class="absolute inset-0 scanlines pointer-events-none z-10 opacity-20"></div>
                  <div>
                    <div class="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-primary">
                      <div class="flex gap-1.5">
                        <span class="w-3 h-3 rounded-full bg-destructive opacity-80"></span>
                        <span class="w-3 h-3 rounded-full bg-accent opacity-80"></span>
                        <span class="w-3 h-3 rounded-full bg-green-500 opacity-80"></span>
                      </div>
                      <span class="text-lg text-muted-foreground font-pixel ml-2">github-stats.exe</span>
                    </div>
                    <div class="space-y-3 font-pixel">
                      <p class="text-foreground text-glow text-lg">Welcome to GitHub Stats Terminal v1.0</p>
                      <p class="text-primary text-glow-subtle text-lg">Enter a GitHub username to view stats:</p>
                      <form id="terminal-form" class="flex items-center gap-1 mt-2">
                        <span class="text-secondary text-glow text-xl flex-shrink-0">&gt;</span>
                        <div id="input-container" class="flex-1 relative cursor-text min-h-[1.5em]">
                          <input id="username-input" type="text" class="w-full bg-transparent text-foreground text-glow text-xl font-pixel outline-none caret-transparent tracking-wide" placeholder="" autocomplete="off" spellcheck="false" maxlength="39" />
                          <span id="cursor" class="cursor-block text-xl text-foreground text-glow pointer-events-none absolute top-0" style="left: 0;">█</span>
                        </div>
                      </form>
                      <p class="text-muted-foreground text-sm mt-3">Press ENTER to submit</p>
                      <p id="loading-text" class="text-accent text-glow text-lg animate-pulse hidden">Fetching data...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.elements = {
      form: this.container.querySelector("#terminal-form"),
      input: this.container.querySelector("#username-input"),
      inputContainer: this.container.querySelector("#input-container"),
      cursor: this.container.querySelector("#cursor"),
      loadingText: this.container.querySelector("#loading-text"),
    };

    this._injectCursorStyles();
  }

  _injectCursorStyles() {
    if (document.getElementById("terminal-input-styles")) return;
    const style = document.createElement("style");
    style.id = "terminal-input-styles";
    style.textContent = `
      .cursor-block { animation: cursor-blink 1s step-end infinite; }
      .cursor-block.hidden { display: none; }
      @keyframes cursor-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      #username-input:disabled { opacity: 0.7; }
    `;
    document.head.appendChild(style);
  }

  _attachEventListeners() {
    const { form, input } = this.elements;
    const wrapper = this.container.querySelector(".terminal-input-wrapper");
    form?.addEventListener("submit", this._handleSubmit);
    input?.addEventListener("input", this._handleInput);
    input?.addEventListener("keydown", this._handleKeyDown);
    input?.addEventListener("focus", this._handleFocus);
    input?.addEventListener("blur", this._handleBlur);
    wrapper?.addEventListener("click", this._handleWrapperClick);
  }

  _detachEventListeners() {
    const { form, input } = this.elements;
    const wrapper = this.container.querySelector(".terminal-input-wrapper");
    form?.removeEventListener("submit", this._handleSubmit);
    input?.removeEventListener("input", this._handleInput);
    input?.removeEventListener("keydown", this._handleKeyDown);
    input?.removeEventListener("focus", this._handleFocus);
    input?.removeEventListener("blur", this._handleBlur);
    wrapper?.removeEventListener("click", this._handleWrapperClick);
  }

  _handleInput(event) {
    this.value = event.target.value;
    this._updateCursorPosition();
  }

  _handleKeyDown(event) {
    const modifierKeys = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape"];
    const functionKeys = event.key.startsWith("F") && event.key.length <= 3;
    if (modifierKeys.includes(event.key) || functionKeys) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      this._playBackspaceSound();
    } else if (event.key !== "Enter") {
      this._playTypingSound();
    }
  }

  _handleFocus() {
    this.isFocused = true;
    if (this.elements.cursor) {
      this.elements.cursor.style.animationPlayState = "running";
    }
  }

  _handleBlur() {
    this.isFocused = false;
    if (this.elements.cursor) {
      this.elements.cursor.style.animationPlayState = "paused";
      this.elements.cursor.style.opacity = "1";
    }
    if (!this.isLoading) {
      setTimeout(() => this._focusInput(), 10);
    }
  }

  _handleWrapperClick(_event) {
    if (!this.isLoading) {
      this._focusInput();
    }
  }

  _handleSubmit(event) {
    event.preventDefault();
    if (this.isLoading) return;
    const username = this.value.trim();
    const validation = validateGitHubUsername(username);
    if (!validation.valid) {
      this._playErrorSound();
      Toast.error(validation.error);
      return;
    }
    this._playEnterSound();
    if (this.onSubmit) {
      this.onSubmit(username);
    }
  }

  _focusInput() {
    this.elements.input?.focus();
  }

  _updateCursorPosition() {
    if (!this.elements.cursor || !this.elements.input) return;
    const measureSpan = document.createElement("span");
    measureSpan.style.cssText = `position: absolute; visibility: hidden; white-space: pre; font-family: 'VT323', monospace; font-size: 1.25rem; letter-spacing: 0.025em;`;
    measureSpan.textContent = this.value || "";
    document.body.appendChild(measureSpan);
    const textWidth = measureSpan.offsetWidth;
    document.body.removeChild(measureSpan);
    this.elements.cursor.style.left = `${textWidth}px`;
  }

  _playTypingSound() {
    SoundManager.playTyping();
  }

  _playBackspaceSound() {
    SoundManager.playBackspace();
  }

  _playEnterSound() {
    SoundManager.playEnter();
  }

  _playErrorSound() {
    SoundManager.playError();
  }
}

export default TerminalInput;
