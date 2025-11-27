import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Confetti } from "@/components/ui/confetti";
import { LifeCategory } from "@/types/wizard";
import { useState } from "react";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";

interface Step5MotivationProps {
  primaryCategory: LifeCategory | null;
  motivation: Record<LifeCategory, { why: string; consequence: string }>;
  onUpdateMotivation: (category: LifeCategory, type: "why" | "consequence", value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Motivation = ({
  primaryCategory,
  motivation,
  onUpdateMotivation,
  onNext,
  onBack,
}: Step5MotivationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Only primary category gets deep motivation
  const currentCategory = primaryCategory!;
  const currentMotivation = motivation[currentCategory] || { why: "", consequence: "" };

  const whyPlaceholder = useRotatingPlaceholder([
    "I want to be healthy and energetic for my family, to play with my kids without getting tired",
    "I'm pursuing this to achieve financial freedom and security for my future",
    "This matters because I want to make a meaningful impact in my field and help others",
  ]);

  const consequencePlaceholder = useRotatingPlaceholder([
    "If I don't act now, I'll continue feeling tired and unhealthy, missing out on precious moments",
    "Without change, I'll stay in financial uncertainty and never achieve the life I dream of",
    "If I give up, I'll regret not pursuing my passion and living below my potential",
  ]);

  const handleNext = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onNext();
    }, 2000);
  };

  const isValid = currentMotivation.why.length >= 20 && currentMotivation.consequence.length >= 20;

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Confetti trigger={showConfetti} />
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl md:text-2xl">⭐</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Your {currentCategory} Motivation
          </h2>
        </div>
        <p className="text-muted-foreground text-base md:text-lg">
          <span className="text-focus-primary font-semibold">Primary Focus: </span>
          Clarify your deep reasons for this transformation
        </p>
      </div>

      <Card className="p-6 md:p-8 shadow-elegant hover-lift border-focus-primary border-2">
        <div className="space-y-6 md:space-y-8">
          {/* Why Section */}
          <div>
            <Label htmlFor="why" className="text-base md:text-lg font-semibold mb-3 block flex items-center gap-2">
              <span className="text-xl md:text-2xl">💪</span>
              Why This Matters to You
            </Label>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              What's your compelling reason? Connect this goal to your values and identity.
            </p>
            <Textarea
              id="why"
              value={currentMotivation.why}
              onChange={(e) => onUpdateMotivation(currentCategory, "why", e.target.value)}
              placeholder={whyPlaceholder}
              className="min-h-28 md:min-h-32 max-h-48 resize-none focus-glow"
              maxLength={600}
            />
            <CharacterCounter current={currentMotivation.why.length} soft={200} max={600} className="mt-2" />
          </div>

          {/* Consequence Section */}
          <div>
            <Label htmlFor="consequence" className="text-lg font-semibold mb-3 block flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              What If You Don't Change?
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              What will you miss out on? Be honest about the cost of inaction.
            </p>
            <Textarea
              id="consequence"
              value={currentMotivation.consequence}
              onChange={(e) => onUpdateMotivation(currentCategory, "consequence", e.target.value)}
              placeholder={consequencePlaceholder}
              className="min-h-32 max-h-48 text-base resize-none focus-glow"
              maxLength={600}
            />
            <CharacterCounter current={currentMotivation.consequence.length} soft={200} max={600} className="mt-2" />
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-2">💡 Motivation Amplifiers:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Make it personal - connect to your identity and values</li>
            <li>✓ Be specific about emotional benefits</li>
            <li>✓ Visualize both success and the cost of giving up</li>
            <li>✓ Write in present tense as if it's already true</li>
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
          Complete Planning →
        </Button>
      </div>
    </div>
  );
};
