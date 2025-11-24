import { Card } from "@/components/ui/card";
import { X, Check, ArrowRight } from "lucide-react";

const comparison = {
  before: [
    "Vague New Year's resolutions that fizzle out by February",
    "Overwhelming to-do lists with no clear priorities",
    "Starting projects but never finishing them",
    "Feeling stuck in the same patterns year after year",
    "No clear system to track progress or stay accountable",
  ],
  after: [
    "Crystal-clear SMART goals with step-by-step action plans",
    "Focused priorities aligned with what matters most",
    "Daily habits that build momentum automatically",
    "Measurable progress you can see and celebrate",
    "A structured system that keeps you on track all year",
  ],
};

export const BeforeAfterComparison = () => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Stop Planning Like It's 2024
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Most people set goals the same way every year. Here's why they fail.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-8 items-center">
          {/* Before */}
          <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5 touch-feedback">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Without a System
              </h3>
            </div>
            <ul className="space-y-4">
              {comparison.before.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
            <ArrowRight className="w-12 h-12 text-primary" />
          </div>

          {/* After */}
          <Card className="p-6 md:p-8 border-success/20 bg-success/5 touch-feedback">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                With This Blueprint
              </h3>
            </div>
            <ul className="space-y-4">
              {comparison.after.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
