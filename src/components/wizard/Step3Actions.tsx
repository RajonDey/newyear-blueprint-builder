import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Confetti } from "@/components/ui/confetti";
import { LifeCategory, ActionStep } from "@/types/wizard";
import { useState } from "react";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/config";

interface Step3ActionsProps {
  primaryCategory: LifeCategory | null;
  actions: Record<LifeCategory, ActionStep>;
  onUpdateActions: (category: LifeCategory, actions: ActionStep) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Actions = ({
  primaryCategory,
  actions,
  onUpdateActions,
  onNext,
  onBack,
}: Step3ActionsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Only primary category gets full action breakdown
  const currentCategory = primaryCategory!;
  const currentActions = actions[currentCategory] || { small: "", medium: "", big: "" };

  const smallPlaceholder = useRotatingPlaceholder([
    "Start a daily 10-minute morning routine",
    "Read 10 pages of a book each day",
    "Drink 8 glasses of water daily",
    "Take a 15-minute walk after lunch",
  ]);

  const mediumPlaceholder = useRotatingPlaceholder([
    "Join a gym or fitness class",
    "Complete an online course",
    "Start a weekly meditation practice",
    "Cook healthy meals 5 days a week",
  ]);

  const bigPlaceholder = useRotatingPlaceholder([
    "Run a half marathon",
    "Launch a side business",
    "Complete a professional certification",
    "Write and publish a book",
  ]);

  const handleNext = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onNext();
    }, 2000);
  };

  const updateAction = (key: keyof ActionStep, value: string) => {
    try {
      onUpdateActions(currentCategory, { ...currentActions, [key]: value });
    } catch (error) {
      console.error('Failed to update action:', error);
      toast.error('Failed to save action. Please try again.');
    }
  };

  const isValid = currentActions.small && currentActions.medium && currentActions.big;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Confetti trigger={showConfetti} />
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl md:text-2xl">⭐</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Break Down Your {currentCategory} Goal
          </h2>
        </div>
        <p className="text-muted-foreground text-base md:text-lg">
          <span className="text-focus-primary font-semibold">Primary Focus: </span>
          Create progressive action steps for your main goal
        </p>
      </div>

      <Card className="p-6 md:p-8 shadow-elegant hover-lift border-focus-primary border-2">
        <div className="space-y-6 md:space-y-8">
          {/* Small Step */}
          <div>
            <Label htmlFor="small" className="text-base md:text-lg font-semibold mb-3 block flex items-center gap-2">
              <span className="text-xl md:text-2xl">🌱</span>
              Small Step - Start This Week
            </Label>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              What's one tiny action you can do consistently? (This builds the habit)
            </p>
            <Input
              id="small"
              value={currentActions.small}
              onChange={(e) => updateAction("small", e.target.value)}
              placeholder={smallPlaceholder}
              className="focus-glow h-11 md:h-12"
              maxLength={150}
            />
          </div>

          {/* Medium Step */}
          <div>
            <Label htmlFor="medium" className="text-lg font-semibold mb-3 block flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Medium Step - Within 3 Months
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              What's a significant action that builds on your small step?
            </p>
            <Input
              id="medium"
              value={currentActions.medium}
              onChange={(e) => updateAction("medium", e.target.value)}
              placeholder={mediumPlaceholder}
              className="text-base focus-glow"
              maxLength={150}
            />
          </div>

          {/* Big Milestone */}
          <div>
            <Label htmlFor="big" className="text-lg font-semibold mb-3 block flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Big Milestone - By End of {APP_CONFIG.year}
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              What's your ultimate achievement for this goal this year?
            </p>
            <Input
              id="big"
              value={currentActions.big}
              onChange={(e) => updateAction("big", e.target.value)}
              placeholder={bigPlaceholder}
              className="text-base focus-glow"
              maxLength={150}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">💡 Progressive Action Framework:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Start small to build momentum and consistency</li>
            <li>✓ Scale up gradually as habits become automatic</li>
            <li>✓ Make the big milestone exciting and inspiring</li>
          </ul>
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" size="lg">
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};
