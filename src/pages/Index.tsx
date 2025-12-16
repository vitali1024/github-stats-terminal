import "@fontsource/vt323";
import GitHubStatsCard from "@/components/GitHubStatsCard";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* CRT monitor effect container */}
      <div className="w-full max-w-2xl">
        <GitHubStatsCard />
      </div>
    </div>
  );
};

export default Index;
