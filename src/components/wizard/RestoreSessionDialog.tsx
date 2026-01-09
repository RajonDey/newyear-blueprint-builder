import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCcw, Sparkles } from "lucide-react";
import { WizardStep } from "@/types/wizard";

interface RestoreSessionDialogProps {
  open: boolean;
  onRestore: () => void;
  onCancel: () => void;
  currentStep?: WizardStep;
}

export const RestoreSessionDialog = ({
  open,
  onRestore,
  onCancel,
  currentStep = 0,
}: RestoreSessionDialogProps) => {
  const stepNumber = (currentStep || 0) + 1;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              Continue Your Journey? 🎯
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              We found your saved progress! You were on <strong>Step {stepNumber} of 7</strong>.
            </p>
            <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Your progress is automatically saved. You can safely close this tab and come back anytime to continue from where you left off.
              </p>
            </div>
            <p className="text-sm font-medium">
              Would you like to continue where you left off?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row sm:justify-end gap-2">
          <AlertDialogCancel onClick={onCancel} className="sm:mt-0">
            Start Fresh
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onRestore}
            className="bg-gradient-primary hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Yes, Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

