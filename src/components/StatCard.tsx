import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  percentage: number;
  icon: LucideIcon;
  iconBgColor: string;
  progressColor: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentage,
  icon: Icon,
  iconBgColor,
  progressColor,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || typeof value === 'string') return;
    
    const numValue = Number(value);
    const duration = 1000;
    const steps = 30;
    const stepValue = numValue / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= numValue) {
        setDisplayValue(numValue);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgressWidth(percentage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, percentage]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "bg-card rounded-xl p-5 shadow-card border border-border/50 hover-lift hover-glow cursor-pointer group",
        "transition-all duration-300",
        isVisible ? "animate-slide-up" : "opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <button className="p-1 hover:bg-secondary rounded-md transition-all duration-200 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110',
          iconBgColor
        )}>
          <Icon className="h-5 w-5 text-current" />
        </div>
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {typeof value === 'string' ? value : displayValue}
        </span>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000 ease-out', progressColor)}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
      </div>
    </div>
  );
};

export default StatCard;
