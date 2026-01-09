import { useState, useEffect } from "react";
import { CommitmentModal } from "./CommitmentModal";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { HowItWorksTimeline } from "@/components/landing/HowItWorksTimeline";
import { BeforeAfterComparison } from "@/components/landing/BeforeAfterComparison";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { FrameworksSection } from "@/components/landing/FrameworksSection";
import { ValuePropositionGrid } from "@/components/landing/ValuePropositionGrid";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { PreviewSection } from "@/components/landing/PreviewSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { StickyCTABar } from "@/components/landing/StickyCTABar";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { Footer } from "@/components/Footer";
import { useSaveResume } from "@/hooks/useSaveResume";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen = ({ onStart }: OnboardingScreenProps) => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const { hasSavedSession, getResumeLink } = useSaveResume();

  useEffect(() => {
    // Check if there's meaningful saved progress
    // Only show banner if user has actually started planning (hasStarted = true OR currentStep > 0)
    const checkForSavedProgress = () => {
      try {
        // First check current session tracker
        const currentSession = localStorage.getItem("current_wizard_session");
        if (currentSession) {
          const sessionData = localStorage.getItem(`wizard_${currentSession}`);
          if (sessionData) {
            const parsed = JSON.parse(sessionData);
            // Only show if there's meaningful progress:
            // - hasStarted is true, OR
            // - currentStep > 0 (actually progressed past step 0), OR
            // - Has actual data filled in (goals, ratings, etc.)
            const hasMeaningfulProgress =
              parsed &&
              (parsed.hasStarted === true ||
                (parsed.currentStep !== undefined && parsed.currentStep > 0) ||
                Object.keys(parsed.goals || {}).length > 0 ||
                Object.keys(parsed.lifeWheelRatings || {}).length > 0 ||
                parsed.primaryCategory !== null ||
                (parsed.userName && parsed.userName.trim().length > 0));

            if (hasMeaningfulProgress) {
              setHasSavedProgress(true);
              return;
            }
          }
        }

        // Also check all wizard sessions for the most recent one with progress
        const allKeys = Object.keys(localStorage);
        const wizardKeys = allKeys.filter((key) =>
          key.startsWith("wizard_session_")
        );

        for (const key of wizardKeys) {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const parsed = JSON.parse(sessionData);
            const hasMeaningfulProgress =
              parsed &&
              (parsed.hasStarted === true ||
                (parsed.currentStep !== undefined && parsed.currentStep > 0) ||
                Object.keys(parsed.goals || {}).length > 0 ||
                Object.keys(parsed.lifeWheelRatings || {}).length > 0 ||
                parsed.primaryCategory !== null ||
                (parsed.userName && parsed.userName.trim().length > 0));

            if (hasMeaningfulProgress) {
              setHasSavedProgress(true);
              return;
            }
          }
        }

        // If hook's method works, use it as fallback
        const saved = hasSavedSession();
        if (saved) {
          // Double-check it has meaningful progress
          const currentSession = localStorage.getItem("current_wizard_session");
          if (currentSession) {
            const sessionData = localStorage.getItem(`wizard_${currentSession}`);
            if (sessionData) {
              const parsed = JSON.parse(sessionData);
              const hasMeaningfulProgress =
                parsed &&
                (parsed.hasStarted === true ||
                  (parsed.currentStep !== undefined &&
                    parsed.currentStep > 0) ||
                  Object.keys(parsed.goals || {}).length > 0 ||
                  Object.keys(parsed.lifeWheelRatings || {}).length > 0 ||
                  parsed.primaryCategory !== null);

              if (hasMeaningfulProgress) {
                setHasSavedProgress(true);
                return;
              }
            }
          }
        }

        // No meaningful progress found
        setHasSavedProgress(false);
      } catch (error) {
        console.error("Error checking for saved sessions:", error);
        setHasSavedProgress(false);
      }
    };

    checkForSavedProgress();
  }, [hasSavedSession]);

  const handleStartClick = () => {
    setShowCommitmentModal(true);
  };

  const handleCommit = () => {
    setShowCommitmentModal(false);
    onStart();
  };

  const handleClose = () => {
    setShowCommitmentModal(false);
  };

  const handleResumeClick = () => {
    // Reload page with session ID in URL to trigger restoration
    // First try to get the current session from localStorage
    try {
      const currentSession = localStorage.getItem("current_wizard_session");
      if (currentSession) {
        const resumeLink = `${window.location.origin}${window.location.pathname}?session=${currentSession}`;
        window.location.href = resumeLink;
        return;
      }
    } catch (error) {
      console.error("Failed to get current session:", error);
    }

    // Fallback to getResumeLink if available
    const resumeLink = getResumeLink();
    if (resumeLink && resumeLink.includes("session=")) {
      window.location.href = resumeLink;
    } else {
      // If no session found, just start normally - the Index page will discover it
      toast.info("Starting your session...");
      onStart();
    }
  };

  return (
    <>
      <CommitmentModal 
        open={showCommitmentModal} 
        onCommit={handleCommit}
        onClose={handleClose}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
        {/* Resume Progress Banner */}
        {hasSavedProgress && (
          <div className="bg-primary/10 border-b border-primary/20 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="text-foreground font-medium">
                    You have saved progress! Continue where you left off?
                  </span>
                </div>
                <Button
                  onClick={handleResumeClick}
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resume Planning
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20">
          <HeroSection onStart={handleStartClick} />
        </div>

        {/* Social Proof Bar */}
        <SocialProofBar />

        {/* How It Works Timeline */}
        <div className="container mx-auto px-4">
          <HowItWorksTimeline />
        </div>

        {/* Before/After Comparison (Pain/Agitation) */}
        <div className="container mx-auto px-4">
          <BeforeAfterComparison />
        </div>

        {/* Comparison Table */}
        <div className="container mx-auto px-4">
          <ComparisonTable />
        </div>

        {/* Frameworks Section (Authority) */}
        <FrameworksSection />

        {/* Value Proposition Grid */}
        <ValuePropositionGrid />

        {/* Testimonials */}
        <TestimonialCarousel />

        {/* Preview Section */}
        <div className="container mx-auto px-4">
          <PreviewSection />
        </div>

        {/* Showcase Section */}
        <ShowcaseSection />

        {/* Guarantee Section (Risk Reversal) */}
        <div className="container mx-auto px-4">
          <GuaranteeSection />
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Final CTA */}
        <div className="container mx-auto px-4">
          <FinalCTA onStart={handleStartClick} />
        </div>

        {/* Sticky CTA Bar */}
        <StickyCTABar onStart={handleStartClick} />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};
