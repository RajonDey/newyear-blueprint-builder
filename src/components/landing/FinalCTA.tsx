import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onStart: () => void;
}

export const FinalCTA = ({ onStart }: FinalCTAProps) => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <Card className="max-w-3xl mx-auto p-6 md:p-8 lg:p-12 bg-gradient-subtle border-primary/20 shadow-elegant">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Make 2025 Your Best Year?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 2,347+ people who've already created their blueprint. 
            Start for free in the next 10 minutes.
          </p>

          {/* Benefits Checklist */}
          <div className="grid md:grid-cols-2 gap-3 mb-8 text-left">
            {[
              "Complete the planning for free",
              "Proven frameworks from top achievers",
              "Personalized to your unique goals",
              "Premium PDF available ($12)",
              "Notion template included",
              "30-day money-back guarantee",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onStart}
            size="lg"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 hover-scale text-lg h-14 px-12 shadow-elegant mb-4 animate-pulse-subtle"
          >
            Start Your 2025 Plan Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-muted-foreground">
            No credit card required • Takes only 10 minutes
          </p>
        </div>
      </Card>
    </div>
  );
};
