import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
}) => {
  return (
    <Card hoverable className="p-5 flex items-start justify-between gap-4">
      <div className="flex-1">
        <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider select-none">
          {title}
        </span>
        <h3 className="text-2xl font-bold text-slate-800 mt-1.5 tracking-tight">
          {value}
        </h3>
        
        {(trend || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 shrink-0" />
                )}
                {trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-400 select-none">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
    </Card>
  );
};

export default StatCard;
