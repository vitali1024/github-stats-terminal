import { useState, useEffect } from "react";
import { useTypingSound } from "@/hooks/useTypingSound";

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [stage, setStage] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const { playTypingSound, playEnterSound } = useTypingSound();

  const asciiLogo = `
   ██████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗ 
  ██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗
  ██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝
  ██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗
  ╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝
   ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
       ███████╗████████╗ █████╗ ████████╗███████╗
       ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
       ███████╗   ██║   ███████║   ██║   ███████╗
       ╚════██║   ██║   ██╔══██║   ██║   ╚════██║
       ███████║   ██║   ██║  ██║   ██║   ███████║
       ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝`;

  const bootMessages = [
    { text: "BIOS v3.14.159 - GitHub Stats Terminal", delay: 100 },
    { text: "Copyright (c) 2025 Retro Systems Inc.", delay: 50 },
    { text: "", delay: 200 },
    { text: "Detecting hardware...", delay: 300 },
    { text: "  CPU: RetroCore 8086 @ 4.77MHz.......... OK", delay: 150 },
    { text: "  RAM: 640KB conventional memory......... OK", delay: 120 },
    { text: "  GPU: CRT Phosphor Display.............. OK", delay: 100 },
    { text: "  NET: Dial-up Modem 56K................. OK", delay: 180 },
    { text: "", delay: 100 },
    { text: "Loading kernel modules...", delay: 250 },
    { text: "  [████████████████████████] 100%", delay: 400 },
    { text: "", delay: 100 },
    { text: "Initializing GitHub API connection...", delay: 300 },
    { text: "  Establishing secure tunnel............. OK", delay: 200 },
    { text: "  Authenticating......................... OK", delay: 150 },
    { text: "", delay: 200 },
  ];

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 50 + Math.random() * 100);
      }
    }, 500);
    return () => clearInterval(glitchInterval);
  }, []);

  // Boot sequence progression
  useEffect(() => {
    if (stage === 0) {
      // Initial power-on delay
      const timer = setTimeout(() => setStage(1), 500);
      return () => clearTimeout(timer);
    }

    if (stage === 1) {
      // Type out boot messages
      let currentLine = 0;
      let totalDelay = 0;

      bootMessages.forEach((msg, index) => {
        totalDelay += msg.delay;
        setTimeout(() => {
          if (msg.text) playTypingSound();
          setLines((prev) => [...prev, msg.text]);
          currentLine = index;
          
          if (index === bootMessages.length - 1) {
            setTimeout(() => setStage(2), 300);
          }
        }, totalDelay);
      });
    }

    if (stage === 2) {
      // Show ASCII logo
      playEnterSound();
      setTimeout(() => setStage(3), 1500);
    }

    if (stage === 3) {
      // Final messages
      playEnterSound();
      setTimeout(() => setStage(4), 800);
    }

    if (stage === 4) {
      // Complete boot
      setTimeout(() => onComplete(), 1000);
    }
  }, [stage, playTypingSound, playEnterSound, onComplete]);

  return (
    <div 
      className={`min-h-screen bg-background p-4 md:p-8 font-pixel overflow-hidden transition-opacity duration-300 ${
        glitch ? 'opacity-90 translate-x-[2px]' : ''
      }`}
    >
      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none z-20" />
      
      {/* CRT vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <div className="relative z-0 crt-flicker">
        {/* Power on flash */}
        {stage === 0 && (
          <div className="fixed inset-0 bg-foreground/10 animate-pulse" />
        )}

        {/* Boot messages */}
        {stage >= 1 && (
          <div className="space-y-0 text-sm md:text-base">
            {lines.map((line, index) => (
              <p key={index} className="text-foreground text-glow whitespace-pre">
                {line}
              </p>
            ))}
            {stage === 1 && showCursor && (
              <span className="text-foreground text-glow">█</span>
            )}
          </div>
        )}

        {/* ASCII Logo */}
        {stage >= 2 && (
          <div className="mt-4">
            <pre className="text-primary text-glow text-[8px] md:text-xs lg:text-sm leading-tight">
              {asciiLogo}
            </pre>
          </div>
        )}

        {/* System ready message */}
        {stage >= 3 && (
          <div className="mt-6 space-y-2">
            <p className="text-accent text-glow text-lg md:text-xl">
              ════════════════════════════════════════
            </p>
            <p className="text-foreground text-glow text-lg md:text-xl animate-pulse">
              SYSTEM READY - Press any key to continue...
            </p>
            <p className="text-accent text-glow text-lg md:text-xl">
              ════════════════════════════════════════
            </p>
          </div>
        )}

        {/* Loading terminal */}
        {stage >= 4 && (
          <div className="mt-4">
            <p className="text-secondary text-glow text-lg">
              {">"} Loading terminal interface...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BootSequence;
