import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Confetti } from "@/components/ui/confetti";
import { LifeCategory } from "@/types/wizard";
import { useState } from "react";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";

interface Step4HabitsProps {
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  habits: Record<LifeCategory, string>;
  onUpdateHabit: (category: LifeCategory, habit: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Habits = ({
  primaryCategory,
  secondaryCategories,
  habits,
  onUpdateHabit,
  onNext,
  onBack,
}: Step4HabitsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allCategories = [primaryCategory, ...secondaryCategories].filter(
    Boolean
  ) as LifeCategory[];
  const currentCategory = allCategories[currentIndex];
  const isPrimary = currentCategory === primaryCategory;

  const currentHabit = habits[currentCategory] || "";

  const placeholder = useRotatingPlaceholder([
    "Every Sunday at 9 AM, I'll review my progress in my journal at my desk while having coffee",
    "On the 1st of each month at 8 PM, I'll assess my achievements and adjust my plan in my planner at home",
    "Every Friday after work at 6 PM, I'll spend 20 minutes reflecting on the week's wins in my notebook",
  ]);

  const isPrimaryValid = currentHabit.length >= 20;
  const isSecondaryValid =
    currentHabit.length === 0 || currentHabit.trim().length >= 10;

  const canProceed = isPrimary ? isPrimaryValid : isSecondaryValid;

  const handleNext = () => {
    if (!canProceed) return;

    if (currentIndex < allCategories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onNext();
    }, 2000);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return;
    }
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Confetti trigger={showConfetti} />
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">⭐</span>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-3xl font-bold text-foreground">
              Monthly Review Habit for {currentCategory}
            </h2>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                isPrimary
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {isPrimary ? "Primary Focus" : "Supporting Goal"}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          {isPrimary ? (
            <>
              <span className="text-focus-primary font-semibold">
                Primary Focus:{" "}
              </span>
              Define when, where, and how you'll check in on your progress
            </>
          ) : (
            <>
              Optional: Add a simple habit/check-in for this supporting goal, or
              skip for now.
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Category {currentIndex + 1} of {allCategories.length}{" "}
          {isPrimary ? "(Primary)" : "(Supporting)"}
        </p>
      </div>

      <Card className="p-8 shadow-elegant hover-lift border-focus-primary border-2">
        <Label htmlFor="habit" className="text-lg font-semibold mb-3 block">
          {isPrimary
            ? "Create Your Monthly Check-In Routine"
            : "Quick Habit / Check-In (optional)"}
        </Label>

        <Textarea
          id="habit"
          value={currentHabit}
          onChange={(e) => onUpdateHabit(currentCategory, e.target.value)}
          placeholder={placeholder}
          className="min-h-32 max-h-48 text-base resize-none focus-glow"
          maxLength={400}
        />

        <CharacterCounter
          current={currentHabit.length}
          soft={150}
          max={400}
          className="mt-2"
        />

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">
            💡 Implementation Intention Formula:
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>"When [TIME], I will [ACTION] in [PLACE]"</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              ✓ <strong>Time:</strong> Specific day and time (e.g., "Every 1st
              Sunday at 9 AM")
            </li>
            <li>
              ✓ <strong>Action:</strong> What you'll review (progress, goals,
              obstacles)
            </li>
            <li>
              ✓ <strong>Place:</strong> Where you'll do this (desk, coffee shop,
              etc.)
            </li>
            <li>
              ✓ <strong>Cue:</strong> Add a trigger (after coffee, before bed,
              etc.)
            </li>
          </ul>
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Button onClick={handleBack} variant="outline" size="lg">
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};
