import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const SaveIndicator = ({ isSaving, lastSaved, className }: SaveIndicatorProps) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="w-4 h-4 text-success animate-scale-in" />
          <span>Saved {getTimeAgo(lastSaved)}</span>
        </>
      ) : null}
    </div>
  );
};
