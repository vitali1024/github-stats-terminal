(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const q={view:"boot",isLoading:!1,stats:null,error:null};let f={...q};const w=new Set;function H(){return f}function m(i){const e=typeof i=="function"?i(f):i;f={...f,...e},w.forEach(t=>t(f))}function E(i){return w.add(i),()=>w.delete(i)}const O="https://api.github.com",P="GitHub-Stats-Terminal/1.0";class d extends Error{constructor(e,t,s){super(e),this.name="GitHubApiError",this.status=t,this.type=s}}async function x(i){const e=`${O}${i}`;try{const t=await fetch(e,{headers:{Accept:"application/vnd.github.v3+json","User-Agent":P}});if(!t.ok){if(t.status===404)throw new d("User not found. Please check the username and try again.",404,"not_found");if(t.status===403){if(t.headers.get("X-RateLimit-Remaining")==="0"){const n=t.headers.get("X-RateLimit-Reset"),a=n?new Date(parseInt(n)*1e3):null,r=a?Math.ceil((a.getTime()-Date.now())/6e4):"a few";throw new d(`GitHub API rate limit exceeded. Please try again in ${r} minutes.`,403,"rate_limit")}throw new d("Access forbidden. The GitHub API may be temporarily unavailable.",403,"forbidden")}throw new d(`GitHub API error (${t.status}). Please try again later.`,t.status,"unknown")}return await t.json()}catch(t){throw t instanceof d?t:t instanceof TypeError&&t.message.includes("fetch")?new d("Network error. Please check your connection and try again.",0,"network"):new d("An unexpected error occurred. Please try again.",0,"unknown")}}function M(i){var n,a,r,l;let e=0,t=0,s=0;if(!Array.isArray(i))return{commits:0,prs:0,issues:0};for(const o of i)switch(o.type){case"PushEvent":e+=((a=(n=o.payload)==null?void 0:n.commits)==null?void 0:a.length)||0;break;case"PullRequestEvent":((r=o.payload)==null?void 0:r.action)==="opened"&&t++;break;case"IssuesEvent":((l=o.payload)==null?void 0:l.action)==="opened"&&s++;break}return{commits:e,prs:t,issues:s}}function K(i){if(!Array.isArray(i)||i.length===0)return[];const e={};for(const s of i){const n=s.language;n&&(e[n]=(e[n]||0)+(s.size||1))}return Object.entries(e).sort((s,n)=>n[1]-s[1]).slice(0,3).map(([s])=>s)}function F(i,e,t){const s=i*3+e*5+t*2;return s>=5e3?"S+":s>=2e3?"S":s>=1e3?"A+":s>=500?"A":s>=200?"B+":s>=100?"B":s>=50?"C+":"C"}async function G(i){const e=await x(`/users/${i}`),t=await x(`/users/${i}/repos?per_page=100&sort=updated`),s=Array.isArray(t)?t.reduce((o,c)=>o+(c.stargazers_count||0),0):0,n=K(t);let a={commits:null,prs:null,issues:null},r="Recent (last ~100 events)";try{const o=await x(`/users/${i}/events/public?per_page=100`);if(Array.isArray(o)&&o.length>0){const c=M(o);a={commits:c.commits,prs:c.prs,issues:c.issues}}}catch{r="Recent activity unavailable"}const l=F(s,e.public_repos||0,e.followers||0);return{username:e.login,name:e.name||e.login,avatarUrl:e.avatar_url,createdAt:e.created_at,location:e.location||null,followers:e.followers||0,following:e.following||0,publicRepos:e.public_repos||0,totalStars:s,recentCommits:a.commits,recentPRs:a.prs,recentIssues:a.issues,recentWindowLabel:r,topLanguages:n,rank:l}}class D{constructor(){this.audioContext=null,this.audioEnabled=!0,this.initialized=!1,this.pendingCallback=null,this.keyCount=0,this._initOnInteraction=this._initOnInteraction.bind(this),this._addInteractionListeners()}_addInteractionListeners(){["click","keydown","touchstart"].forEach(t=>{document.addEventListener(t,this._initOnInteraction,{once:!0,capture:!0,passive:!0})})}_removeInteractionListeners(){["click","keydown","touchstart"].forEach(t=>{document.removeEventListener(t,this._initOnInteraction,{capture:!0})})}_initOnInteraction(){if(!this.initialized&&(this._removeInteractionListeners(),this._getAudioContext(),this.initialized=!0,this.pendingCallback)){const e=this.pendingCallback;this.pendingCallback=null,e()}}_playOrQueue(e,t=!1){const s=this._getAudioContext();s&&s.state==="running"?e(s):t&&!this.pendingCallback&&(this.pendingCallback=()=>e(this._getAudioContext()))}_getAudioContext(){if(!this.audioEnabled)return null;try{return this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&this.audioContext.resume().catch(()=>{this.audioEnabled=!1}),this.audioContext}catch{return this.audioEnabled=!1,null}}isReady(){const e=this._getAudioContext();return e&&e.state==="running"}unlock(){this._initOnInteraction()}playTyping(){this._playOrQueue(e=>{try{const t=e.currentTime;this.keyCount++,this._playClick(e,t),this.keyCount%(8+Math.floor(Math.random()*5))===0&&this._playThock(e,t),this.keyCount%(18+Math.floor(Math.random()*8))===0&&this._playBip(e,t+.01)}catch{}})}_playClick(e,t){const s=e.createOscillator(),n=e.createGain(),a=e.createBiquadFilter();s.type="square",s.frequency.setValueAtTime(1400+Math.random()*400,t),s.frequency.exponentialRampToValueAtTime(800,t+.008),a.type="highpass",a.frequency.setValueAtTime(600,t),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.055,t+.001),n.gain.exponentialRampToValueAtTime(.001,t+.018),s.connect(a),a.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.02),this._playNoiseBurst(e,.03,.01)}_playThock(e,t){const s=e.createOscillator(),n=e.createGain();s.type="sine",s.frequency.setValueAtTime(280,t),s.frequency.exponentialRampToValueAtTime(80,t+.04),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.07,t+.002),n.gain.exponentialRampToValueAtTime(.001,t+.035),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.04)}_playBip(e,t){const s=e.createOscillator(),n=e.createGain();s.type="square",s.frequency.setValueAtTime(2200,t),s.frequency.exponentialRampToValueAtTime(1800,t+.015),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.04,t+.001),n.gain.exponentialRampToValueAtTime(.001,t+.02),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.025)}playBackspace(){this._playOrQueue(e=>{try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="triangle",s.frequency.setValueAtTime(350,t),s.frequency.exponentialRampToValueAtTime(120,t+.035),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.065,t+.002),n.gain.exponentialRampToValueAtTime(.001,t+.04),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.05),this._playNoiseBurst(e,.025,.008)}catch{}})}_playNoiseBurst(e,t,s){try{const n=e.currentTime,a=Math.floor(e.sampleRate*s),r=e.createBuffer(1,a,e.sampleRate),l=r.getChannelData(0);for(let p=0;p<l.length;p++)l[p]=(Math.random()*2-1)*.3;const o=e.createBufferSource(),c=e.createGain(),u=e.createBiquadFilter();u.type="highpass",u.frequency.setValueAtTime(2500,n),o.buffer=r,c.gain.setValueAtTime(t,n),c.gain.exponentialRampToValueAtTime(.001,n+s),o.connect(u),u.connect(c),c.connect(e.destination),o.start(n)}catch{}}playEnter(){this._playOrQueue(e=>{try{const t=e.currentTime,s=e.createOscillator(),n=e.createOscillator(),a=e.createGain();s.type="square",n.type="square",s.frequency.setValueAtTime(800,t),s.frequency.setValueAtTime(1e3,t+.05),n.frequency.setValueAtTime(1200,t),n.frequency.setValueAtTime(1500,t+.05),a.gain.setValueAtTime(0,t),a.gain.linearRampToValueAtTime(.07,t+.01),a.gain.setValueAtTime(.05,t+.05),a.gain.exponentialRampToValueAtTime(.001,t+.12),s.connect(a),n.connect(a),a.connect(e.destination),s.start(t),n.start(t),s.stop(t+.12),n.stop(t+.12)}catch{}})}playError(){this._playOrQueue(e=>{try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(180,t),s.frequency.linearRampToValueAtTime(100,t+.12),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.1,t+.01),n.gain.exponentialRampToValueAtTime(.001,t+.12),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.12)}catch{}})}playBootBeep(){this._playOrQueue(e=>{try{const t=e.currentTime,s=e.createOscillator(),n=e.createGain();s.type="square",s.frequency.setValueAtTime(600+Math.random()*200,t),n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.04,t+.003),n.gain.exponentialRampToValueAtTime(.001,t+.03),s.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.03)}catch{}},!0)}destroy(){this._removeInteractionListeners(),this.audioContext&&(this.audioContext.close().catch(()=>{}),this.audioContext=null)}}const y=new D;class N{constructor(e,t){this.container=e,this.onComplete=t,this.stage=0,this.lines=[],this.isRunning=!1,this.waitingForKey=!1,this.timers=[],this.intervals=[],this.audioContext=null,this.audioEnabled=!0,this.elements={},this._handleKeyPress=this._handleKeyPress.bind(this),this.bootMessages=[{text:"BIOS v3.14.159 - GitHub Stats Terminal",delay:100},{text:"Copyright (c) 2025 Retro Systems Inc.",delay:50},{text:"",delay:200},{text:"Detecting hardware...",delay:300},{text:"  CPU: RetroCore 8086 @ 4.77MHz.......... OK",delay:150},{text:"  RAM: 640KB conventional memory......... OK",delay:120},{text:"  GPU: CRT Phosphor Display.............. OK",delay:100},{text:"  NET: Dial-up Modem 56K................. OK",delay:180},{text:"",delay:100},{text:"Loading kernel modules...",delay:250},{text:"  [████████████████████████] 100%",delay:400},{text:"",delay:100},{text:"Initializing GitHub API connection...",delay:300},{text:"  Establishing secure tunnel............. OK",delay:200},{text:"  Authenticating......................... OK",delay:150},{text:"",delay:200}],this.asciiLogo=`
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
       ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝`}start(){this.isRunning||(this.isRunning=!0,document.body.classList.add("boot-active"),this._render(),this._startCursorBlink(),this._startGlitchEffect(),this._runBootSequence())}destroy(){this.isRunning=!1,this.waitingForKey=!1,document.body.classList.remove("boot-active"),this.timers.forEach(e=>clearTimeout(e)),this.timers=[],this.intervals.forEach(e=>clearInterval(e)),this.intervals=[],document.removeEventListener("keydown",this._handleKeyPress),this.audioContext&&(this.audioContext.close().catch(()=>{}),this.audioContext=null)}_render(){this._injectBlinkStyle();const e="SYSTEM READY - Press any key to continue...",t="─".repeat(e.length);this.container.innerHTML=`
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
            <pre class="text-accent text-glow text-xs sm:text-base md:text-lg font-pixel whitespace-pre" style="text-shadow: 0 0 8px hsl(60 100% 50% / 0.6);">${t}</pre>
            <p id="ready-text" class="text-foreground text-glow text-xs sm:text-base md:text-lg py-0.5 terminal-blink font-pixel whitespace-pre">${e}</p>
            <pre class="text-accent text-glow text-xs sm:text-base md:text-lg font-pixel whitespace-pre" style="text-shadow: 0 0 8px hsl(60 100% 50% / 0.6);">${t}</pre>
          </div>
        </div>
      </div>
    `,this.elements={container:this.container.querySelector(".terminal-boot"),powerFlash:this.container.querySelector("#power-flash"),bootLines:this.container.querySelector("#boot-lines"),cursor:this.container.querySelector("#boot-cursor"),asciiLogo:this.container.querySelector("#ascii-logo"),systemReady:this.container.querySelector("#system-ready"),readyText:this.container.querySelector("#ready-text")}}_injectBlinkStyle(){if(document.getElementById("terminal-blink-style"))return;const e=document.createElement("style");e.id="terminal-blink-style",e.textContent=`
      @keyframes terminal-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .terminal-blink {
        animation: terminal-blink 1s step-end infinite;
      }
    `,document.head.appendChild(e)}_runBootSequence(){this._advanceStage()}_advanceStage(){switch(this.stage){case 0:this._addTimer(()=>{this.stage=1,this._advanceStage()},500);break;case 1:this._hidePowerFlash(),this._showBootLines(),this._typeBootMessages();break;case 2:this._playEnterSound(),this._hideCursor(),this._showAsciiLogo(),this._addTimer(()=>{this.stage=3,this._advanceStage()},1500);break;case 3:this._playEnterSound(),this._showSystemReady(),this._waitForKeyPress();break}}_typeBootMessages(){let e=0;this.bootMessages.forEach((t,s)=>{e+=t.delay,this._addTimer(()=>{t.text&&y.playBootBeep(),this._addBootLine(t.text),s===this.bootMessages.length-1&&this._addTimer(()=>{this.stage=2,this._advanceStage()},300)},e)})}_addBootLine(e){const t=document.createElement("p");t.className="text-foreground text-glow whitespace-pre",t.textContent=e,this.elements.bootLines.appendChild(t),this.lines.push(t)}_startCursorBlink(){let e=!0;const t=setInterval(()=>{this.isRunning&&(e=!e,this.elements.cursor&&(this.elements.cursor.style.opacity=e?"1":"0"))},530);this.intervals.push(t)}_startGlitchEffect(){const e=setInterval(()=>{this.isRunning&&Math.random()>.95&&this._triggerGlitch()},2e3);this.intervals.push(e)}_triggerGlitch(){const e=this.elements.container;if(!e)return;e.style.opacity="0.95",e.style.transform="translateX(1px)";const t=30+Math.random()*50;this._addTimer(()=>{e.style.opacity="1",e.style.transform="translateX(0)"},t)}_getAudioContext(){if(!this.audioEnabled)return null;try{return this.audioContext||(this.audioContext=new(window.AudioContext||window.webkitAudioContext)),this.audioContext.state==="suspended"&&this.audioContext.resume().catch(()=>{this.audioEnabled=!1}),this.audioContext}catch{return this.audioEnabled=!1,null}}_playEnterSound(){const e=this._getAudioContext();if(e)try{const t=e.currentTime,s=e.createOscillator(),n=e.createOscillator(),a=e.createGain();s.type="square",n.type="square",s.frequency.setValueAtTime(600,t),n.frequency.setValueAtTime(900,t),a.gain.setValueAtTime(0,t),a.gain.linearRampToValueAtTime(.1,t+.01),a.gain.exponentialRampToValueAtTime(.001,t+.15),s.connect(a),n.connect(a),a.connect(e.destination),s.start(t),n.start(t),s.stop(t+.15),n.stop(t+.15)}catch{}}_waitForKeyPress(){this.waitingForKey=!0,document.addEventListener("keydown",this._handleKeyPress)}_handleKeyPress(e){this.waitingForKey&&(!e.key.startsWith("F")&&e.key!=="Escape"&&e.preventDefault(),this.waitingForKey=!1,document.removeEventListener("keydown",this._handleKeyPress),this._playEnterSound(),this._addTimer(()=>{this.destroy(),this.onComplete&&this.onComplete()},200))}_hidePowerFlash(){var e;(e=this.elements.powerFlash)==null||e.classList.add("hidden")}_showBootLines(){var e,t;(e=this.elements.bootLines)==null||e.classList.remove("hidden"),(t=this.elements.cursor)==null||t.classList.remove("hidden")}_hideCursor(){var e;(e=this.elements.cursor)==null||e.classList.add("hidden")}_showAsciiLogo(){var e;(e=this.elements.asciiLogo)==null||e.classList.remove("hidden")}_showSystemReady(){var e;(e=this.elements.systemReady)==null||e.classList.remove("hidden")}_addTimer(e,t){const s=setTimeout(e,t);return this.timers.push(s),s}}const z=/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;function U(i){if(!i||i.trim()==="")return{valid:!1,error:"Username cannot be empty"};const e=i.trim();return e.length>39?{valid:!1,error:"Username must be 39 characters or less"}:e.startsWith("-")?{valid:!1,error:"Username cannot start with a hyphen"}:e.endsWith("-")?{valid:!1,error:"Username cannot end with a hyphen"}:e.includes("--")?{valid:!1,error:"Username cannot have consecutive hyphens"}:z.test(e)?{valid:!0,error:null}:{valid:!1,error:"Username can only contain letters, numbers, and single hyphens"}}const v=3e3,T="toast-container",C=document.createElement("style");C.textContent=`
  #toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }
  .toast {
    padding: 12px 24px;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 1.125rem;
    animation: toast-slide-in 0.3s ease-out;
    pointer-events: auto;
    max-width: 400px;
    word-wrap: break-word;
  }
  .toast-success {
    background: hsl(180 100% 15%);
    color: hsl(180 100% 50%);
    border: 1px solid hsl(180 100% 50%);
    box-shadow: 0 0 10px hsl(180 100% 50% / 0.3);
  }
  .toast-error {
    background: hsl(0 100% 15%);
    color: hsl(0 100% 70%);
    border: 1px solid hsl(0 100% 50%);
    box-shadow: 0 0 10px hsl(0 100% 50% / 0.3);
  }
  .toast-info {
    background: hsl(60 100% 15%);
    color: hsl(60 100% 50%);
    border: 1px solid hsl(60 100% 50%);
    box-shadow: 0 0 10px hsl(60 100% 50% / 0.3);
  }
  .toast-exit {
    animation: toast-slide-out 0.3s ease-in forwards;
  }
  @keyframes toast-slide-in {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes toast-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
`;document.head.appendChild(C);function j(){let i=document.getElementById(T);return i||(i=document.createElement("div"),i.id=T,document.body.appendChild(i)),i}function _(i,e="info",t=v){const s=j(),n=document.createElement("div");return n.className=`toast toast-${e}`,n.textContent=i,n.setAttribute("role","alert"),s.appendChild(n),setTimeout(()=>{n.classList.add("toast-exit"),setTimeout(()=>n.remove(),300)},t),n.addEventListener("click",()=>{n.classList.add("toast-exit"),setTimeout(()=>n.remove(),300)}),n}const k={success(i,e=v){return _(i,"success",e)},error(i,e=v){return _(i,"error",e)},info(i,e=v){return _(i,"info",e)},clear(){const i=document.getElementById(T);i&&(i.innerHTML="")}};class W{constructor(e,t){this.container=e,this.onSubmit=t,this.value="",this.isLoading=!1,this.isFocused=!1,this.elements={},this._handleInput=this._handleInput.bind(this),this._handleKeyDown=this._handleKeyDown.bind(this),this._handleFocus=this._handleFocus.bind(this),this._handleBlur=this._handleBlur.bind(this),this._handleWrapperClick=this._handleWrapperClick.bind(this),this._handleSubmit=this._handleSubmit.bind(this)}mount(){this._render(),this._attachEventListeners(),this._focusInput()}destroy(){this._detachEventListeners()}setLoading(e){this.isLoading=e,this.elements.input&&(this.elements.input.disabled=e),this.elements.loadingText&&this.elements.loadingText.classList.toggle("hidden",!e),this.elements.cursor&&this.elements.cursor.classList.toggle("hidden",e)}focus(){this._focusInput()}_render(){this.container.innerHTML=`
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
    `,this.elements={form:this.container.querySelector("#terminal-form"),input:this.container.querySelector("#username-input"),inputContainer:this.container.querySelector("#input-container"),cursor:this.container.querySelector("#cursor"),loadingText:this.container.querySelector("#loading-text")},this._injectCursorStyles()}_injectCursorStyles(){if(document.getElementById("terminal-input-styles"))return;const e=document.createElement("style");e.id="terminal-input-styles",e.textContent=`
      .cursor-block { animation: cursor-blink 1s step-end infinite; }
      .cursor-block.hidden { display: none; }
      @keyframes cursor-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      #username-input:disabled { opacity: 0.7; }
    `,document.head.appendChild(e)}_attachEventListeners(){const{form:e,input:t}=this.elements,s=this.container.querySelector(".terminal-input-wrapper");e==null||e.addEventListener("submit",this._handleSubmit),t==null||t.addEventListener("input",this._handleInput),t==null||t.addEventListener("keydown",this._handleKeyDown),t==null||t.addEventListener("focus",this._handleFocus),t==null||t.addEventListener("blur",this._handleBlur),s==null||s.addEventListener("click",this._handleWrapperClick)}_detachEventListeners(){const{form:e,input:t}=this.elements,s=this.container.querySelector(".terminal-input-wrapper");e==null||e.removeEventListener("submit",this._handleSubmit),t==null||t.removeEventListener("input",this._handleInput),t==null||t.removeEventListener("keydown",this._handleKeyDown),t==null||t.removeEventListener("focus",this._handleFocus),t==null||t.removeEventListener("blur",this._handleBlur),s==null||s.removeEventListener("click",this._handleWrapperClick)}_handleInput(e){this.value=e.target.value,this._updateCursorPosition()}_handleKeyDown(e){const t=["Shift","Control","Alt","Meta","CapsLock","Tab","Escape"],s=e.key.startsWith("F")&&e.key.length<=3;t.includes(e.key)||s||(e.key==="Backspace"||e.key==="Delete"?this._playBackspaceSound():e.key!=="Enter"&&this._playTypingSound())}_handleFocus(){this.isFocused=!0,this.elements.cursor&&(this.elements.cursor.style.animationPlayState="running")}_handleBlur(){this.isFocused=!1,this.elements.cursor&&(this.elements.cursor.style.animationPlayState="paused",this.elements.cursor.style.opacity="1"),this.isLoading||setTimeout(()=>this._focusInput(),10)}_handleWrapperClick(e){this.isLoading||this._focusInput()}_handleSubmit(e){if(e.preventDefault(),this.isLoading)return;const t=this.value.trim(),s=U(t);if(!s.valid){this._playErrorSound(),k.error(s.error);return}this._playEnterSound(),this.onSubmit&&this.onSubmit(t)}_focusInput(){var e;(e=this.elements.input)==null||e.focus()}_updateCursorPosition(){if(!this.elements.cursor||!this.elements.input)return;const e=document.createElement("span");e.style.cssText="position: absolute; visibility: hidden; white-space: pre; font-family: 'VT323', monospace; font-size: 1.25rem; letter-spacing: 0.025em;",e.textContent=this.value||"",document.body.appendChild(e);const t=e.offsetWidth;document.body.removeChild(e),this.elements.cursor.style.left=`${t}px`}_playTypingSound(){y.playTyping()}_playBackspaceSound(){y.playBackspace()}_playEnterSound(){y.playEnter()}_playErrorSound(){y.playError()}}class X{constructor(e,t,s){this.container=e,this.stats=t,this.onBack=s,this.elements={},this._handleBack=this._handleBack.bind(this),this._handleAvatarError=this._handleAvatarError.bind(this),this._handleKeyDown=this._handleKeyDown.bind(this),this.avatarFallbackLevel=0}mount(){this._render(),this._attachEventListeners()}destroy(){this._detachEventListeners()}_formatNumber(e){return e==null?"N/A":new Intl.NumberFormat().format(e)}_formatAccountAge(e){if(!e)return"N/A";const t=new Date(e),n=new Date-t,a=Math.floor(n/(1e3*60*60*24)),r=Math.floor(a/365),l=Math.floor(a%365/30);return r>0&&l>0?`${r}y ${l}m`:r>0?`${r}y`:l>0?`${l}m`:`${a}d`}_isNA(e){return e==null}_statRowHtml(e,t,s=!1){const n=this._isNA(t),a=n?"N/A":this._formatNumber(t);return`
      <div class="flex justify-between items-center text-lg md:text-xl py-0.5">
        <span class="${s?"text-secondary text-glow-subtle":"text-primary text-glow-subtle"}">${e}</span>
        <span class="${n?"text-muted-foreground opacity-70":"text-foreground text-glow font-bold"}">${a}</span>
      </div>
    `}_sectionHeaderHtml(e){return`
      <div class="border-t border-dashed border-muted mt-3 pt-2 mb-1">
        <span class="text-muted-foreground text-base font-pixel uppercase tracking-wider">${e}</span>
      </div>
    `}_getAvatarUrl(){const{username:e,avatarUrl:t}=this.stats;switch(this.avatarFallbackLevel){case 0:return t||`https://github.com/${e}.png`;case 1:return`https://github.com/${e}.png`;default:return null}}_getInitials(e){return e.substring(0,2).toUpperCase()}_getAvatarColor(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 40%)`}_render(){const{username:e,name:t,createdAt:s,location:n,followers:a,following:r,publicRepos:l,totalStars:o,recentCommits:c,recentPRs:u,recentIssues:p,recentWindowLabel:S,topLanguages:b,rank:R}=this.stats,A=this._getAvatarUrl(),B=this._formatAccountAge(s),I=t!==e?`${t} (@${e})`:`@${e}`,$=b&&b.length>0?b.join(", "):"None",V=n||"Not specified";this.container.innerHTML=`
      <div class="stats-card-wrapper min-h-screen flex items-center justify-center bg-background p-4">
        <div class="fixed inset-0 scanlines pointer-events-none z-20 opacity-30"></div>
        <div class="fixed inset-0 pointer-events-none z-10" style="background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%);"></div>
        <div class="w-full max-w-2xl relative z-0">
          <div class="relative p-1 rounded-sm rainbow-border animate-glow-pulse">
            <div class="relative bg-background p-1">
              <div class="border-2 border-primary box-glow rounded-sm overflow-hidden">
                <div class="relative bg-background p-4 md:p-6">
                  <div class="absolute inset-0 scanlines pointer-events-none z-10 opacity-20"></div>
                  <div>
                    <div class="mb-4 border-b border-dashed border-primary pb-2 flex items-center justify-between">
                      <div>
                        <h2 class="text-xl md:text-2xl text-foreground text-glow font-pixel">${I}</h2>
                        <span class="text-muted-foreground text-sm font-pixel">Member for ${B}</span>
                        <span class="text-secondary text-glow-subtle text-sm font-pixel ml-2">📍 ${V}</span>
                      </div>
                      <div class="flex gap-3">
                        <a href="https://github.com/${e}" target="_blank" rel="noopener noreferrer" class="text-primary text-glow text-lg font-pixel hover:text-accent transition-colors cursor-pointer">[PROFILE]</a>
                        <button id="back-btn" class="text-secondary text-glow text-lg font-pixel hover:text-accent transition-colors cursor-pointer">[BACK]</button>
                      </div>
                    </div>
                    <div class="flex gap-6 md:gap-8">
                      <div class="flex-1 space-y-0 font-pixel">
                        ${this._sectionHeaderHtml("Social & Repos (Accurate)")}
                        ${this._statRowHtml("Followers:",a)}
                        ${this._statRowHtml("Following:",r)}
                        ${this._statRowHtml("Public Repos:",l)}
                        
                        ${this._sectionHeaderHtml("Stars Earned (Accurate)")}
                        ${this._statRowHtml("Total Stars:",o)}
                        
                        ${this._sectionHeaderHtml("Recent Activity (~100 events)")}
                        ${this._statRowHtml("Recent Commits:",c,!0)}
                        ${this._statRowHtml("Recent PRs:",u,!0)}
                        ${this._statRowHtml("Recent Issues:",p,!0)}
                        
                        ${this._sectionHeaderHtml("Top Languages (by repo size)")}
                        <div class="flex justify-between items-center text-lg md:text-xl py-0.5">
                          <span class="text-primary text-glow-subtle">Languages:</span>
                          <span class="text-foreground text-glow font-bold">${$}</span>
                        </div>
                        
                        <div class="border-t border-dashed border-accent mt-3 pt-2">
                          <div class="flex justify-between items-center text-xl md:text-2xl">
                            <span class="text-foreground text-glow">Rank:</span>
                            <span class="text-accent text-glow font-bold text-2xl md:text-3xl animate-pulse">${R}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-start justify-center pt-2">
                        <div id="avatar-container" class="relative w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-primary box-glow">
                          ${A?`<img id="avatar-img" src="${A}" alt="${e}'s Avatar" class="w-full h-full object-cover" />`:this._renderInitialsAvatar(e)}
                        </div>
                      </div>
                    </div>
                    <div class="mt-4 pt-2 border-t border-dashed border-muted">
                      <p class="text-muted-foreground text-sm font-pixel">* ${S||"Recent stats from last ~100 public events"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,this.elements={backBtn:this.container.querySelector("#back-btn"),avatarImg:this.container.querySelector("#avatar-img"),avatarContainer:this.container.querySelector("#avatar-container")}}_renderInitialsAvatar(e){const t=this._getInitials(e);return`
      <div class="w-full h-full flex items-center justify-center font-pixel text-2xl md:text-3xl text-foreground text-glow" style="background: ${this._getAvatarColor(e)};">
        ${t}
      </div>
    `}_attachEventListeners(){var e,t;(e=this.elements.backBtn)==null||e.addEventListener("click",this._handleBack),(t=this.elements.avatarImg)==null||t.addEventListener("error",this._handleAvatarError),document.addEventListener("keydown",this._handleKeyDown)}_detachEventListeners(){var e,t;(e=this.elements.backBtn)==null||e.removeEventListener("click",this._handleBack),(t=this.elements.avatarImg)==null||t.removeEventListener("error",this._handleAvatarError),document.removeEventListener("keydown",this._handleKeyDown)}_handleBack(){this.onBack&&this.onBack()}_handleKeyDown(e){e.key==="Escape"&&this._handleBack()}_handleAvatarError(){this.avatarFallbackLevel++;const e=this._getAvatarUrl();if(e)this.elements.avatarImg.src=e;else{const t=this._renderInitialsAvatar(this.stats.username);this.elements.avatarContainer.innerHTML=t}}}const g=document.getElementById("root");let h=null;async function Q(i){m({isLoading:!0,error:null});try{const e=await G(i);m({stats:e,view:"stats",isLoading:!1}),k.success(`Loaded stats for ${e.username}`)}catch(e){const t=e instanceof Error?e.message:"Failed to fetch stats";m({error:t,isLoading:!1}),k.error(t),console.error("Error:",e)}}function Z(){m({stats:null,view:"input"})}function Y(){m({view:"input"})}function L(i){switch(h&&(h(),h=null),g.innerHTML="",i.view){case"boot":const e=new N(g,Y);e.start(),h=()=>e.destroy();break;case"input":{const t=new W(g,Q);t.mount();const s=E(n=>{t.setLoading(n.isLoading)});h=()=>{s(),t.destroy()};break}case"stats":{if(!i.stats){m({view:"input"});return}const t=new X(g,i.stats,Z);t.mount(),h=()=>t.destroy();break}default:console.error("Unknown view:",i.view)}}E(i=>{L(i)});L(H());console.log("GitHub Stats Terminal loaded!");
