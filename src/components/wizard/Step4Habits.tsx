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
  habits: Record<LifeCategory, string>;
  onUpdateHabit: (category: LifeCategory, habit: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Habits = ({
  primaryCategory,
  habits,
  onUpdateHabit,
  onNext,
  onBack,
}: Step4HabitsProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Only primary category gets habit tracking
  const currentCategory = primaryCategory!;
  const currentHabit = habits[currentCategory] || "";

  const placeholder = useRotatingPlaceholder([
    "Every Sunday at 9 AM, I'll review my progress in my journal at my desk while having coffee",
    "On the 1st of each month at 8 PM, I'll assess my achievements and adjust my plan in my planner at home",
    "Every Friday after work at 6 PM, I'll spend 20 minutes reflecting on the week's wins in my notebook",
  ]);

  const handleNext = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onNext();
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Confetti trigger={showConfetti} />
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">⭐</span>
          <h2 className="text-3xl font-bold text-foreground">
            Monthly Review Habit for {currentCategory}
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          <span className="text-focus-primary font-semibold">Primary Focus: </span>
          Define when, where, and how you'll check in on your progress
        </p>
      </div>

      <Card className="p-8 shadow-elegant hover-lift border-focus-primary border-2">
        <Label htmlFor="habit" className="text-lg font-semibold mb-3 block">
          Create Your Monthly Check-In Routine
        </Label>

        <Textarea
          id="habit"
          value={currentHabit}
          onChange={(e) => onUpdateHabit(currentCategory, e.target.value)}
          placeholder={placeholder}
          className="min-h-32 text-base resize-none focus-glow"
          maxLength={200}
        />

        <CharacterCounter current={currentHabit.length} max={200} className="mt-2" />

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">💡 Implementation Intention Formula:</p>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>"When [TIME], I will [ACTION] in [PLACE]"</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ <strong>Time:</strong> Specific day and time (e.g., "Every 1st Sunday at 9 AM")</li>
            <li>✓ <strong>Action:</strong> What you'll review (progress, goals, obstacles)</li>
            <li>✓ <strong>Place:</strong> Where you'll do this (desk, coffee shop, etc.)</li>
            <li>✓ <strong>Cue:</strong> Add a trigger (after coffee, before bed, etc.)</li>
          </ul>
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" size="lg">
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentHabit.length < 20}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
};
