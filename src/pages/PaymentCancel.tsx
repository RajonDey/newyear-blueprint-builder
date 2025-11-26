import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_CONFIG } from "@/lib/config";

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleReturnToSummary = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 shadow-elegant text-center">
        <div className="mb-6 flex justify-center">
          <XCircle className="w-16 h-16 text-muted-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Payment Cancelled
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          No worries! Your progress has been saved and you can complete your purchase anytime.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleReturnToSummary}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 hover-scale h-14"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Summary
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Your {APP_CONFIG.year} Success Blueprint data is still available
        </p>
      </Card>
      </div>
    </div>
  );
};

export default PaymentCancel;
