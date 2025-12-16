import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubStats {
  username: string;
  avatarUrl: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
  rank: string;
}

function calculateRank(stats: { stars: number; commits: number; prs: number; issues: number }): string {
  const score = stats.stars * 2 + stats.commits + stats.prs * 3 + stats.issues;
  
  if (score >= 10000) return "S+";
  if (score >= 5000) return "S";
  if (score >= 2500) return "A+";
  if (score >= 1000) return "A";
  if (score >= 500) return "A-";
  if (score >= 250) return "B+";
  if (score >= 100) return "B";
  if (score >= 50) return "B-";
  if (score >= 25) return "C+";
  return "C";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching GitHub stats for user: ${username}`);

    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Stats-Terminal'
      }
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    console.log(`Found user: ${userData.login}`);

    // Fetch user's repos to calculate stars
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Stats-Terminal'
      }
    });

    const repos = await reposResponse.json();
    const totalStars = Array.isArray(repos) 
      ? repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0)
      : 0;

    // Fetch user events for commits and PRs (last 90 days)
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Stats-Terminal'
      }
    });

    const events = await eventsResponse.json();
    
    let totalCommits = 0;
    let totalPRs = 0;
    let totalIssues = 0;
    const contributedRepos = new Set<string>();

    if (Array.isArray(events)) {
      for (const event of events) {
        if (event.type === 'PushEvent' && event.payload?.commits) {
          totalCommits += event.payload.commits.length;
          contributedRepos.add(event.repo?.name || '');
        } else if (event.type === 'PullRequestEvent') {
          totalPRs++;
          contributedRepos.add(event.repo?.name || '');
        } else if (event.type === 'IssuesEvent') {
          totalIssues++;
          contributedRepos.add(event.repo?.name || '');
        }
      }
    }

    // Use public_repos as a proxy for contributed repos if events are limited
    const contributedTo = Math.max(contributedRepos.size, Math.min(userData.public_repos || 0, 50));

    const rank = calculateRank({
      stars: totalStars,
      commits: totalCommits,
      prs: totalPRs,
      issues: totalIssues
    });

    const stats: GitHubStats = {
      username: userData.login,
      avatarUrl: userData.avatar_url,
      totalStars,
      totalCommits,
      totalPRs,
      totalIssues,
      contributedTo,
      rank
    };

    console.log(`Stats calculated for ${username}:`, stats);

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GitHub stats';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
