import { Card } from "@/components/ui/card";
import { Shield, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export const GuaranteeSection = () => {
  return (
    <div className="py-12 md:py-20 scroll-fade-in">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6 md:p-8 lg:p-12 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
              <Shield className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              100% Satisfaction Guarantee
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're so confident you'll love your {APP_CONFIG.year} Blueprint that we offer a no-questions-asked 30-day money-back guarantee
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">30 Days</h3>
              <p className="text-sm text-muted-foreground">
                Full refund window
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-success" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Questions</h3>
              <p className="text-sm text-muted-foreground">
                Simple refund process
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Keep Access</h3>
              <p className="text-sm text-muted-foreground">
                Free version stays yours
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-foreground text-center">
              <strong>Here's the deal:</strong> Complete your free {APP_CONFIG.year} Blueprint. If you love it and want the premium PDF + Notion template, it's just $12. Don't love it? Get a full refund within 30 days. The free plan you created is yours to keep forever.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
