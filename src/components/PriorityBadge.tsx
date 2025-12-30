import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
    priority: 'low' | 'medium' | 'high';
    size?: 'sm' | 'md' | 'lg';
}

const priorityConfig = {
    high: {
        label: 'High',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
    },
    medium: {
        label: 'Medium',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
    },
    low: {
        label: 'Low',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
    },
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
    const config = priorityConfig[priority];

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium border',
                config.bgColor,
                config.textColor,
                config.borderColor,
                sizeClasses[size]
            )}
        >
            {config.label}
        </span>
    );
};

export default PriorityBadge;
