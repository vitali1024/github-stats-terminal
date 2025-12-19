const GITHUB_API_BASE = "https://api.github.com";
const USER_AGENT = "GitHub-Stats-Terminal/1.0";

class GitHubApiError extends Error {
    constructor(message, status, type) {
        super(message);
        this.name = "GitHubApiError";
        this.status = status;
        this.type = type;
    }
}

async function githubFetch(endpoint) {
    const url = `${GITHUB_API_BASE}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": USER_AGENT,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new GitHubApiError(
                    "User not found. Please check the username and try again.",
                    404,
                    "not_found"
                );
            }

            if (response.status === 403) {
                const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
                if (rateLimitRemaining === "0") {
                    const resetTime = response.headers.get("X-RateLimit-Reset");
                    const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
                    const waitMinutes = resetDate
                        ? Math.ceil((resetDate.getTime() - Date.now()) / 60000)
                        : "a few";

                    throw new GitHubApiError(
                        `GitHub API rate limit exceeded. Please try again in ${waitMinutes} minutes.`,
                        403,
                        "rate_limit"
                    );
                }

                throw new GitHubApiError(
                    "Access forbidden. The GitHub API may be temporarily unavailable.",
                    403,
                    "forbidden"
                );
            }

            throw new GitHubApiError(
                `GitHub API error (${response.status}). Please try again later.`,
                response.status,
                "unknown"
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof GitHubApiError) {
            throw error;
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new GitHubApiError(
                "Network error. Please check your connection and try again.",
                0,
                "network"
            );
        }

        throw new GitHubApiError(
            "An unexpected error occurred. Please try again.",
            0,
            "unknown"
        );
    }
}

function parseEvents(events) {
    let commits = 0;
    let prs = 0;
    let issues = 0;

    if (!Array.isArray(events)) {
        return { commits: 0, prs: 0, issues: 0 };
    }

    for (const event of events) {
        switch (event.type) {
            case "PushEvent":
                commits += event.payload?.commits?.length || 0;
                break;
            case "PullRequestEvent":
                if (event.payload?.action === "opened") {
                    prs++;
                }
                break;
            case "IssuesEvent":
                if (event.payload?.action === "opened") {
                    issues++;
                }
                break;
        }
    }

    return { commits, prs, issues };
}

function computeTopLanguages(repos) {
    if (!Array.isArray(repos) || repos.length === 0) {
        return [];
    }

    const langCount = {};
    for (const repo of repos) {
        const lang = repo.language;
        if (lang) {
            langCount[lang] = (langCount[lang] || 0) + (repo.size || 1);
        }
    }

    const sorted = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang);

    return sorted;
}

function calculateRank(totalStars, publicRepos, followers) {
    const score = totalStars * 3 + publicRepos * 5 + followers * 2;

    if (score >= 5000) return "S+";
    if (score >= 2000) return "S";
    if (score >= 1000) return "A+";
    if (score >= 500) return "A";
    if (score >= 200) return "B+";
    if (score >= 100) return "B";
    if (score >= 50) return "C+";
    return "C";
}

export async function fetchGitHubStats(username) {
    const user = await githubFetch(`/users/${username}`);
    const repos = await githubFetch(`/users/${username}/repos?per_page=100&sort=updated`);

    const totalStars = Array.isArray(repos)
        ? repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)
        : 0;

    const topLanguages = computeTopLanguages(repos);

    let recentActivity = { commits: null, prs: null, issues: null };
    let recentWindowLabel = "Recent (last ~100 events)";

    try {
        const events = await githubFetch(`/users/${username}/events/public?per_page=100`);
        if (Array.isArray(events) && events.length > 0) {
            const parsed = parseEvents(events);
            recentActivity = {
                commits: parsed.commits,
                prs: parsed.prs,
                issues: parsed.issues,
            };
        }
    } catch {
        recentWindowLabel = "Recent activity unavailable";
    }

    const rank = calculateRank(totalStars, user.public_repos || 0, user.followers || 0);

    return {
        username: user.login,
        name: user.name || user.login,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        location: user.location || null,
        followers: user.followers || 0,
        following: user.following || 0,
        publicRepos: user.public_repos || 0,
        totalStars,
        recentCommits: recentActivity.commits,
        recentPRs: recentActivity.prs,
        recentIssues: recentActivity.issues,
        recentWindowLabel,
        topLanguages,
        rank,
    };
}

export default fetchGitHubStats;
