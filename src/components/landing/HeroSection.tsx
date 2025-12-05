import { Button } from "@/components/ui/button";
import { Clock, Star, Users } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="text-center mb-16 animate-fade-in">
      {/* Early Access Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-focus-primary/10 rounded-full border border-focus-primary/20 mb-6 animate-pulse">
        <Star className="w-4 h-4 text-focus-primary fill-focus-primary" />
        <span className="text-sm font-semibold text-focus-primary">
          New Year, New System
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight px-4">
        Transform Your {APP_CONFIG.year}
        <span className="block text-primary mt-2">In Just 10 Minutes</span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed px-4">
        Build a year that actually works using proven frameworks from top achievers worldwide
      </p>

      {/* Social Proof Pills */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mb-8 px-4">
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary rounded-full">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-foreground">Join early adopters</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary rounded-full">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium text-foreground">Avg time: 10 mins</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary rounded-full">
          <Star className="w-4 h-4 text-focus-primary fill-focus-primary" />
          <span className="text-xs sm:text-sm font-medium text-foreground">Based on proven psychology</span>
        </div>
      </div>

      {/* CTA Button */}
      <Button 
        onClick={onStart}
        size="lg"
        className="w-full md:w-auto bg-gradient-primary hover:opacity-90 hover-scale text-lg h-14 px-12 shadow-elegant animate-pulse-subtle"
      >
        Start Building Your {APP_CONFIG.year} Plan →
      </Button>

      {/* Trust Line */}
      <p className="text-sm text-muted-foreground mt-4">
        ✓ Free to complete • ✓ No credit card required • ✓ Full Blueprint Unlock ($9)
      </p>
    </div>
  );
};
