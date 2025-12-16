import { useState, useRef, useEffect } from "react";

interface TerminalInputProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

const TerminalInput = ({ onSubmit, isLoading = false }: TerminalInputProps) => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative p-1 rainbow-border rounded-sm">
      <div className="bg-background p-1">
        <div className="border-2 border-primary box-glow rounded-sm overflow-hidden">
          <div className="relative bg-background p-4">
            {/* Scanline overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none z-10" />
            
            <div className="crt-flicker">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-primary">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive opacity-80" />
                  <span className="w-3 h-3 rounded-full bg-accent opacity-80" />
                  <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                </div>
                <span className="text-lg text-muted-foreground font-pixel ml-2">
                  github-stats.exe
                </span>
              </div>

              {/* Terminal content */}
              <div className="space-y-2 font-pixel">
                <p className="text-foreground text-glow text-lg">
                  Welcome to GitHub Stats Terminal v1.0
                </p>
                <p className="text-muted-foreground text-lg">
                  Enter a GitHub username to view stats:
                </p>

                {/* Input line */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <span className="text-secondary text-glow text-xl">{">"}</span>
                  <div 
                    className="flex-1 relative cursor-text"
                    onClick={handleContainerClick}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="w-full bg-transparent text-foreground text-glow text-xl font-pixel outline-none caret-transparent"
                      placeholder=""
                      disabled={isLoading}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {/* Custom cursor */}
                    <span 
                      className={`absolute top-0 text-xl text-foreground ${isFocused ? 'blink-cursor' : ''}`}
                      style={{ left: `${value.length * 0.6}em` }}
                    />
                  </div>
                </form>

                {/* Hint */}
                <p className="text-muted-foreground text-sm mt-4">
                  Press ENTER to submit
                </p>

                {isLoading && (
                  <p className="text-accent text-glow text-lg animate-pulse">
                    Fetching data...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalInput;
