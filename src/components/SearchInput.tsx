import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (val: string) => void;
  containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeValue,
  containerClassName = '',
  className = '',
  placeholder = 'Search...',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full max-w-md ${containerClassName}`}>
      <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
        <Search className="h-4.5 w-4.5" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white text-slate-800 text-sm pl-10 pr-9 py-2 rounded-lg border border-slate-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all ${className}`}
        {...props}
      />

      {value && (
        <button
          onClick={() => onChangeValue('')}
          className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
          aria-label="Clear search query"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
