import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/role-badge';
import { PermissionGroups } from '@/components/permission-groups';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'View',
        href: '/roles/show',
    },
];

interface RoleType {
    id: number;
    name: string;
    badge_color: string;
}

export default function Show({ role, permissions }: { role: RoleType; permissions: string[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Role" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">View Role</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('roles.index')}>Back to Roles</Link>
                    </Button>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                                <RoleBadge name={role.name} color={role.badge_color} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Badge Color</h3>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-6 rounded border"
                                        style={{ backgroundColor: role.badge_color }}
                                    />
                                    <span className="text-sm">{role.badge_color}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PermissionGroups
                                permissions={permissions}
                                selectedPermissions={permissions}
                                readOnly
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}


