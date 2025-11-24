import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  min?: number;
  optimal?: number;
  max?: number;
  className?: string;
}

export const CharacterCounter = ({ 
  current, 
  min = 20, 
  optimal = 100, 
  max = 200,
  className 
}: CharacterCounterProps) => {
  const getStatus = () => {
    if (current < min) return "too-short";
    if (current >= min && current <= optimal) return "optimal";
    if (current > optimal && current <= max) return "good";
    return "too-long";
  };

  const status = getStatus();

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className={cn(
        "transition-colors font-medium",
        status === "too-short" && "text-muted-foreground",
        status === "optimal" && "text-success",
        status === "good" && "text-primary",
        status === "too-long" && "text-destructive"
      )}>
        {current} characters
      </span>
      {status === "optimal" && <span className="text-success">✓ Perfect length</span>}
      {status === "too-short" && <span className="text-muted-foreground">({min - current} more needed)</span>}
      {status === "too-long" && <span className="text-destructive">({current - max} over limit)</span>}
    </div>
  );
};
