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
import { Save, ArrowLeft } from "lucide-react";

interface ExitConfirmationDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const ExitConfirmationDialog = ({
  open,
  onStay,
  onLeave,
}: ExitConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onStay()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Save className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              Your Progress is Saved! 💾
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              All your filled data will stay safe. You can continue from here
              when you come back.
            </p>
            <div className="bg-muted/50 p-3 rounded-lg border border-muted">
              <p className="text-sm text-muted-foreground">
                Your progress is automatically saved as you work. Feel free to
                close this tab anytime and pick up where you left off later.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row sm:justify-end gap-2 mt-4">
          <AlertDialogCancel
            onClick={onLeave}
            className="sm:mt-0 border-muted-foreground/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Anyway
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onStay}
            className="bg-gradient-primary hover:opacity-90"
          >
            Stay & Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
