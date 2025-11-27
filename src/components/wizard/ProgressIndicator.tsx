import { cn } from "@/lib/utils";
import { Clock, Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  estimatedTimeLeft?: number;
}

const stepLabels = [
  "Wheel of Life",
  "Categories",
  "Goals",
  "Actions",
  "Habits",
  "Motivation",
  "Summary",
];

export const ProgressIndicator = ({ currentStep, totalSteps, estimatedTimeLeft = 10 }: ProgressIndicatorProps) => {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  const timePerStep = estimatedTimeLeft / (totalSteps - currentStep + 1);
  const minutesLeft = Math.ceil(timePerStep * (totalSteps - currentStep));

  return (
    <div className="max-w-4xl mx-auto mb-8 md:mb-10 space-y-4 md:space-y-6">
      {/* Progress Stats */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
              {progressPercentage}%
            </div>
            <div className="absolute -inset-1 bg-gradient-primary opacity-20 blur-lg -z-10 animate-pulse" />
          </div>
          <div className="text-xs md:text-sm text-muted-foreground font-medium">Complete</div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-card/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-sm">
          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="text-xs md:text-sm font-medium text-foreground">~{minutesLeft} min</span>
        </div>
      </div>

      {/* Current Step Label */}
      <div className="text-center py-2 md:py-3 px-4 md:px-6 bg-card border border-primary/20 rounded-lg shadow-sm">
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Step {currentStep} of {totalSteps}</p>
        <h3 className="text-xl md:text-2xl font-bold text-foreground animate-fade-in">
          {stepLabels[currentStep - 1]}
        </h3>
      </div>

      {/* Step Indicators */}
      <div className="relative flex items-center justify-between px-2 md:px-4">
        {/* Background connecting line */}
        <div className="absolute left-0 right-0 top-5 md:top-6 h-0.5 bg-border -z-10" />
        
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            {/* Step Circle */}
            <div
              className={cn(
                "relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 z-10 tap-target",
                step < currentStep
                  ? "bg-success shadow-lg shadow-success/30 scale-100 animate-scale-in"
                  : step === currentStep
                  ? "bg-gradient-primary shadow-xl shadow-primary/40 scale-110 animate-scale-in ring-4 ring-primary/20"
                  : "bg-secondary border-2 border-border scale-90 opacity-60"
              )}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5 md:w-6 md:h-6 text-success-foreground" strokeWidth={3} />
              ) : (
                <span className={cn(
                  "text-xs md:text-sm",
                  step === currentStep ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              )}
              
              {/* Pulse effect for current step */}
              {step === currentStep && (
                <div className="absolute inset-0 rounded-full bg-gradient-primary animate-ping opacity-30" />
              )}
            </div>
            
            {/* Step Label - Hidden on mobile */}
            <p
              className={cn(
                "text-[10px] md:text-xs mt-2 md:mt-3 text-center hidden md:block transition-all duration-300 max-w-[80px]",
                step === currentStep 
                  ? "text-foreground font-bold" 
                  : step < currentStep
                  ? "text-muted-foreground font-medium"
                  : "text-muted-foreground/60"
              )}
            >
              {stepLabels[step - 1]}
            </p>
            
            {/* Connecting Line (completed portion) */}
            {step < totalSteps && step < currentStep && (
              <div className="absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-6 h-1 bg-success z-0 animate-fade-in" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
