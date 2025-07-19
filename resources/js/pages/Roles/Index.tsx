import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

export default function Index({ roles }) {

    function handleDelete(id){
        if(confirm("Are you sure you want to remove this?")){
            router.delete(route('roles.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />


                <div className='p-3'>
{can('roles.create') && <Link href={route('roles.create')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Create
                            </Link>}

                <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
<tr>
            <th scope="col" className="px-6 py-3">ID</th>
                 <th scope="col" className="px-6 py-3">Name</th>
                 <th scope="col" className="px-6 py-3">Permissions</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
</tr>
        </thead>

        <tbody>
            {roles.map(({id, name, permissions}) =>
          <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                       <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">{id}</td>
                       <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{name}</td>
                       <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                        {permissions.map((permission) =>
                        <span
                            key="1"
                            className="mr-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
                        >
                            {permission.name}
                        </span>
                        )}
                       </td>
                       <td className="px-6 py-2">

                              <Link
                            href={route('roles.show', id)}
                            className="mr-1 cursor-pointer px-3 py-2 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                                Show
                            </Link>
                          {can('roles.edit') &&   <Link
                            href={route('roles.edit', id)}
                            className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Edit
                            </Link> }
                          {can('roles.delete') &&   <button
                            onClick={() => handleDelete(id)}
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


