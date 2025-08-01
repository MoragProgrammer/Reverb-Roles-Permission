import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { PermissionGroups } from '@/components/permission-groups';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'Edit',
        href: '/roles/edit',
    },
];

interface RoleType {
    id: number;
    name: string;
    badge_color: string;
}

interface FormDataType {
    name: string;
    badge_color: string;
    permissions: string[];
    [key: string]: string | string[];
}

export default function Edit({ role, rolePermissions, permissions }: {
    role: RoleType;
    rolePermissions: string[];
    permissions: string[];
}) {
    const { data, setData, errors, put } = useForm<FormDataType>({
        name: role.name,
        badge_color: role.badge_color,
        permissions: rolePermissions,
    });

    function handlePermissionChange(permission: string, checked: boolean) {
        if (checked) {
            setData("permissions", [...data.permissions, permission]);
        } else {
            setData("permissions", data.permissions.filter(name => name !== permission));
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('roles.update', role.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Edit Role</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('roles.index')}>Back to Roles</Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter role name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <ColorPicker
                                id="badge_color"
                                label="Badge Color"
                                value={data.badge_color}
                                onChange={(e) => setData('badge_color', e.target.value)}
                                error={errors.badge_color}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PermissionGroups
                                permissions={permissions}
                                selectedPermissions={data.permissions}
                                onChange={handlePermissionChange}
                            />
                            {errors.permissions && (
                                <p className="text-sm text-red-500 mt-2">{errors.permissions}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit">
                            Update Role
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}


