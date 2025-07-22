import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function ColorPicker({ label, error, className, ...props }: ColorPickerProps) {
    const [color, setColor] = React.useState(props.value as string || '#3B82F6');

    return (
        <div className="grid gap-2">
            {label && (
                <Label htmlFor={props.id} className="text-sm font-medium leading-none">
                    {label}
                </Label>
            )}
            <div className="flex items-center gap-2">
                <div
                    className="size-8 rounded border"
                    style={{ backgroundColor: color }}
                />
                <Input
                    type="color"
                    className={cn("h-10 w-full", className)}
                    value={color}
                    onChange={(e) => {
                        setColor(e.target.value);
                        props.onChange?.(e);
                    }}
                    {...props}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
