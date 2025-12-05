import { useState } from "react";
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

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen = ({ onStart }: OnboardingScreenProps) => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);

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

  return (
    <>
      <CommitmentModal 
        open={showCommitmentModal} 
        onCommit={handleCommit}
        onClose={handleClose}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
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
