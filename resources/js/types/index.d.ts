import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    permissions: string[];
    unreadNotificationsCount: number;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface CustomizationSettings {
    current_logo?: string | null;
    current_favicon?: string | null;
    current_title_text?: string;
    current_login_picture?: string | null;
    login_overlay_opacity?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    settings: CustomizationSettings;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    school_id: string;
    email: string;
    gender: 'Male' | 'Female';
    profile_picture: string | null;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
