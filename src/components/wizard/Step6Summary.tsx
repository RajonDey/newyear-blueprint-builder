import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CategoryGoal, LifeCategory } from "@/types/wizard";
import { useState } from "react";
import { Mail, User, Download, CreditCard, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { safeLocalStorage } from "@/lib/storage";
import { APP_CONFIG } from "@/lib/config";
import { generateSuccessPDF } from "@/utils/pdfGenerator";
import { logger } from "@/lib/logger";
import { validateEmail, validateName } from "@/lib/validation";
import { NotionModal } from "@/components/NotionModal";

interface Step6SummaryProps {
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  userName: string;
  userEmail: string;
  isPdfGenerating: boolean;
  onUpdateUserInfo: (field: "name" | "email", value: string) => void;
  onDownloadPDF: () => void;
  onBack: () => void;
}

// Replace this with your actual Lemon Squeezy checkout URL
const LEMON_SQUEEZY_CHECKOUT_URL = "https://yourstorename.lemonsqueezy.com/checkout/buy/YOUR-PRODUCT-ID";

export const Step6Summary = ({
  goals,
  primaryCategory,
  secondaryCategories,
  userName,
  userEmail,
  isPdfGenerating,
  onUpdateUserInfo,
  onDownloadPDF,
  onBack,
}: Step6SummaryProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);

  const primaryGoal = goals.find(g => g.category === primaryCategory);
  const secondaryGoals = goals.filter(g => secondaryCategories.includes(g.category));

  const handleSubmit = () => {
    // Validate name
    const nameValidation = validateName(userName);
    if (!nameValidation.valid) {
      toast.error(nameValidation.error || 'Please enter a valid name');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(userEmail);
    if (!emailValidation.valid) {
      toast.error(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    // Update with sanitized values
    if (nameValidation.sanitized) {
      onUpdateUserInfo('name', nameValidation.sanitized);
    }
    if (emailValidation.sanitized) {
      onUpdateUserInfo('email', emailValidation.sanitized);
    }

    setIsSubmitted(true);
  };

  const handleProceedToPayment = () => {
    setIsLoading(true);
    try {
      const paymentData = {
        goals,
        primaryCategory,
        secondaryCategories,
        userName,
        userEmail,
      };
      
      const saved = safeLocalStorage.setItem("wizard_payment_data", paymentData);
      if (!saved) {
        toast.error("Failed to prepare payment data. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.info("Redirecting to secure checkout...");

      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = `${window.location.origin}/cancel`;
      
      window.location.href = `${LEMON_SQUEEZY_CHECKOUT_URL}?checkout[custom][success_url]=${encodeURIComponent(successUrl)}&checkout[custom][cancel_url]=${encodeURIComponent(cancelUrl)}`;
    } catch (error) {
      logger.error('Failed to proceed to payment:', error);
      toast.error("Failed to proceed to checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          🎉 Your {APP_CONFIG.year} Success Blueprint
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          Review your complete plan below
        </p>
      </div>

      {!isSubmitted ? (
        <Card className="p-6 md:p-8 shadow-elegant hover-lift transition-all mb-6 md:mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Save Your Plan
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Your Name
              </Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => onUpdateUserInfo("name", e.target.value)}
                placeholder="Enter your name"
                className="h-11 md:h-12 transition-all focus:shadow-glow"
              />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Your Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => onUpdateUserInfo("email", e.target.value)}
                placeholder="Enter your email"
                className="h-11 md:h-12 transition-all focus:shadow-glow"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!userName || !userEmail}
              className="w-full bg-gradient-primary hover:opacity-90 hover-scale h-12"
            >
              View My Complete Plan →
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            {goals.map((goal, index) => (
              <Card key={index} className="p-5 md:p-6 shadow-soft">
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">{index + 1}.</span>
                  {goal.category}
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      MAIN GOAL
                    </p>
                    <p className="text-foreground">{goal.mainGoal}</p>
                  </div>

                  <div className="relative">
                    <div className="filter blur-[5px] select-none opacity-60 pointer-events-none">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                          ACTION STEPS
                        </p>
                        <div className="space-y-2 pl-4">
                          <p className="text-sm">
                            <span className="font-medium">🎯 Small:</span> {goal.actions.small}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">📈 Medium:</span> {goal.actions.medium}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">🏆 Big:</span> {goal.actions.big}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          MONTHLY CHECK-IN
                        </p>
                        <p className="text-sm text-foreground">{goal.monthlyCheckIn}</p>
                      </div>

                      <div className="bg-secondary p-4 rounded-lg mt-4">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          YOUR MOTIVATION
                        </p>
                        <p className="text-sm text-foreground mb-2">
                          <span className="font-medium">✨ Why it matters:</span> {goal.motivation.why}
                        </p>
                        <p className="text-sm text-foreground">
                          <span className="font-medium">⚠️ Cost of inaction:</span>{" "}
                          {goal.motivation.consequence}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-border">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 shadow-medium bg-gradient-subtle border-2 border-primary/20">
            <div className="text-center">
              <Badge className="mb-4 bg-primary text-primary-foreground">
                🎉 Limited Time: Early Access Price
              </Badge>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Unlock Full Blueprint + Downloads
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Get instant access to your detailed action plans, motivation strategies, and professional templates.
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-foreground">$9</span>
                  <span className="text-xl text-muted-foreground line-through">$19</span>
                </div>
                <p className="text-sm text-primary font-semibold">
                  Limited Time Launch Price
                </p>
              </div>

              <Button
              onClick={handleProceedToPayment}
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 hover-scale text-lg h-14 shadow-elegant animate-pulse-subtle"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Unlock Full Blueprint ($9)
                </>
              )}
            </Button>
            
            {/* DEV ONLY: Preview PDF Button */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2 mt-4">
                <Button
                  onClick={() => generateSuccessPDF({
                    userName,
                    userEmail,
                    goals,
                    primaryCategory: primaryCategory!,
                    secondaryCategories
                  })}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-muted-foreground/50 text-muted-foreground"
                >
                  🛠️ Dev: Preview PDF
                </Button>
                <Button
                  onClick={() => setIsNotionModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-muted-foreground/50 text-muted-foreground"
                >
                  🛠️ Dev: Preview Notion
                </Button>
              </div>
            )}
              
              <p className="text-sm text-muted-foreground mt-4">
                One-time payment • Instant download • Sent to {userEmail}
              </p>
            </div>
          </Card>

          <div className="flex justify-start mt-8">
            <Button onClick={onBack} variant="outline" size="lg" className="hover-scale">
              ← Back to Edit
            </Button>
          </div>
        </>
      )}
      
      <NotionModal 
        isOpen={isNotionModalOpen} 
        onClose={() => setIsNotionModalOpen(false)} 
        data={{
          userName,
          userEmail,
          goals,
          primaryCategory,
          secondaryCategories
        }} 
      />
    </div>
  );
};
