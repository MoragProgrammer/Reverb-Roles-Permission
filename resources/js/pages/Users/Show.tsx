import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users Show',
        href: '/users',
    },
];

export default function Edit({ user }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Show" />


                <div className='p-3'>
<Link href={route('users.index')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Back
                            </Link>

<div>
    <p> <strong>Name: </strong> {user.name}</p>
    <p> <strong>Email: </strong> {user.email}</p>
</div>


                </div>

        </AppLayout>
    );
}


