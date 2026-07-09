import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-slate-700 select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-white text-slate-800 text-sm px-3.5 py-2.5 rounded-lg border min-h-[100px] resize-y ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
          } focus:border-transparent focus:outline-none focus:ring-2 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400 transition-all ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
