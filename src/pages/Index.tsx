import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WizardStepBoundary } from "@/components/wizard/WizardStepBoundary";
import { OnboardingScreen } from "@/components/wizard/OnboardingScreen";
import { ProgressIndicator } from "@/components/wizard/ProgressIndicator";
import { Step0WheelOfLife } from "@/components/wizard/Step0WheelOfLife";
import { Step1PrimarySecondary } from "@/components/wizard/Step1PrimarySecondary";
import { Step2Goals } from "@/components/wizard/Step2Goals";
import { Step3Actions } from "@/components/wizard/Step3Actions";
import { Step4Habits } from "@/components/wizard/Step4Habits";
import { Step5Motivation } from "@/components/wizard/Step5Motivation";
import { Step6Summary } from "@/components/wizard/Step6Summary";
import { RestoreSessionDialog } from "@/components/wizard/RestoreSessionDialog";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { MusicToggle } from "@/components/ui/music-toggle";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  WizardStep,
  LifeCategory,
  ActionStep,
  CategoryGoal,
} from "@/types/wizard";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useSaveResume } from "@/hooks/useSaveResume";
import { generateSuccessPDF } from "@/utils/pdfGenerator";
import { getErrorMessage } from "@/lib/error-messages";
import { safeLocalStorage } from "@/lib/storage";
import { logger } from "@/lib/logger";

const Index = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [primaryCategory, setPrimaryCategory] = useState<LifeCategory | null>(
    null
  );
  const [secondaryCategories, setSecondaryCategories] = useState<
    LifeCategory[]
  >([]);
  const [lifeWheelRatings, setLifeWheelRatings] = useState<
    Record<LifeCategory, number>
  >({} as Record<LifeCategory, number>);
  const [selectedCategories, setSelectedCategories] = useState<LifeCategory[]>(
    []
  );
  const [goals, setGoals] = useState<Record<LifeCategory, string>>(
    {} as Record<LifeCategory, string>
  );
  const [actions, setActions] = useState<Record<LifeCategory, ActionStep>>(
    {} as Record<LifeCategory, ActionStep>
  );
  const [habits, setHabits] = useState<Record<LifeCategory, string>>(
    {} as Record<LifeCategory, string>
  );
  const [motivation, setMotivation] = useState<
    Record<LifeCategory, { why: string; consequence: string }>
  >({} as Record<LifeCategory, { why: string; consequence: string }>);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const { isPlaying, toggleMusic } = useBackgroundMusic();
  const { sessionId, loadSession } = useSaveResume();

  const wizardData = {
    hasStarted,
    currentStep,
    primaryCategory,
    secondaryCategories,
    lifeWheelRatings,
    selectedCategories,
    goals,
    actions,
    habits,
    motivation,
    userName,
    userEmail,
  };

  const { lastSaved, isSaving } = useAutoSave(
    wizardData,
    `wizard_${sessionId}`
  );

  // Track if user has made meaningful progress (for beforeunload warning)
  const hasProgress = useRef(false);

  useEffect(() => {
    // Check if user has made meaningful progress
    const hasData =
      hasStarted ||
      Object.keys(goals).length > 0 ||
      Object.keys(lifeWheelRatings).length > 0 ||
      primaryCategory !== null ||
      userName.length > 0;

    hasProgress.current = hasData;
  }, [
    hasStarted,
    goals,
    lifeWheelRatings,
    primaryCategory,
    userName,
  ]);

  // Warn user when leaving page with unsaved progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasProgress.current && hasStarted) {
        // Modern browsers require returnValue to be set
        e.preventDefault();
        e.returnValue =
          "You have unsaved progress. Your work is being saved automatically, but make sure you can return to continue.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasStarted]);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) {
        setIsLoadingSession(false);
        return;
      }

      try {
        const saved = loadSession();

        // Check if we have saved data with meaningful content
        // Require hasStarted to be true OR currentStep > 0 to ensure it's actual progress
        const hasValidSavedData =
          saved &&
          (saved.hasStarted ||
            (saved.currentStep !== undefined && saved.currentStep > 0) ||
            Object.keys(saved.goals || {}).length > 0 ||
            Object.keys(saved.lifeWheelRatings || {}).length > 0 ||
            saved.primaryCategory !== null ||
            saved.userName);

        // Only show restore dialog if:
        // 1. We have valid saved data
        // 2. User hasn't started yet (hasStarted is false)
        if (hasValidSavedData && !hasStarted) {
          setSavedSessionData(saved);
          // Small delay to ensure UI is ready for dialog
          setTimeout(() => {
            setShowRestoreDialog(true);
          }, 300);
        }
      } catch (error) {
        logger.error("Failed to load saved progress:", error);
        toast.error("Failed to load saved progress. Starting fresh.");
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleRestoreSession = () => {
    if (!savedSessionData) return;

    setCurrentStep(savedSessionData.currentStep || 0);
    setPrimaryCategory(savedSessionData.primaryCategory || null);
    setSecondaryCategories(savedSessionData.secondaryCategories || []);
    setLifeWheelRatings(
      savedSessionData.lifeWheelRatings ||
        ({} as Record<LifeCategory, number>)
    );
    setSelectedCategories(savedSessionData.selectedCategories || []);
    setGoals(
      savedSessionData.goals || ({} as Record<LifeCategory, string>)
    );
    setActions(
      savedSessionData.actions || ({} as Record<LifeCategory, ActionStep>)
    );
    setHabits(
      savedSessionData.habits || ({} as Record<LifeCategory, string>)
    );
    setMotivation(
      savedSessionData.motivation ||
        ({} as Record<LifeCategory, { why: string; consequence: string }>)
    );
    setUserName(savedSessionData.userName || "");
    setUserEmail(savedSessionData.userEmail || "");
    setHasStarted(true);
    setShowRestoreDialog(false);
    toast.success("✅ Progress restored! Welcome back!");
  };

  const handleCancelRestore = () => {
    // User chose not to restore - clear the saved session to avoid asking again
    try {
      if (sessionId) {
        localStorage.removeItem(`wizard_${sessionId}`);
      }
    } catch (error) {
      logger.error("Failed to clear session:", error);
    }
    setShowRestoreDialog(false);
    setSavedSessionData(null);
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleSelectPrimary = (category: LifeCategory) => {
    try {
      setPrimaryCategory(category);
      setSelectedCategories([
        category,
        ...secondaryCategories.filter((c) => c !== category),
      ]);
    } catch (error) {
      logger.error("Failed to select primary category:", error);
      toast.error("Failed to save selection. Please try again.");
    }
  };

  const handleToggleSecondary = (category: LifeCategory) => {
    try {
      setSecondaryCategories((prev) => {
        const newSecondary = prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category];
        setSelectedCategories(
          [primaryCategory!, ...newSecondary].filter(Boolean) as LifeCategory[]
        );
        return newSecondary;
      });
    } catch (error) {
      logger.error("Failed to toggle secondary category:", error);
      toast.error("Failed to save selection. Please try again.");
    }
  };

  const handleUpdateLifeWheelRating = (
    category: LifeCategory,
    rating: number
  ) => {
    try {
      setLifeWheelRatings((prev) => ({ ...prev, [category]: rating }));
    } catch (error) {
      logger.error("Failed to update rating:", error);
      toast.error("Failed to save rating. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    setIsPdfGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Smooth UX

      const result = await generateSuccessPDF({
        userName,
        userEmail,
        goals: compiledGoals,
        primaryCategory,
        secondaryCategories,
        lifeWheelRatings,
      });

      toast.success(`PDF downloaded: ${result.fileName}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error("PDF generation error:", error);
      toast.error(errorMessage);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const compiledGoals: CategoryGoal[] = selectedCategories.map((category) => ({
    category,
    mainGoal: goals[category] || "",
    actions: actions[category] || { small: "", medium: "", big: "" },
    monthlyCheckIn: habits[category] || "",
    motivation: motivation[category] || { why: "", consequence: "" },
  }));

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          <LoadingSpinner size="lg" text="Loading your session..." centered />
          <div className="space-y-3 mt-8">
            <div className="skeleton-text w-3/4 mx-auto" />
            <div className="skeleton-text w-full mx-auto" />
            <div className="skeleton-text w-5/6 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <>
        <OnboardingScreen onStart={handleStart} />
        <RestoreSessionDialog
          open={showRestoreDialog}
          onRestore={handleRestoreSession}
          onCancel={handleCancelRestore}
          currentStep={savedSessionData?.currentStep}
        />
      </>
    );
  }

  return (
    <>
      <RestoreSessionDialog
        open={showRestoreDialog}
        onRestore={handleRestoreSession}
        onCancel={handleCancelRestore}
        currentStep={savedSessionData?.currentStep}
      />
      <div className="min-h-screen bg-gradient-subtle py-6 md:py-8 px-4 landscape-compact">
      <div className="container mx-auto max-w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1" />
          <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          <MusicToggle
            isPlaying={isPlaying}
            onToggle={toggleMusic}
            className="ml-4"
          />
        </div>
        <ProgressIndicator
          currentStep={currentStep + 1}
          totalSteps={7}
          estimatedTimeLeft={12}
        />

        {currentStep === 0 && (
          <WizardStepBoundary
            stepName="Wheel of Life"
            onSkip={() => setCurrentStep(1)}
          >
            <Step0WheelOfLife
              ratings={lifeWheelRatings}
              onUpdateRating={handleUpdateLifeWheelRating}
              onNext={() => setCurrentStep(1)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 1 && (
          <WizardStepBoundary
            stepName="Category Selection"
            onSkip={() => setCurrentStep(2)}
          >
            <Step1PrimarySecondary
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              lifeWheelRatings={lifeWheelRatings}
              onSelectPrimary={handleSelectPrimary}
              onToggleSecondary={handleToggleSecondary}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 2 && (
          <WizardStepBoundary stepName="Goals">
            <Step2Goals
              selectedCategories={selectedCategories}
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              goals={goals}
              onUpdateGoal={(category, goal) =>
                setGoals((prev) => ({ ...prev, [category]: goal }))
              }
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 3 && (
          <WizardStepBoundary stepName="Actions">
            <Step3Actions
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              actions={actions}
              onUpdateActions={(category, categoryActions) =>
                setActions((prev) => ({ ...prev, [category]: categoryActions }))
              }
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 4 && (
          <WizardStepBoundary stepName="Habits">
            <Step4Habits
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              habits={habits}
              onUpdateHabit={(category, habit) =>
                setHabits((prev) => ({ ...prev, [category]: habit }))
              }
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 5 && (
          <WizardStepBoundary stepName="Motivation">
            <Step5Motivation
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              motivation={motivation}
              onUpdateMotivation={(category, type, value) =>
                setMotivation((prev) => ({
                  ...prev,
                  [category]: {
                    ...(prev[category] || { why: "", consequence: "" }),
                    [type]: value,
                  },
                }))
              }
              onNext={() => setCurrentStep(6)}
              onBack={() => setCurrentStep(4)}
            />
          </WizardStepBoundary>
        )}

        {currentStep === 6 && (
          <WizardStepBoundary stepName="Summary">
            <Step6Summary
              goals={compiledGoals}
              primaryCategory={primaryCategory}
              secondaryCategories={secondaryCategories}
              userName={userName}
              userEmail={userEmail}
              isPdfGenerating={isPdfGenerating}
              onUpdateUserInfo={(field, value) => {
                if (field === "name") setUserName(value);
                else setUserEmail(value);
              }}
              onDownloadPDF={handleDownloadPDF}
              onBack={() => setCurrentStep(5)}
              lifeWheelRatings={lifeWheelRatings}
            />
          </WizardStepBoundary>
        )}
      </div>
    </div>
    </>
  );
};

export default Index;
