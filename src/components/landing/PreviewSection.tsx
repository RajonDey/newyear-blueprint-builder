import { Card } from "@/components/ui/card";
import { FileText, Target, CheckSquare, TrendingUp } from "lucide-react";

const previewItems = [
  {
    icon: Target,
    title: "Wheel of Life Assessment",
    description: "Visual rating of 8 key life areas with current scores and target goals",
  },
  {
    icon: CheckSquare,
    title: "SMART Goals Breakdown",
    description: "Specific, measurable goals for your top priorities with deadlines",
  },
  {
    icon: TrendingUp,
    title: "Action Plans & Milestones",
    description: "Step-by-step roadmap with quarterly milestones and key results",
  },
  {
    icon: FileText,
    title: "Daily Habit Tracker",
    description: "Small, sustainable habits with implementation plans and triggers",
  },
];

export const PreviewSection = () => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What's Inside Your 2025 Blueprint
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive, professional plan tailored to your goals
          </p>
        </div>

        {/* Preview Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {previewItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                className="p-5 md:p-6 hover-lift touch-feedback"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-glow">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sample Preview */}
        <Card className="p-8 bg-gradient-subtle border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Premium PDF + Notion Template
              </h3>
              <p className="text-muted-foreground mb-4">
                Get your complete plan in a beautifully designed PDF, plus an interactive Notion template to track progress all year.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  Printable PDF
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  Notion Template
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  Progress Tracker
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  Lifetime Access
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
