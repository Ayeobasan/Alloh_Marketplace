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
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 py-8">
      <div className="relative flex justify-between items-end w-full">
        {/* Progress Line Background */}
        <div className="absolute bottom-[7px] left-2 right-2 h-[2px] bg-[#D9D9D9] z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute bottom-[7px] left-2 h-[2px] bg-primary transition-all duration-700 ease-in-out z-0" 
          style={{ width: `calc((100% - 16px) * ${Math.min(totalProgress, 100) / 100})` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isActive = stepNumber <= currentStep;

          return (
            <div key={step} className={cn(
              "relative z-10 flex flex-col gap-2 w-1/4",
              index === 0 ? "items-start" : index === steps.length - 1 ? "items-end" : "items-center"
            )}>
              <div className={cn(
                "flex flex-col",
                index === 0 ? "items-start text-left" : index === steps.length - 1 ? "items-end text-right" : "items-center text-center"
              )}>
                <div className={cn(
                  "hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors mb-1",
                  isActive ? "text-primary" : "text-inactive"
                )}>
                  Step {stepNumber}
                </div>
                <div className={cn(
                  "text-[9px] sm:text-sm md:text-base font-bold transition-colors leading-tight px-0.5",
                  isActive ? "text-primary" : "text-inactive",
                  "sm:whitespace-nowrap"
                )}>
                  {step}
                </div>
              </div>
              <div 
                className={cn(
                  "w-4 h-4 rounded-full transition-colors duration-300 relative shrink-0",
                  isActive ? "bg-primary" : "bg-[#D9D9D9]"
                )} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
