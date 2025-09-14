
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, stepNames }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-teal-500 text-white ring-4 ring-teal-200'
                    : isCompleted
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <p className={`mt-2 text-xs md:text-sm font-medium ${isActive ? 'text-teal-600' : 'text-slate-500'}`}>
                {stepNames[index]}
              </p>
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  isCompleted ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
