import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Sparkles, Target } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

interface CommitmentModalProps {
  open: boolean;
  onCommit: () => void;
  onClose: () => void;
}

export const CommitmentModal = ({ open, onCommit, onClose }: CommitmentModalProps) => {
  const [isCommitted, setIsCommitted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-5 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            This is YOUR Time
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-center text-sm md:text-base mt-3 md:mt-4">
            You're about to create your {APP_CONFIG.year} Blueprint. This is a moment for you—to dream, plan, and commit to your best year yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-3 md:py-4">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">10 focused minutes</span> of your time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Zero distractions</span> for maximum clarity
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">One powerful plan</span> that transforms your year
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Checkbox
              id="commitment"
              checked={isCommitted}
              onCheckedChange={(checked) => setIsCommitted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="commitment"
              className="text-sm leading-relaxed cursor-pointer select-none"
            >
              I commit to giving myself <span className="font-semibold">10 focused minutes</span> to build my {APP_CONFIG.year} Blueprint. I understand this is an investment in my future self.
            </label>
          </div>

          <Button
            onClick={onCommit}
            disabled={!isCommitted}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 hover-scale transition-all text-base md:text-lg h-12 md:h-14 tap-target"
          >
            Let's Begin My {APP_CONFIG.year} Journey →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
