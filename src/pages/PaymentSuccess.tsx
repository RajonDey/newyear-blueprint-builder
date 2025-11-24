import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, AlertCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateSuccessPDF } from "@/utils/pdfGenerator";
import { CategoryGoal, LifeCategory } from "@/types/wizard";
import { toast } from "sonner";
import { fetchWithRetry, ApiError } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error-messages";
import { safeLocalStorage } from "@/lib/storage";

interface StoredWizardData {
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  userName: string;
  userEmail: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [wizardData, setWizardData] = useState<StoredWizardData | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkoutId = searchParams.get("checkout_id");
    
    if (!checkoutId) {
      navigate("/");
      return;
    }

    // Retrieve wizard data from localStorage
    const data = safeLocalStorage.getItem<StoredWizardData | null>("wizard_payment_data", null);
    if (!data) {
      navigate("/");
      return;
    }

    setWizardData(data);

    // Verify payment with backend
    verifyPayment(checkoutId);
  }, [searchParams, navigate]);

  const verifyPayment = async (checkoutId: string) => {
    try {
      const response = await fetchWithRetry('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkoutId }),
        retries: 3,
        timeout: 20000,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Payment verification failed', response.status);
      }

      setIsVerified(true);
      toast.success('Payment verified successfully!');
    } catch (error) {
      console.error('Payment verification error:', error);
      
      let errorMessage: string;
      if (error instanceof ApiError) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Payment verification timed out. Please refresh and try again.';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = getErrorMessage(error);
      }
      
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!wizardData) return;

    try {
      generateSuccessPDF({
        userName: wizardData.userName,
        userEmail: wizardData.userEmail,
        primaryCategory: wizardData.primaryCategory,
        secondaryCategories: wizardData.secondaryCategories,
        goals: wizardData.goals,
      });

      safeLocalStorage.removeItem('wizard_payment_data');
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('PDF download error:', error);
      toast.error(errorMessage);
    }
  };

  const handleReturnHome = () => {
    safeLocalStorage.removeItem('wizard_payment_data');
    navigate('/');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent("Just created my 2025 Success Blueprint! 🎯 Ready to achieve my goals with a clear action plan. Check it out!");
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (!wizardData) {
    return null;
  }

  // Show loading state while verifying with skeleton
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 md:p-8 shadow-elegant">
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin" />
            </div>
            <div className="space-y-4 animate-fade-in">
              <div className="skeleton-text w-3/4 h-8 mx-auto" />
              <div className="skeleton-text w-full h-4 mx-auto" />
              <div className="skeleton-text w-5/6 h-4 mx-auto" />
              
              <div className="mt-8 space-y-3">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
              </div>
              
              <div className="mt-6 flex justify-center gap-2">
                <div className="skeleton-circle w-8 h-8" />
                <div className="skeleton-circle w-8 h-8" />
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state if verification failed
  if (verificationError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8 shadow-elegant text-center">
            <div className="mb-6 flex justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Payment Verification Failed
            </h1>
            <p className="text-muted-foreground mb-6">
              {verificationError}
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              If you believe this is an error, please contact support with your order details.
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Show success state only if verified
  if (!isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 shadow-elegant text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Thank you for your purchase, {wizardData.userName}! Your 2025 Success Blueprint is ready.
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 hover-scale h-14"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Your Premium PDF
            </Button>

            <Button
              onClick={handleReturnHome}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Your Success Journey
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleShareTwitter}
                variant="outline"
                size="sm"
                className="touch-feedback tap-target"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </Button>
              <Button
                onClick={handleShareLinkedIn}
                variant="outline"
                size="sm"
                className="touch-feedback tap-target"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            A copy has also been sent to {wizardData.userEmail}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
