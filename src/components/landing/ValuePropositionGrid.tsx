import { Card } from "@/components/ui/card";
import { Brain, FileText, Lightbulb, TrendingUp, Shield, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

const benefits = [
  {
    icon: Brain,
    title: "Proven Frameworks",
    description: "Built on SMART Goals, OKRs, Atomic Habits & Wheel of Life - methods used by top achievers worldwide.",
  },
  {
    icon: FileText,
    title: "Beautiful Notion Template",
    description: "Instantly import to Notion. Track progress, update goals, and stay organized all year long.",
  },
  {
    icon: Lightbulb,
    title: "Personalized to You",
    description: "Not generic advice. Your unique goals, priorities, and lifestyle - structured for success.",
  },
  {
    icon: TrendingUp,
    title: "Actionable Daily Steps",
    description: `Break big goals into tiny habits. Know exactly what to do today to reach your ${APP_CONFIG.year} vision.`,
  },
  {
    icon: Shield,
    title: "No Commitment Required",
    description: "Complete the planning for free. Only pay to unlock the full blueprint and downloads.",
  },
  {
    icon: Sparkles,
    title: "Instant Results",
    description: "Walk away with a complete, professional plan in 10 minutes. Start executing immediately.",
  },
];

export const ValuePropositionGrid = () => {
  return (
    <div className="py-12 md:py-20 bg-secondary/30 scroll-fade-in">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why This System Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make {APP_CONFIG.year} your best year yet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className="p-5 md:p-6 hover-lift touch-feedback animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
