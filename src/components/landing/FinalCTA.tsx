import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

interface FinalCTAProps {
  onStart: () => void;
}

export const FinalCTA = ({ onStart }: FinalCTAProps) => {
  return (
    <div className="py-12 md:py-16 lg:py-20 pb-16 md:pb-20 lg:pb-24 scroll-fade-in">
      <Card className="max-w-3xl mx-auto p-6 md:p-8 lg:p-12 bg-gradient-subtle border-primary/20 shadow-elegant">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Ready to Make {APP_CONFIG.year} Your Best Year?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of people who've already created their blueprint. 
            Start for free in the next 10 minutes.
          </p>

          {/* Benefits Checklist */}
          <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10 text-left">
            {[
              "Complete the planning for free",
              "Proven frameworks from top achievers",
              "Personalized to your unique goals",
              "Full Blueprint Unlock ($9)",
              "Notion template included",
              "30-day money-back guarantee",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onStart}
            size="lg"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 hover-scale text-base md:text-lg h-12 md:h-14 px-8 md:px-12 shadow-elegant mb-4 animate-pulse-subtle"
          >
            Start Your {APP_CONFIG.year} Plan Now
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>

          <p className="text-xs md:text-sm text-muted-foreground">
            No credit card required • Takes only 10 minutes
          </p>
        </div>
      </Card>
    </div>
  );
};
