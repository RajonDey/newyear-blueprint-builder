import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

const comparisons = [
  {
    feature: "Time to Create Plan",
    diy: "3-5 hours of research",
    blueprint: "10 minutes guided process",
  },
  {
    feature: "Frameworks Used",
    diy: "Generic advice from blogs",
    blueprint: "OKRs + SMART Goals + Atomic Habits",
  },
  {
    feature: "Action Breakdown",
    diy: "Vague to-do lists",
    blueprint: "Step-by-step milestones",
  },
  {
    feature: "Progress Tracking",
    diy: "Manual spreadsheets",
    blueprint: "Built-in habit tracker & reviews",
  },
  {
    feature: "Motivation System",
    diy: "Hope and willpower",
    blueprint: "Emergency motivation page",
  },
  {
    feature: "Professional Output",
    diy: "Scattered notes",
    blueprint: "Beautiful PDF + Notion template",
  },
];

export const ComparisonTable = () => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Why This Beats DIY Planning
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Save hours of research and guesswork with a proven system
          </p>
        </div>

        <Card className="overflow-hidden border-primary/20">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 md:p-4 font-semibold text-foreground text-sm md:text-base"></th>
                  <th className="text-center p-3 md:p-4 font-semibold text-muted-foreground text-sm md:text-base">
                    DIY Planning
                  </th>
                  <th className="text-center p-3 md:p-4 font-semibold text-primary bg-primary/5 text-sm md:text-base">
                    {APP_CONFIG.year} Blueprint
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {item.feature}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <X className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="text-sm">{item.diy}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <div className="flex items-center justify-center gap-2 text-foreground">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm font-medium">{item.blueprint}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
