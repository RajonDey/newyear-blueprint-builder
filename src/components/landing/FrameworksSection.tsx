import { Card } from "@/components/ui/card";
import { Target, TrendingUp, Zap, Brain } from "lucide-react";

const frameworks = [
  {
    icon: Target,
    name: "SMART Goals",
    description: "Specific, Measurable, Achievable, Relevant, Time-bound framework",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: TrendingUp,
    name: "OKRs",
    description: "Objectives & Key Results used by Google, LinkedIn, and startups",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Zap,
    name: "Atomic Habits",
    description: "James Clear's proven system for building lasting habits",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Brain,
    name: "Wheel of Life",
    description: "Holistic assessment framework used by top life coaches",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export const FrameworksSection = () => {
  return (
    <div className="py-12 md:py-20 border-y border-border bg-secondary/30 scroll-fade-in">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary">
              Backed by Research & Proven Systems
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Built on 4 World-Class Frameworks
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't reinvent the wheel. We've combined the best goal-setting methodologies used by top performers worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {frameworks.map((framework, index) => {
            const Icon = framework.icon;
            return (
              <Card
                key={index}
                className="p-4 md:p-6 hover-lift touch-feedback bg-card border-border/50 backdrop-blur-sm"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${framework.bg} rounded-lg flex items-center justify-center mb-3 md:mb-4`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${framework.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  {framework.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {framework.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            "The 2025 Blueprint combines methodologies from Fortune 500 companies, best-selling authors, and certified life coaches into one streamlined process."
          </p>
        </div>
      </div>
    </div>
  );
};
