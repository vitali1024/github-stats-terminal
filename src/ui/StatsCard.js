export class StatsCard {
  constructor(container, stats, onBack) {
    this.container = container;
    this.stats = stats;
    this.onBack = onBack;
    this.elements = {};
    this._handleBack = this._handleBack.bind(this);
    this._handleAvatarError = this._handleAvatarError.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.avatarFallbackLevel = 0;
  }

  mount() {
    this._render();
    this._attachEventListeners();
  }

  destroy() {
    this._detachEventListeners();
  }

  _formatNumber(value) {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat().format(value);
  }

  _formatAccountAge(createdAt) {
    if (!createdAt) return "N/A";
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years > 0 && months > 0) return `${years}y ${months}m`;
    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}m`;
    return `${diffDays}d`;
  }

  _isNA(value) {
    return value === null || value === undefined;
  }

  _statRowHtml(label, value, isRecent = false) {
    const isNA = this._isNA(value);
    const displayValue = isNA ? "N/A" : this._formatNumber(value);
    const valueClass = isNA ? "text-muted-foreground opacity-70" : "text-foreground text-glow font-bold";
    const labelClass = isRecent ? "text-secondary text-glow-subtle" : "text-primary text-glow-subtle";
    return `
      <div class="flex justify-between items-center text-lg md:text-xl py-0.5">
        <span class="${labelClass}">${label}</span>
        <span class="${valueClass}">${displayValue}</span>
      </div>
    `;
  }

  _sectionHeaderHtml(title) {
    return `
      <div class="border-t border-dashed border-muted mt-3 pt-2 mb-1">
        <span class="text-muted-foreground text-base font-pixel uppercase tracking-wider">${title}</span>
      </div>
    `;
  }

  _getAvatarUrl() {
    const { username, avatarUrl } = this.stats;
    switch (this.avatarFallbackLevel) {
      case 0:
        return avatarUrl || `https://github.com/${username}.png`;
      case 1:
        return `https://github.com/${username}.png`;
      default:
        return null;
    }
  }

  _getInitials(username) {
    return username.substring(0, 2).toUpperCase();
  }

  _getAvatarColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 40%)`;
  }

  _render() {
    const {
      username, name, createdAt, location,
      followers, following, publicRepos,
      totalStars,
      recentCommits, recentPRs, recentIssues, recentWindowLabel,
      topLanguages,
      rank
    } = this.stats;

    const avatar = this._getAvatarUrl();
    const accountAge = this._formatAccountAge(createdAt);
    const displayName = name !== username ? `${name} (@${username})` : `@${username}`;
    const langDisplay = topLanguages && topLanguages.length > 0 ? topLanguages.join(", ") : "None";
    const locationDisplay = location || "Not specified";

    this.container.innerHTML = `
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
                        <h2 class="text-xl md:text-2xl text-foreground text-glow font-pixel">${displayName}</h2>
                        <span class="text-muted-foreground text-sm font-pixel">Member for ${accountAge}</span>
                        <span class="text-secondary text-glow-subtle text-sm font-pixel ml-2">📍 ${locationDisplay}</span>
                      </div>
                      <div class="flex gap-3">
                        <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="text-primary text-glow text-lg font-pixel hover:text-accent transition-colors cursor-pointer">[PROFILE]</a>
                        <button id="back-btn" class="text-secondary text-glow text-lg font-pixel hover:text-accent transition-colors cursor-pointer">[BACK]</button>
                      </div>
                    </div>
                    <div class="flex gap-6 md:gap-8">
                      <div class="flex-1 space-y-0 font-pixel">
                        ${this._sectionHeaderHtml("Social & Repos (Accurate)")}
                        ${this._statRowHtml("Followers:", followers)}
                        ${this._statRowHtml("Following:", following)}
                        ${this._statRowHtml("Public Repos:", publicRepos)}
                        
                        ${this._sectionHeaderHtml("Stars Earned (Accurate)")}
                        ${this._statRowHtml("Total Stars:", totalStars)}
                        
                        ${this._sectionHeaderHtml("Recent Activity (~100 events)")}
                        ${this._statRowHtml("Recent Commits:", recentCommits, true)}
                        ${this._statRowHtml("Recent PRs:", recentPRs, true)}
                        ${this._statRowHtml("Recent Issues:", recentIssues, true)}
                        
                        ${this._sectionHeaderHtml("Top Languages (by repo size)")}
                        <div class="flex justify-between items-center text-lg md:text-xl py-0.5">
                          <span class="text-primary text-glow-subtle">Languages:</span>
                          <span class="text-foreground text-glow font-bold">${langDisplay}</span>
                        </div>
                        
                        <div class="border-t border-dashed border-accent mt-3 pt-2">
                          <div class="flex justify-between items-center text-xl md:text-2xl">
                            <span class="text-foreground text-glow">Rank:</span>
                            <span class="text-accent text-glow font-bold text-2xl md:text-3xl animate-pulse">${rank}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-start justify-center pt-2">
                        <div id="avatar-container" class="relative w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-primary box-glow">
                          ${avatar
        ? `<img id="avatar-img" src="${avatar}" alt="${username}'s Avatar" class="w-full h-full object-cover" />`
        : this._renderInitialsAvatar(username)}
                        </div>
                      </div>
                    </div>
                    <div class="mt-4 pt-2 border-t border-dashed border-muted">
                      <p class="text-muted-foreground text-sm font-pixel">* ${recentWindowLabel || "Recent stats from last ~100 public events"}</p>
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
      backBtn: this.container.querySelector("#back-btn"),
      avatarImg: this.container.querySelector("#avatar-img"),
      avatarContainer: this.container.querySelector("#avatar-container"),
    };
  }

  _renderInitialsAvatar(username) {
    const initials = this._getInitials(username);
    const bgColor = this._getAvatarColor(username);
    return `
      <div class="w-full h-full flex items-center justify-center font-pixel text-2xl md:text-3xl text-foreground text-glow" style="background: ${bgColor};">
        ${initials}
      </div>
    `;
  }

  _attachEventListeners() {
    this.elements.backBtn?.addEventListener("click", this._handleBack);
    this.elements.avatarImg?.addEventListener("error", this._handleAvatarError);
    document.addEventListener("keydown", this._handleKeyDown);
  }

  _detachEventListeners() {
    this.elements.backBtn?.removeEventListener("click", this._handleBack);
    this.elements.avatarImg?.removeEventListener("error", this._handleAvatarError);
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  _handleBack() {
    if (this.onBack) {
      this.onBack();
    }
  }

  _handleKeyDown(event) {
    if (event.key === "Escape") {
      this._handleBack();
    }
  }

  _handleAvatarError() {
    this.avatarFallbackLevel++;
    const nextUrl = this._getAvatarUrl();
    if (nextUrl) {
      this.elements.avatarImg.src = nextUrl;
    } else {
      const initialsHtml = this._renderInitialsAvatar(this.stats.username);
      this.elements.avatarContainer.innerHTML = initialsHtml;
    }
  }
}

export default StatsCard;
