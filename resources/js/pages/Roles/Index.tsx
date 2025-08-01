import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import { useEffect, useState } from 'react';
import { RoleBadge } from '@/components/role-badge';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

interface PermissionType {
    id: number;
    name: string;
}

interface RoleType {
    id: number;
    name: string;
    badge_color: string;
    permissions: PermissionType[];
}

export default function Index({ roles: initialRoles }: { roles: RoleType[] }) {
    const [allRoles, setAllRoles] = useState<RoleType[]>(initialRoles);

    const roleCan = {
        create: can('roles.create'),
        edit: can('roles.edit'),
        delete: can('roles.delete'),
    };

    useEffect(() => {
        const channel = window.Echo.channel('roles');

        channel.listen('RoleCreated', (data: { role: RoleType }) => {
            setAllRoles((prevRoles) => [...prevRoles, data.role]);
        });

        channel.listen('RoleUpdated', (data: { role: RoleType }) => {
            setAllRoles((prevRoles) => prevRoles.map((role) => (role.id === data.role.id ? data.role : role)));
        });

        channel.listen('RoleDeleted', (data: { roleId: number }) => {
            setAllRoles((prevRoles) => prevRoles.filter((role) => role.id !== data.roleId));
        });

        return () => {
            window.Echo.leave('roles');
        };
    }, []);

    function handleDelete(id: number) {
        if (confirm("Are you sure you want to remove this role?")) {
            router.delete(route('roles.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="p-3">
                {roleCan.create && (
                    <Link
                        href={route('roles.create')}
                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Create
                    </Link>
                )}

                <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Badge Color</th>
                                <th scope="col" className="px-6 py-3">Role Permissions</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allRoles.map((role) => (
                                <tr key={role.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                    <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                        {role.id}
                                    </td>
                                    <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                        <RoleBadge name={role.name} color={role.badge_color} />
                                    </td>
                                    <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-6 rounded border"
                                                style={{ backgroundColor: role.badge_color }}
                                            />
                                            <span>{role.badge_color}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                        {role.permissions.length ? (
                                            <div className="space-y-1">
                                                {Object.entries(
                                                    role.permissions.reduce((groups: { [key: string]: PermissionType[] }, permission) => {
                                                        const module = permission.name.split('.')[0];
                                                        const groupName = module.charAt(0).toUpperCase() + module.slice(1);
                                                        if (!groups[groupName]) groups[groupName] = [];
                                                        groups[groupName].push(permission);
                                                        return groups;
                                                    }, {})
                                                ).map(([groupName, groupPermissions]) => (
                                                    <div key={groupName} className="flex flex-wrap items-center gap-1">
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">
                                                            {groupName}:
                                                        </span>
                                                        {groupPermissions.map((permission) => (
                                                            <Badge
                                                                key={permission.id}
                                                                variant="outline"
                                                                className="capitalize text-xs"
                                                                title={`${groupName} Permission: ${permission.name}`}
                                                            >
                                                                {permission.name.split('.')[1]}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm italic">No permissions assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href={route('roles.show', role.id)}
                                                className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                                            >
                                                Show
                                            </Link>
                                            {roleCan.edit && (
                                                <Link
                                                    href={route('roles.edit', role.id)}
                                                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {roleCan.delete && (
                                                <button
                                                    onClick={() => handleDelete(role.id)}
                                                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}


