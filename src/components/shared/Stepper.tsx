import React from 'react';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
  subStepProgress?: number; // 0 to 1, representing progress between currentStep and next
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, subStepProgress = 0 }) => {
  // Calculate total progress percentage
  // If currentStep is 3 and subStepProgress is 0.5, line should be halfway between dot 3 and dot 4
  const totalProgress = ((currentStep - 1 + subStepProgress) / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="relative flex justify-between">
        {/* Progress Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-primary transition-all duration-700 ease-in-out -translate-y-1/2 z-0" 
          style={{ width: `${Math.min(totalProgress, 100)}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isActive = stepNumber <= currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "text-[10px] font-bold uppercase tracking-widest hidden sm:block transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}>
                Step {stepNumber}
              </div>
              <div 
                className={cn(
                  "w-4 h-4 rounded-full border-4 transition-all duration-300",
                  isActive ? "bg-primary border-white ring-2 ring-primary/20" : "bg-slate-200 border-white",
                  isCurrent && "scale-125"
                )} 
              />
              <div className={cn(
                "text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}>
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
