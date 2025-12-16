import "@fontsource/vt323";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import TerminalInput from "@/components/TerminalInput";
import BootSequence from "@/components/BootSequence";
import { fetchGitHubStats, GitHubStats } from "@/services/githubService";

const Index = () => {
  const [booted, setBooted] = useState(false);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleSubmit = async (username: string) => {
    setIsLoading(true);
    try {
      const data = await fetchGitHubStats(username);
      setStats(data);
      toast.success(`Loaded stats for ${data.username}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      toast.error(message);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStats(null);
  };

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none z-20" />
      
      {/* CRT vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      <div className="w-full max-w-2xl relative z-0">
        {stats ? (
          <GitHubStatsCard 
            username={stats.username} 
            avatarUrl={stats.avatarUrl}
            stats={{
              totalStars: stats.totalStars,
              totalCommits: stats.totalCommits,
              totalPRs: stats.totalPRs,
              totalIssues: stats.totalIssues,
              contributedTo: stats.contributedTo,
              rank: stats.rank
            }}
            onBack={handleBack} 
          />
        ) : (
          <TerminalInput onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default Index;
