import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/cn";

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  showSkip?: boolean;
}

const STEP_LABELS = ["Dependencies", "Build", "Configure", "Complete"];

export function WizardLayout({
  currentStep,
  totalSteps,
  children,
  onBack,
  onNext,
  onSkip,
  canGoBack,
  canGoNext,
  nextLabel = "Next",
  showSkip = false,
}: WizardLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="flex items-center gap-3 px-8 py-5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-2 w-full">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    "transition-all duration-300",
                    i < currentStep
                      ? "bg-accent-500 text-white"
                      : i === currentStep
                        ? "bg-accent-500/20 text-accent-400 ring-2 ring-accent-500/40"
                        : "bg-surface-800/60 text-surface-500",
                  )}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className="flex-1 h-px bg-surface-800/60">
                    <motion.div
                      className="h-full bg-accent-500"
                      initial={{ width: "0%" }}
                      animate={{ width: i < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  i <= currentStep ? "text-surface-300" : "text-surface-600",
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between border-t border-surface-800/40 px-8 py-4">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium",
            "border border-surface-700/50 bg-surface-800/50 text-surface-300",
            "transition-all hover:bg-surface-700/50",
            "disabled:opacity-30 disabled:cursor-not-allowed",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {showSkip && onSkip && (
            <button
              onClick={onSkip}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium",
                "text-surface-500 hover:text-surface-300 transition-colors",
              )}
            >
              Skip
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
              "bg-gradient-to-r from-accent-600 to-accent-500 text-white",
              "shadow-lg shadow-accent-500/15",
              "transition-all hover:shadow-accent-500/25",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
