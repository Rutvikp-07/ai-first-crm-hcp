import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  value,
  onChange,
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <input
          type="date"
          value={value}
          onChange={onChange}
          className={`w-full bg-white text-slate-800 text-sm pl-10 pr-3.5 py-2.5 rounded-lg border focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  value,
  onChange,
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <Clock className="h-4 w-4" />
        </div>
        <input
          type="time"
          value={value}
          onChange={onChange}
          className={`w-full bg-white text-slate-800 text-sm pl-10 pr-3.5 py-2.5 rounded-lg border focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
export default DatePicker;
