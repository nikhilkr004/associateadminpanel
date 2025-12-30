import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  percentage: number;
  icon: LucideIcon;
  iconBgColor: string;
  progressColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentage,
  icon: Icon,
  iconBgColor,
  progressColor,
}) => {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <button className="p-1 hover:bg-secondary rounded-md transition-colors">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2.5 rounded-lg', iconBgColor)}>
          <Icon className="h-5 w-5 text-current" />
        </div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', progressColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
      </div>
    </div>
  );
};

export default StatCard;
