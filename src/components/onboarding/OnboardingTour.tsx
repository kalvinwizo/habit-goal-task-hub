/**
 * OnboardingTour - Full-screen onboarding dialog
 */

import { useOnboarding, ONBOARDING_STEPS } from '@/hooks/useOnboarding';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Target, 
  ListChecks, 
  BarChart3, 
  Rocket,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const STEP_ICONS = [
  Sparkles,    // welcome
  CheckSquare, // habits
  Target,      // goals
  ListChecks,  // tasks
  BarChart3,   // analytics
  Rocket,      // complete
];

export function OnboardingTour() {
  const { 
    isActive, 
    currentStep, 
    currentStepData, 
    totalSteps,
    progress,
    next, 
    previous, 
    skip, 
    complete 
  } = useOnboarding();

  if (!isActive) return null;

  const Icon = STEP_ICONS[currentStep] || Sparkles;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isActive} onOpenChange={(open) => !open && skip()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="glass-card p-6 text-center relative">
          {/* Skip button */}
          <button
            onClick={skip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-2">
              {currentStep + 1} of {totalSteps}
            </p>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Icon className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            {currentStepData.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/40' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={previous}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={isLastStep ? complete : next}
              className="flex-1"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Rocket className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
