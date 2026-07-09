import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  error,
  value,
  onChange,
  containerClassName = '',
  className = '',
  placeholder = 'Select option...',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white text-slate-800 text-sm px-3.5 py-2.5 rounded-lg border appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-slate-200'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};

interface SearchableSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  containerClassName?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search & select...',
  error,
  containerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Sync initial label
  useEffect(() => {
    if (selectedOption) {
      setSearch('');
    }
  }, [value, selectedOption]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`w-full flex flex-col gap-1.5 relative ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white text-slate-800 text-sm px-3.5 py-2.5 rounded-lg border flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-brand-500 select-none ${
            error ? 'border-red-500' : 'border-slate-200'
          }`}
        >
          <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-100 rounded-lg shadow-premium max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-450"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="h-3 w-3 text-slate-400 hover:text-slate-655" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-slate-55 hover:bg-slate-50 transition-colors ${
                      opt.value === value ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-3.5 py-3 text-xs text-slate-400 text-center select-none">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default Dropdown;
