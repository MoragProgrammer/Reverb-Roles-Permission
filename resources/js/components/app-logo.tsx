import AppLogoIcon from './app-logo-icon';

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { settings } = usePage<SharedData>().props;
    const titleText = settings?.current_title_text || 'Laravel Starter Kit';
    
    const logoSrc = settings?.current_logo ? `/storage/${settings.current_logo}` : null;

    return (
        <>
            {logoSrc ? (
                <img 
                    src={logoSrc} 
                    alt="Logo" 
                    className="aspect-square size-8 object-contain rounded-md" 
                />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{titleText}</span>
            </div>
        </>
    );
}
