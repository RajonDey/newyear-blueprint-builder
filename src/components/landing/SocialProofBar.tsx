import { TrendingUp, Award, Target, Sparkles } from "lucide-react";
import { LiveActivityCounter } from "./LiveActivityCounter";

export const SocialProofBar = () => {
  const stats = [
    { icon: TrendingUp, value: "2,347+", label: "Plans Created" },
    { icon: Award, value: "94%", label: "Success Rate" },
    { icon: Target, value: "10 min", label: "Avg. Completion" },
    { icon: Sparkles, value: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="py-8 border-y border-border bg-secondary/50 scroll-fade-in">
      <div className="flex justify-center mb-6">
        <LiveActivityCounter />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
