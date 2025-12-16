import { supabase } from "@/integrations/supabase/client";

export interface GitHubStats {
  username: string;
  avatarUrl: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
  rank: string;
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const { data, error } = await supabase.functions.invoke('github-stats', {
    body: { username }
  });

  if (error) {
    console.error('Error fetching GitHub stats:', error);
    throw new Error(error.message || 'Failed to fetch GitHub stats');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as GitHubStats;
}
