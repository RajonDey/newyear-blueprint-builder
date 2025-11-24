import { Shield, Clock, Award, RefreshCw } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption",
  },
  {
    icon: Clock,
    title: "Instant Access",
    description: "Download immediately",
  },
  {
    icon: Award,
    title: "Proven System",
    description: "4 trusted frameworks",
  },
  {
    icon: RefreshCw,
    title: "30-Day Guarantee",
    description: "Full refund, no questions",
  },
];

export const TrustBadges = () => {
  return (
    <div className="py-8 border-y border-border bg-card">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-sm text-foreground mb-1">
                  {badge.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
