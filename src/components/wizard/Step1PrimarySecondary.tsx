import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LifeCategory } from "@/types/wizard";
import { Heart, Briefcase, DollarSign, Users, Sparkles, Flame, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { APP_CONFIG } from "@/lib/config";

interface Step1PrimarySecondaryProps {
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  lifeWheelRatings: Record<LifeCategory, number>;
  onSelectPrimary: (category: LifeCategory) => void;
  onToggleSecondary: (category: LifeCategory) => void;
  onNext: () => void;
  onBack: () => void;
}

const categoryConfig: { 
  name: LifeCategory; 
  icon: any; 
  description: string;
  primaryDescription: string;
}[] = [
  { 
    name: "Health", 
    icon: Heart, 
    description: "Physical & mental wellbeing",
    primaryDescription: "Transform your body, mind, and energy levels"
  },
  { 
    name: "Career", 
    icon: Briefcase, 
    description: "Professional growth & purpose",
    primaryDescription: "Build the career and impact you've always wanted"
  },
  { 
    name: "Finance", 
    icon: DollarSign, 
    description: "Money & financial security",
    primaryDescription: "Achieve financial freedom and security"
  },
  { 
    name: "Relationships", 
    icon: Users, 
    description: "Family, friends & connections",
    primaryDescription: "Deepen connections and build meaningful relationships"
  },
  { 
    name: "Spirituality", 
    icon: Sparkles, 
    description: "Inner peace & meaning",
    primaryDescription: "Find purpose, peace, and spiritual fulfillment"
  },
  { 
    name: "Passion", 
    icon: Flame, 
    description: "Hobbies, creative pursuits & personal interests",
    primaryDescription: "Pursue your passions and develop creative skills"
  },
];

export const Step1PrimarySecondary = ({
  primaryCategory,
  secondaryCategories,
  lifeWheelRatings,
  onSelectPrimary,
  onToggleSecondary,
  onNext,
  onBack,
}: Step1PrimarySecondaryProps) => {
  const [showSecondary, setShowSecondary] = useState(false);

  const lowestRatedCategory = categoryConfig.reduce((lowest, cat) => {
    const currentRating = lifeWheelRatings[cat.name] || 5;
    const lowestRating = lifeWheelRatings[lowest.name] || 5;
    return currentRating < lowestRating ? cat : lowest;
  }, categoryConfig[0]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Primary Category Section */}
      <div className="mb-8 md:mb-12 animate-fade-in">
        <div className="text-center mb-6 md:mb-8 px-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="w-6 h-6 md:w-8 md:h-8 text-focus-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Choose Your Primary Focus for {APP_CONFIG.year}
            </h2>
          </div>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Select ONE area that deserves your deepest attention this year. This will be your main transformation goal.
          </p>
          {!primaryCategory && (
            <div className="mt-4 p-4 bg-focus-primary/10 border border-focus-primary/30 rounded-lg max-w-xl mx-auto">
              <p className="text-sm text-foreground">
                💡 Based on your assessment, <strong>{lowestRatedCategory.name}</strong> might benefit most from your focus.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {categoryConfig.map(({ name, icon: Icon, primaryDescription }) => {
            const isPrimary = primaryCategory === name;
            const rating = lifeWheelRatings[name] || 5;
            
            return (
              <Card
                key={name}
                onClick={() => onSelectPrimary(name)}
                className={cn(
                  "p-5 md:p-6 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 touch-feedback tap-target",
                  isPrimary
                    ? "border-focus-primary border-2 bg-focus-primary/10 shadow-[0_0_30px_-5px_hsl(var(--focus-primary))] animate-scale-in"
                    : "border-border hover:border-focus-primary/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-lg relative",
                      isPrimary
                        ? "bg-focus-primary text-focus-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    {isPrimary && (
                      <Star className="w-4 h-4 absolute -top-1 -right-1 fill-focus-primary-glow text-focus-primary-glow" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg text-foreground">{name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Current:</span>
                        <span className={cn(
                          "text-sm font-bold",
                          rating <= 4 ? "text-destructive" : rating <= 7 ? "text-accent" : "text-success"
                        )}>
                          {rating}/10
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm",
                      isPrimary ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {primaryDescription}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Secondary Categories Section */}
      {primaryCategory && (
        <div className="mb-8 animate-fade-in">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-focus-secondary transition-colors"
            >
              <CheckCircle2 className="w-6 h-6 text-focus-secondary" />
              Add Supporting Areas (Optional)
              <span className="text-sm text-muted-foreground ml-2">
                {showSecondary ? "▼" : "▶"}
              </span>
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              Pick 1-2 areas to maintain while focusing on your primary goal
            </p>
          </div>

          {showSecondary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categoryConfig
                .filter((cat) => cat.name !== primaryCategory)
                .map(({ name, icon: Icon, description }) => {
                  const isSecondary = secondaryCategories.includes(name);
                  const canSelect = secondaryCategories.length < 2 || isSecondary;
                  const rating = lifeWheelRatings[name] || 5;

                  return (
                    <Card
                      key={name}
                      onClick={() => canSelect && onToggleSecondary(name)}
                      className={cn(
                        "p-3 md:p-4 transition-all touch-feedback tap-target",
                        canSelect ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed",
                        isSecondary
                          ? "border-focus-secondary bg-focus-secondary/10 shadow-[0_0_15px_-5px_hsl(var(--focus-secondary))]"
                          : "border-border hover:border-focus-secondary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            isSecondary
                              ? "bg-focus-secondary text-focus-secondary-foreground"
                              : "bg-secondary text-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm text-foreground truncate">{name}</h4>
                            <span className="text-xs text-muted-foreground shrink-0">{rating}/10</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          ← Back
        </Button>
        
        <div className="text-center">
          <Button
            onClick={onNext}
            disabled={!primaryCategory}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 hover-scale min-w-48"
          >
            Start Planning →
          </Button>
          {primaryCategory && (
            <p className="text-xs text-muted-foreground mt-2">
              Primary: <strong className="text-focus-primary">{primaryCategory}</strong>
              {secondaryCategories.length > 0 && (
                <> • Supporting: <strong className="text-focus-secondary">{secondaryCategories.join(", ")}</strong></>
              )}
            </p>
          )}
        </div>

        <div className="w-24" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
};
