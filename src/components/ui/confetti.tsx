import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const Confetti = ({ trigger, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--accent))", "hsl(var(--secondary))"];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);
    }
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
