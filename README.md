# GitHub Stats Terminal

A retro terminal-style GitHub statistics viewer built with vanilla JavaScript, featuring a CRT boot sequence, mechanical keyboard sounds, and glowing neon aesthetics.

![GitHub Stats Terminal](https://img.shields.io/badge/version-1.0.0-cyan)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Boot Sequence** – Authentic terminal boot animation with ASCII art and per-line typing sounds
- **GitHub Stats** – Fetches data via public REST API (no authentication required)
- **Profile Display** – Name, username, avatar, location, and account age
- **Social Stats** – Followers, following, public repos count
- **Stars Earned** – Total stars across all public repositories
- **Recent Activity** – Commits, PRs, and issues from last ~100 events
- **Top Languages** – Top 3 programming languages by repository size
- **Rank System** – Score-based tier ranking (S+ to C)
- **Retro CRT UI** – Scanlines, vignette, glow effects, rainbow borders
- **Sound Effects** – Click-thock-bip keyboard sounds, boot beeps, error tones
- **Keyboard Navigation** – Press `Escape` to go back from stats view
- **Direct Profile Link** – Click `[PROFILE]` to visit the GitHub profile

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Vite | Build tool & dev server |
| Vanilla JS | No framework dependencies |
| Tailwind CSS | Utility-first styling |
| Web Audio API | Synthesized sound effects |
| GitHub REST API | Public data fetching |

## 📡 API Implementation

The app uses the **public GitHub REST API** (no authentication required, 60 requests/hour limit).

### Endpoints Used

```
GET /users/{username}           → Profile, social stats, repo count
GET /users/{username}/repos     → Stars & languages (per_page=100)
GET /users/{username}/events    → Recent activity (per_page=100)
```

### Data Flow

```
fetchGitHubStats(username)
├── 1. Fetch user profile        → name, avatar, location, created_at
├── 2. Fetch repositories        → sum stars, compute top languages
├── 3. Fetch public events       → count commits, PRs, issues
└── Return normalized stats object
```

### Stats Object Structure

```javascript
{
  username,           // GitHub login
  name,               // Display name
  avatarUrl,          // Profile image URL
  createdAt,          // Account creation date
  location,           // User location (nullable)
  followers,          // Follower count
  following,          // Following count
  publicRepos,        // Public repository count
  totalStars,         // Sum of stars across repos
  recentCommits,      // Commits from recent events (nullable)
  recentPRs,          // PRs from recent events (nullable)
  recentIssues,       // Issues from recent events (nullable)
  recentWindowLabel,  // "Recent (last ~100 events)"
  topLanguages,       // Array of top 3 languages
  rank                // Calculated tier (S+, S, A+, A, B+, B, C+, C)
}
```

### Error Handling

| Status | Handling |
|--------|----------|
| 404 | "User not found" toast message |
| 403 | Rate limit message with retry time |
| Network | Connection error with retry suggestion |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/github-stats-terminal.git
cd github-stats-terminal

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
github-stats-terminal/
├── src/
│   ├── app/state.js           # Simple state management
│   ├── lib/
│   │   ├── sounds.js          # Web Audio sound synthesis
│   │   └── utils.js           # Utility functions
│   ├── services/
│   │   └── githubStats.js     # GitHub API client
│   ├── ui/
│   │   ├── StatsCard.js       # Stats display component
│   │   ├── TerminalBoot.js    # Boot sequence component
│   │   ├── TerminalInput.js   # Username input component
│   │   └── Toast.js           # Notification component
│   ├── utils/validators.js    # Input validation
│   ├── index.css              # Global styles & CSS vars
│   └── main.js                # App entry point
├── public/
│   ├── favicon.svg            # Terminal icon
│   └── robots.txt             # SEO config
├── index.html                 # HTML entry
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind theme
└── package.json               # Dependencies
```

## 🎨 Customization

### Color Theme

Edit CSS variables in `src/index.css`:

```css
:root {
  --foreground: 180 100% 50%;    /* Cyan text */
  --primary: 180 100% 50%;        /* Cyan accents */
  --secondary: 300 100% 50%;      /* Magenta */
  --accent: 60 100% 50%;          /* Yellow */
}
```

### Sound Effects

Modify sound synthesis in `src/lib/sounds.js`:
- `playTyping()` – Keyboard click-thock-bip
- `playBackspace()` – Backspace sound
- `playEnter()` – Submit confirmation
- `playError()` – Error alert
- `playBootBeep()` – Boot line beep

## 📜 License

MIT License – feel free to use, modify, and distribute.

---

Built with 💚 and retro vibes
