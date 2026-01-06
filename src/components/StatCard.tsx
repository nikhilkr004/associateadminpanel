import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconBgColor,
  iconColor,
}) => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/40 transition-all duration-200 hover:border-border">
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-xl', iconBgColor)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {change && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            changeType === 'positive' && 'text-emerald-600',
            changeType === 'negative' && 'text-red-500',
            changeType === 'neutral' && 'text-muted-foreground'
          )}>
            {changeType === 'positive' && <TrendingUp className="h-3.5 w-3.5" />}
            {change}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
