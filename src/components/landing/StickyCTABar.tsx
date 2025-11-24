import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface StickyCTABarProps {
  onStart: () => void;
}

export const StickyCTABar = ({ onStart }: StickyCTABarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling 800px
      setIsVisible(window.scrollY > 800);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up safe-area-bottom">
      <div className="bg-gradient-primary backdrop-blur-lg border-t border-primary/20 shadow-elegant">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-primary-foreground">
                Ready to transform your 2025?
              </p>
              <p className="text-[10px] sm:text-xs text-primary-foreground/80 hidden md:block">
                Join 2,347+ people who've created their blueprint
              </p>
            </div>
            <Button
              onClick={onStart}
              size="lg"
              className="bg-background text-primary hover:bg-background/90 font-semibold shadow-lg animate-pulse-subtle w-full md:w-auto"
            >
              Start Your Free Plan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
