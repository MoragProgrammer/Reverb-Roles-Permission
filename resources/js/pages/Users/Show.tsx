import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users Show',
        href: '/users',
    },
];

interface RoleType {
    id: number;
    name: string;
}

interface UserType {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    school_id: string;
    email: string;
    gender: string;
    profile_picture: string | null;
    status: string;
    roles: RoleType[];
}

export default function Show({ user }: { user: UserType }) {
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Show" />


                <div className='p-3'>
<Link href={route('users.index')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Back
                            </Link>

                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-4 max-w-2xl mx-auto">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-24 w-24 text-3xl">
                                <AvatarImage src={user.profile_picture ? `/storage/${user.profile_picture}` : undefined} alt={`${user.first_name} ${user.last_name}`} />
                                <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{`${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`}</h2>
                                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">School ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.school_id}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.gender}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{user.status}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {user.roles.map(role => role.name).join(', ')}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>


                </div>

        </AppLayout>
    );
}


