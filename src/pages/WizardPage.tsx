import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/cn";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { StepDependencies } from "@/components/wizard/StepDependencies";
import { StepBuild } from "@/components/wizard/StepBuild";
import { StepConfigure } from "@/components/wizard/StepConfigure";
import { StepComplete } from "@/components/wizard/StepComplete";

const TOTAL_STEPS = 4;

export function WizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [stepReady, setStepReady] = useState<Record<number, boolean>>({});

  const markReady = useCallback(
    (stepIndex: number) => (ready: boolean) => {
      setStepReady((prev) => ({ ...prev, [stepIndex]: ready }));
    },
    [],
  );

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }

  function goToDashboard() {
    navigate("/dashboard", { replace: true });
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div
      className={cn(
        "flex h-screen w-screen flex-col",
        "bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950",
      )}
    >
      {/* Brand bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
          <Monitor className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-surface-200 tracking-tight">
          Deskpair Setup
        </span>
      </div>

      <WizardLayout
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onNext={isLastStep ? goToDashboard : goNext}
        canGoBack={step > 0 && !isLastStep}
        canGoNext={isLastStep || stepReady[step] !== false}
        nextLabel={isLastStep ? "Open Dashboard" : "Next"}
        showSkip={step < 2}
        onSkip={goNext}
      >
        {step === 0 && <StepDependencies onReady={markReady(0)} />}
        {step === 1 && <StepBuild onReady={markReady(1)} />}
        {step === 2 && <StepConfigure onReady={markReady(2)} />}
        {step === 3 && <StepComplete onOpenDashboard={goToDashboard} />}
      </WizardLayout>
    </div>
  );
}
