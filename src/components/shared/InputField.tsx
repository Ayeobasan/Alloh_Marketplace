import React from 'react';
import { cn } from '@/lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, rightElement, className, ...props }) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-bold text-slate-700">{label}</label>
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
      </div>
      <div className="relative">
        <input 
          className={cn(
            "input-field",
            error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "bg-slate-50/50",
            rightElement && "pr-12",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};
