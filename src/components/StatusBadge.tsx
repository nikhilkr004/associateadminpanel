import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
    open: {
        label: 'Open',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
    },
    in_progress: {
        label: 'In Progress',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
    },
    resolved: {
        label: 'Resolved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
    },
    closed: {
        label: 'Closed',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
    },
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const config = statusConfig[status];

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

export default StatusBadge;
