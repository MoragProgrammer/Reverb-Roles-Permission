import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { can } from '@/lib/can';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
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

declare global {
    interface Window {
        Echo: any;
    }
}

export default function Index({ users: initialUsers }: { users: UserType[] }) {
    const getInitials = useInitials();
    const [allUsers, setAllUsers] = useState<UserType[]>(initialUsers);

    const userCan = {
        create: can('users.create'),
        edit: can('users.edit'),
        delete: can('users.delete'),
    };

    useEffect(() => {
        const channel = window.Echo.channel('users');

        channel.listen('UserCreated', (data: { user: UserType }) => {
            setAllUsers((prevUsers) => [...prevUsers, data.user]);
        });

        channel.listen('UserUpdated', (data: { user: UserType }) => {
            setAllUsers((prevUsers) => prevUsers.map((user) => (user.id === data.user.id ? data.user : user)));
        });

        channel.listen('UserDeleted', (data: { userId: number }) => {
            setAllUsers((prevUsers) => prevUsers.filter((user) => user.id !== data.userId));
        });

        return () => {
            window.Echo.leave('users');
        };
    }, []);

    function handleDelete(id: number){
        if(confirm("Are you sure you want to remove this?")){
            router.delete(route('users.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />


                <div className='p-3'>
 {userCan.create && <Link href={route('users.create')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Create
                            </Link>}

                <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Profile Picture</th>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">School ID</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Gender</th>
                            <th scope="col" className="px-6 py-3">Roles</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map((user) =>
                            <tr key={user.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                <td className="px-6 py-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.profile_picture ? `/storage/${user.profile_picture}` : undefined} alt={`${user.first_name} ${user.last_name}`} />
                                        <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                                    </Avatar>
                                </td>
                                <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">{`${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`}</td>
                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{user.school_id}</td>
                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{user.email}</td>
                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{user.status}</td>
                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{user.gender}</td>
                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                    {user.roles.map((role) =>
                                        <span
                                            key={role.id}
                                            className="mr-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                                        >
                                            {role.name}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-2">
                                    <Link
                                        href={route('users.show', user.id)}
                                        className="mr-1 cursor-pointer px-3 py-2 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                                        Show
                                    </Link>
                                    {userCan.edit && <Link
                                        href={route('users.edit', user.id)}
                                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        Edit
                                    </Link>}
                                    {userCan.delete && <button
                                        onClick={() => handleDelete(user.id)}
                                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 ml-1">
                                        Delete
                                    </button>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
                </div>

        </AppLayout>
    );
}


