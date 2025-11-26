import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LifeCategory } from "@/types/wizard";
import { Heart, Briefcase, DollarSign, Users, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/config";

interface Step1CategoriesProps {
  selectedCategories: LifeCategory[];
  onToggleCategory: (category: LifeCategory) => void;
  onNext: () => void;
}

const categories: { name: LifeCategory; icon: any; description: string }[] = [
  { name: "Health", icon: Heart, description: "Physical & mental wellbeing" },
  { name: "Career", icon: Briefcase, description: "Professional growth & purpose" },
  { name: "Finance", icon: DollarSign, description: "Money & financial security" },
  { name: "Relationships", icon: Users, description: "Family, friends & connections" },
  { name: "Spirituality", icon: Sparkles, description: "Inner peace & meaning" },
  { name: "Passion", icon: Flame, description: "Hobbies, creative pursuits & personal interests" },
];

export const Step1Categories = ({
  selectedCategories,
  onToggleCategory,
  onNext,
}: Step1CategoriesProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Choose Your Focus Categories
        </h2>
        <p className="text-muted-foreground text-lg">
          Select the life areas you want to focus on in {APP_CONFIG.year}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {categories.map(({ name, icon: Icon, description }) => (
          <Card
            key={name}
            onClick={() => onToggleCategory(name)}
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover-scale",
              selectedCategories.includes(name)
                ? "border-primary bg-primary/5 shadow-elegant animate-scale-in"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  selectedCategories.includes(name)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-1">{name}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={selectedCategories.length === 0}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale min-w-48"
        >
          Continue ({selectedCategories.length} selected) →
        </Button>
      </div>
    </div>
  );
};
