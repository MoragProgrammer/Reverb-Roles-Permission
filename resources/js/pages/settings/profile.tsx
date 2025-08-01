import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

interface Role {
    id: number;
    name: string;
    badge_color?: string;
}

interface UserWithRoles extends User {
    roles?: Role[];
}

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    
    // Cast user to include roles property
    const user = auth.user as UserWithRoles;

    // Get roles as a combined string
    const rolesText = user.roles?.map((role: Role) => role.name).join(', ') || 'No roles assigned';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="View your profile details" />

                    <div className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={auth.user.profile_picture ? `/storage/${auth.user.profile_picture}` : undefined} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(`${auth.user.first_name} ${auth.user.last_name}`)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <Label className="text-sm font-medium">Profile Picture</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {auth.user.profile_picture ? 'Profile picture set' : 'No profile picture'}
                                </p>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Full Name</Label>
                                <Input value={`${auth.user.first_name} ${auth.user.middle_name ? auth.user.middle_name + ' ' : ''}${auth.user.last_name}`} readOnly className="bg-muted" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Email Address</Label>
                                <Input value={auth.user.email} readOnly className="bg-muted" />
                            </div>

                            <div className="grid gap-2">
                                <Label>School ID</Label>
                                <Input value={auth.user.school_id || 'Not provided'} readOnly className="bg-muted" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Gender</Label>
                                <Input value={auth.user.gender || 'Not provided'} readOnly className="bg-muted" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Input value={auth.user.status || 'Not provided'} readOnly className="bg-muted" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Input value={rolesText} readOnly className="bg-muted" />
                            </div>
                        </div>
                    </div>
                </div>

            </SettingsLayout>
        </AppLayout>
    );
}
