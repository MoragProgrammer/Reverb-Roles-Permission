import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, NotebookPen, UsersRound, Notebook, FileText, Bell, Inbox, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
       {
        title: 'Posts',
        href: '/posts',
        icon: NotebookPen,
    },
//add new side bar--------------also import icon "UsersRound"-----
     {
        title: 'Users',
        href: '/users',
        icon: UsersRound,
    },
     {
        title: 'Roles',
        href: '/roles',
        icon: Notebook,
    },
// Add Forms, Notifications, and Submissions
    {
        title: 'Forms',
        href: '/forms',
        icon: FileText,
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Submissions',
        href: '/submissions',
        icon: Inbox,
    },
    {
        title: 'Customization',
        href: '/customization',
        icon: Settings,
    },
//-------------------------------------
];

const footerNavItems: NavItem[] = [];
// Repository and Documentation items removed

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
