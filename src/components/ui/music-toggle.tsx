import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
  className?: string;
}

export const MusicToggle = ({ isPlaying, onToggle, className }: MusicToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("hover-scale", className)}
        >
          {isPlaying ? (
            <Volume2 className="w-5 h-5 text-primary" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isPlaying ? "Pause background music" : "Play calming background music"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
