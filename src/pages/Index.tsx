import "@fontsource/vt323";
import { useState } from "react";
import GitHubStatsCard from "@/components/GitHubStatsCard";
import TerminalInput from "@/components/TerminalInput";

const Index = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
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
