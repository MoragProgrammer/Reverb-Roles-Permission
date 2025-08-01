import * as React from 'react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
    name: string;
    color: string;
    className?: string;
}

export function RoleBadge({ name, color, className }: RoleBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                className
            )}
            style={{
                backgroundColor: `${color}20`, // 20% opacity
                color: color,
                borderColor: `${color}40`, // 40% opacity
            }}
        >
            {name}
        </span>
    );
}
