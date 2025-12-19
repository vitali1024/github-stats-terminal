# GitHub Stats Terminal

Retro terminal-style GitHub statistics viewer.

## ✨ Features

- Boot sequence with ASCII art and typing sounds
- GitHub stats via public REST API (no auth required)
- Profile, followers, stars, recent activity, top languages
- Responsive retro CRT-style UI with glowing effects
- Press `Escape` to go back, `[PROFILE]` to visit GitHub

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Vite | Build tool & dev server |
| Vanilla JS | No framework dependencies |
| Tailwind CSS | Utility-first styling |
| Web Audio API | Synthesized sound effects |

## 📡 API Implementation

Uses the **public GitHub REST API** (60 requests/hour, no authentication):

```
GET /users/{username}         → Profile & social stats
GET /users/{username}/repos   → Stars & top languages
GET /users/{username}/events  → Recent commits, PRs, issues
```

## ⚠️ Error Handling

| Status | Response |
|--------|----------|
| 404 | "User not found" toast |
| 403 | Rate limit message with retry time |
| Network | Connection error with retry suggestion |

## 🚀 Quick Start

```bash
git clone https://github.com/vitali1024/github-stats-terminal.git
cd github-stats-terminal
npm install
npm run dev
```
