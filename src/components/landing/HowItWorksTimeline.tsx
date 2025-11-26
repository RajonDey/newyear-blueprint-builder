import { Card } from "@/components/ui/card";
import { Target, Zap, CheckCircle2, Rocket } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

const steps = [
  {
    icon: Target,
    step: "Step 1",
    title: "Rate Your Life",
    description: "Assess 8 key life categories using the Wheel of Life framework. See where you are now.",
    time: "2 min",
  },
  {
    icon: Zap,
    step: "Step 2",
    title: "Set SMART Goals",
    description: "Define clear, achievable goals for your priority areas using proven SMART methodology.",
    time: "3 min",
  },
  {
    icon: CheckCircle2,
    step: "Step 3",
    title: "Break Into Actions",
    description: "Transform goals into concrete action steps using OKR-style breakdown for realistic progress.",
    time: "3 min",
  },
  {
    icon: Rocket,
    step: "Step 4",
    title: "Build Daily Habits",
    description: "Create sustainable habits using Atomic Habits principles. Small changes, big results.",
    time: "2 min",
  },
];

export const HowItWorksTimeline = () => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your {APP_CONFIG.year} Plan in 4 Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guided process using world-class frameworks. No guessing, no overwhelm.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index}
                className="p-5 md:p-6 hover-lift touch-feedback animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {step.step}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {step.time}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-glow">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Total Time */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-success/10 rounded-full border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-success">
              Total Time: Just 10 Minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
