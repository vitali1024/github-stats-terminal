import "@fontsource/vt323";
import avatarImage from "@/assets/avatar.png";

interface StatRowProps {
  label: string;
  value: string | number;
}

interface GitHubStatsCardProps {
  username?: string;
  onBack?: () => void;
}

const StatRow = ({ label, value }: StatRowProps) => (
  <div className="flex justify-between items-center text-xl md:text-2xl">
    <span className="text-foreground text-glow">{label}</span>
    <span className="text-foreground text-glow">{value}</span>
  </div>
);

const GitHubStatsCard = ({ username = "Luci", onBack }: GitHubStatsCardProps) => {
  const stats = [
    { label: "Total Stars Earned:", value: 616 },
    { label: "Total Commits(2025):", value: 36 },
    { label: "Total PRs:", value: 149 },
    { label: "Total Issues:", value: 12 },
    { label: "Contributed to (last year):", value: 5 },
  ];

  return (
    <div className="relative p-1 rounded-sm rainbow-border animate-glow-pulse">
      {/* Inner border */}
      <div className="relative bg-background p-1">
        <div className="border-2 border-primary box-glow rounded-sm overflow-hidden">
          {/* Content container */}
          <div className="relative bg-background p-4 md:p-6">
            {/* Scanline overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none z-10" />
            
            {/* CRT flicker effect */}
            <div className="crt-flicker">
              {/* Title */}
              <div className="mb-4 border-b border-dashed border-primary pb-2 flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl text-foreground text-glow font-pixel">
                  {username}'s GitHub Stats
                </h2>
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="text-secondary text-glow text-lg font-pixel hover:text-accent transition-colors"
                  >
                    [BACK]
                  </button>
                )}
              </div>

              <div className="flex gap-6 md:gap-8">
                {/* Stats section */}
                <div className="flex-1 space-y-2 font-pixel">
                  {stats.map((stat) => (
                    <StatRow key={stat.label} label={stat.label} value={stat.value} />
                  ))}

                  {/* Dashed separator */}
                  <div className="border-t border-dashed border-accent my-3" />

                  {/* Rank */}
                  <div className="flex justify-between items-center text-xl md:text-2xl">
                    <span className="text-foreground text-glow">Rank:</span>
                    <span className="text-accent text-glow font-bold">A-</span>
                  </div>
                </div>

                {/* Avatar section */}
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-primary box-glow">
                    <img
                      src={avatarImage}
                      alt={`${username}'s Avatar`}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubStatsCard;
