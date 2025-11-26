import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LifeCategory } from "@/types/wizard";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Sparkles, Heart, Briefcase, DollarSign, Users, Sparkles as SpiritIcon, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step0WheelOfLifeProps {
  ratings: Record<LifeCategory, number>;
  onUpdateRating: (category: LifeCategory, rating: number) => void;
  onNext: () => void;
}

const categoryConfig: Record<LifeCategory, { icon: any; color: string }> = {
  Health: { icon: Heart, color: "text-red-500" },
  Career: { icon: Briefcase, color: "text-blue-500" },
  Finance: { icon: DollarSign, color: "text-green-500" },
  Relationships: { icon: Users, color: "text-purple-500" },
  Spirituality: { icon: SpiritIcon, color: "text-yellow-500" },
  Passion: { icon: Flame, color: "text-orange-500" },
};

const categories: LifeCategory[] = [
  "Health",
  "Career",
  "Finance",
  "Relationships",
  "Spirituality",
  "Passion",
];

const getRatingColor = (rating: number) => {
  if (rating <= 4) return "text-destructive";
  if (rating <= 7) return "text-accent";
  return "text-success";
};

export const Step0WheelOfLife = ({
  ratings,
  onUpdateRating,
  onNext,
}: Step0WheelOfLifeProps) => {
  const chartData = categories.map((category) => ({
    category,
    value: ratings[category] || 0,
  }));

  const allRated = categories.every((cat) => ratings[cat] !== undefined && ratings[cat] > 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 md:mb-10 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Your Life Wheel Assessment
          </h2>
        </div>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
          Rate each life area from 1-10. This helps identify which area deserves your focus this year.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10">
        {/* Chart Section */}
        <Card className="p-4 md:p-8 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg">
          <ResponsiveContainer width="100%" height={450} className="md:!h-[450px]">
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" strokeWidth={1.5} />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ 
                  fill: 'hsl(var(--foreground))', 
                  fontSize: 13,
                  fontWeight: 600
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Radar
                name="Your Life"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sliders Section */}
        <div className="space-y-4 md:space-y-5">
          {categories.map((category) => {
            const rating = ratings[category] || 0;
            const Icon = categoryConfig[category].icon;
            
            return (
              <div key={category} className="space-y-2 touch-feedback p-2 rounded-lg -m-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={cn(
                      "p-1.5 md:p-2 rounded-lg bg-secondary transition-colors",
                      categoryConfig[category].color
                    )}>
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <Label htmlFor={category} className="text-sm md:text-base font-semibold cursor-pointer">
                      {category}
                    </Label>
                  </div>
                  <span className={cn(
                    "text-xl md:text-2xl font-bold transition-colors",
                    getRatingColor(rating)
                  )}>
                    {rating}
                  </span>
                </div>
                
                <Slider
                  id={category}
                  min={1}
                  max={10}
                  step={1}
                  value={[rating]}
                  onValueChange={(value) => onUpdateRating(category, value[0])}
                  className="cursor-pointer touch-none h-8"
                />
                
                {rating === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-1 animate-pulse">
                    Slide to rate
                  </p>
                )}
                
                {/* <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Needs Work</span>
                  <span>Excellent</span>
                </div> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!allRated}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 hover-scale min-w-56 h-12 shadow-lg"
        >
          Continue to Choose Focus →
        </Button>
      </div>
    </div>
  );
};
