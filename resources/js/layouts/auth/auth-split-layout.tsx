import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote, settings } = usePage<SharedData>().props;
    
    const loginPicture = settings?.current_login_picture ? `/storage/${settings.current_login_picture}` : null;
    const overlayOpacity = settings?.login_overlay_opacity || '0.4';

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                {loginPicture ? (
                    <>
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                            style={{ backgroundImage: `url(${loginPicture})` }}
                        />
                        <div 
                            className="absolute inset-0 bg-black" 
                            style={{ opacity: overlayOpacity }}
                        /> {/* Dynamic overlay for better text readability */}
                    </>
                ) : (
                    <div className="absolute inset-0 bg-zinc-900" />
                )}
                {/* Logo and name removed */}
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                            <p className="text-lg" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {/* Mobile logo removed */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
