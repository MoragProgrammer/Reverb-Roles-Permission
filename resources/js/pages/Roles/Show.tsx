import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Show',
        href: '/roles',
    },
];

export default function Edit( { role, permissions } ) {



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Edit" />


                <div className='p-3'>
<Link href={route('roles.index')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Back
                            </Link>

                            <div>
                                <p><strong>Name:</strong> {role.name}</p>
                                <p><strong>Permissions:</strong></p>
                                   {permissions.map((permission) =>
                        <span
                            key="1"
                            className="mr-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                        >
                            {permission}
                        </span>
                        )}
                            </div>

                </div>

        </AppLayout>
    );
}


