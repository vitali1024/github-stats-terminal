import "@fontsource/vt323";
import { useState, useCallback } from "react";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import TerminalInput from "@/components/TerminalInput";
import BootSequence from "@/components/BootSequence";

const Index = () => {
  const [booted, setBooted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleSubmit = (name: string) => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setUsername(name);
      setIsLoading(false);
    }, 800);
  };

  const handleBack = () => {
    setUsername(null);
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
        {username ? (
          <GitHubStatsCard username={username} onBack={handleBack} />
        ) : (
          <TerminalInput onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default Index;
