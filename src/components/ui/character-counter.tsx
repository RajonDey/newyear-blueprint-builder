import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  min?: number;
  soft?: number; // Soft limit (suggested maximum)
  max: number;   // Hard limit (absolute maximum)
  className?: string;
}

export const CharacterCounter = ({ 
  current, 
  min = 10, 
  soft,
  max,
  className 
}: CharacterCounterProps) => {
  // Use soft limit if provided, otherwise use 70% of max as soft limit
  const softLimit = soft || Math.floor(max * 0.7);
  
  const getStatus = () => {
    if (current < min) return "too-short";
    if (current >= min && current <= softLimit) return "optimal";
    if (current > softLimit && current < max) return "approaching";
    if (current >= max) return "at-limit";
    return "optimal";
  };

  const status = getStatus();
  const remaining = max - current;
  const percentage = (current / max) * 100;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            status === "too-short" && "bg-muted-foreground/20",
            status === "optimal" && "bg-green-500/40",
            status === "approaching" && "bg-yellow-500/40",
            status === "at-limit" && "bg-red-500/50"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {/* Character count and status */}
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          "transition-colors font-medium",
          status === "too-short" && "text-muted-foreground",
          status === "optimal" && "text-green-600 dark:text-green-500",
          status === "approaching" && "text-yellow-600 dark:text-yellow-500",
          status === "at-limit" && "text-red-600 dark:text-red-500"
        )}>
          {current}/{max} characters
        </span>
        
        <span className={cn(
          "text-xs transition-colors",
          status === "too-short" && "text-muted-foreground",
          status === "optimal" && "text-green-600 dark:text-green-500",
          status === "approaching" && "text-yellow-600 dark:text-yellow-500",
          status === "at-limit" && "text-red-600 dark:text-red-500"
        )}>
          {status === "too-short" && `${min - current} more needed`}
          {status === "optimal" && "✓ Great length!"}
          {status === "approaching" && "Getting detailed"}
          {status === "at-limit" && "Maximum reached"}
        </span>
      </div>
    </div>
  );
};
