import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'sentiment-positive' | 'sentiment-neutral' | 'sentiment-negative';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = '',
  ...props
}) => {
  const styles = {
    primary: 'bg-brand-50 text-brand-600 border-brand-100',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    'sentiment-positive': 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold',
    'sentiment-neutral': 'bg-slate-100 text-slate-700 border-slate-200 font-semibold',
    'sentiment-negative': 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
