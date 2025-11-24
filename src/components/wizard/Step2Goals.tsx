import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Confetti } from "@/components/ui/confetti";
import { LifeCategory } from "@/types/wizard";
import { useState } from "react";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/error-messages";

interface Step2GoalsProps {
  selectedCategories: LifeCategory[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  goals: Record<LifeCategory, string>;
  onUpdateGoal: (category: LifeCategory, goal: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const goalPlaceholders: Record<LifeCategory, string[]> = {
  Health: [
    "Run a half marathon by September 2025",
    "Lose 20 pounds and maintain it throughout the year",
    "Practice yoga 3 times per week for 12 months",
    "Complete a 30-day fitness challenge every quarter"
  ],
  Career: [
    "Get promoted to Senior Manager by Q3 2025",
    "Launch my side business and earn $5,000 in revenue",
    "Earn a professional certification in data analytics",
    "Speak at 3 industry conferences this year"
  ],
  Finance: [
    "Save $15,000 for emergency fund by December",
    "Invest $500 monthly in index funds",
    "Pay off $10,000 in credit card debt",
    "Increase income by 20% through raises or side income"
  ],
  Relationships: [
    "Plan monthly date nights with my partner",
    "Reconnect with 5 old friends through quarterly meet-ups",
    "Spend quality 1-on-1 time with each child weekly",
    "Host family gathering every other month"
  ],
  Spirituality: [
    "Meditate for 15 minutes daily for 6 consecutive months",
    "Attend weekly spiritual or mindfulness sessions",
    "Read 12 books on spirituality and personal philosophy",
    "Volunteer 2 hours weekly at a local charity"
  ],
  Passion: [
    "Master guitar and perform 3 songs at an open mic night",
    "Learn conversational Spanish and hold 10 conversations",
    "Complete 12 creative projects (art, writing, or crafts)",
    "Start a photography hobby and build a portfolio of 50 photos"
  ]
};

export const Step2Goals = ({
  selectedCategories,
  primaryCategory,
  secondaryCategories,
  goals,
  onUpdateGoal,
  onNext,
  onBack,
}: Step2GoalsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const allCategories = [primaryCategory, ...secondaryCategories].filter(Boolean) as LifeCategory[];
  const currentCategory = allCategories[currentIndex];
  const currentGoal = goals[currentCategory] || "";
  const isPrimary = currentCategory === primaryCategory;

  const placeholders = goalPlaceholders[currentCategory] || ["Enter your goal..."];
  const placeholder = useRotatingPlaceholder(placeholders);

  const handleNext = () => {
    setValidationError(null);

    try {
      const minLength = isPrimary ? 10 : 5;
      const maxLength = isPrimary ? 300 : 200;

      if (currentGoal.length < minLength) {
        const message = `Goal must be at least ${minLength} characters`;
        setValidationError(message);
        toast.error(message);
        return;
      }

      if (currentGoal.length > maxLength) {
        const message = ERROR_MESSAGES.GOAL_TOO_LONG;
        setValidationError(message);
        toast.error(message);
        return;
      }

      if (currentIndex < allCategories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          onNext();
        }, 2000);
      }
    } catch (error) {
      console.error('Error in goal validation:', error);
      toast.error('Failed to save goal. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Confetti trigger={showConfetti} />
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          {isPrimary && <span className="text-xl md:text-2xl">⭐</span>}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Define Your {currentCategory} Goal
          </h2>
        </div>
        <p className="text-muted-foreground text-base md:text-lg">
          {isPrimary ? (
            <span className="text-focus-primary font-semibold">Primary Focus</span>
          ) : (
            <span className="text-focus-secondary font-semibold">Supporting Area</span>
          )} • Category {currentIndex + 1} of {allCategories.length}
        </p>
      </div>

      <Card className={cn(
        "p-6 md:p-8 shadow-elegant hover-lift",
        isPrimary ? "border-focus-primary border-2" : "border-focus-secondary"
      )}>
        <Label htmlFor="goal" className="text-base md:text-lg font-semibold mb-3 block">
          {isPrimary 
            ? `What's your main ${currentCategory.toLowerCase()} transformation goal for 2025?`
            : `What would you like to maintain or improve in ${currentCategory.toLowerCase()}?`
          }
        </Label>

        <Textarea
          id="goal"
          value={currentGoal}
          onChange={(e) => onUpdateGoal(currentCategory, e.target.value)}
          placeholder={placeholder}
          className={cn(
            "resize-none focus-glow",
            isPrimary ? "min-h-32 md:min-h-40" : "min-h-24 md:min-h-32"
          )}
          maxLength={isPrimary ? 300 : 200}
        />

        <CharacterCounter current={currentGoal.length} max={isPrimary ? 300 : 200} className="mt-2" />

        {validationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {isPrimary && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-semibold text-foreground mb-2">💡 SMART Goal Tips:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ <strong>Specific:</strong> Clear and well-defined</li>
              <li>✓ <strong>Measurable:</strong> Track your progress</li>
              <li>✓ <strong>Achievable:</strong> Realistic yet challenging</li>
              <li>✓ <strong>Relevant:</strong> Aligns with your values</li>
              <li>✓ <strong>Time-bound:</strong> Has a deadline (2025)</li>
            </ul>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          size="lg"
          className="hover-scale"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isPrimary ? currentGoal.length < 10 : currentGoal.length < 5}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale"
        >
          {currentIndex < allCategories.length - 1 ? "Next Category →" : "Continue →"}
        </Button>
      </div>
    </div>
  );
};
