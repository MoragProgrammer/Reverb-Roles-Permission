import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import { useEffect, useState } from 'react';
import { RoleBadge } from '@/components/role-badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Forms',
        href: '/forms',
    },
];

interface RoleType {
    id: number;
    name: string;
    badge_color: string;
}

interface UserType {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    school_id: string;
    email: string;
}

interface FormFieldType {
    id: number;
    title: string;
    type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'JPEG' | 'PNG';
}

interface FormType {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    assigned_roles?: RoleType[];
    assigned_users?: UserType[];
    fields?: FormFieldType[];
    created_at: string;
    updated_at: string;
}

type EchoEventCallback<T> = (data: T) => void;

interface EchoChannel {
    listen<T>(event: string, callback: EchoEventCallback<T>): void;
}

interface Echo {
    channel: (channel: string) => EchoChannel;
    leave: (channel: string) => void;
}

declare global {
    interface Window {
        Echo: Echo;
    }
}

export default function Index({ forms: initialForms }: { forms: FormType[] }) {
    const [allForms, setAllForms] = useState<FormType[]>(initialForms);

    const formCan = {
        create: can('forms.create'),
        edit: can('forms.edit'),
        delete: can('forms.delete'),
    };

    useEffect(() => {
        const channel = window.Echo.channel('forms');

        channel.listen<{ form: FormType }>('FormCreated', (data) => {
            setAllForms((prevForms) => [...prevForms, data.form]);
        });

        channel.listen<{ form: FormType }>('FormUpdated', (data) => {
            setAllForms((prevForms) => prevForms.map((form) => (form.id === data.form.id ? data.form : form)));
        });

        channel.listen<{ formId: number }>('FormDeleted', (data) => {
            setAllForms((prevForms) => prevForms.filter((form) => form.id !== data.formId));
        });

        return () => {
            window.Echo.leave('forms');
        };
    }, []);

    function handleDelete(id: number) {
        if (confirm("Are you sure you want to remove this form?")) {
            router.delete(route('forms.destroy', id));
        }
    }

    const getRecipients = (form: FormType) => {
        const recipients = [];
        if (form.assigned_roles && form.assigned_roles.length > 0) {
            recipients.push(...form.assigned_roles.map(role => ({ type: 'role', name: role.name, color: role.badge_color })));
        }
        if (form.assigned_users && form.assigned_users.length > 0) {
            recipients.push(...form.assigned_users.map(user => ({ 
                type: 'user', 
                name: `${user.first_name} ${user.last_name}`, 
                color: '#6b7280' 
            })));
        }
        return recipients;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms" />

            <div className='p-3'>
                {formCan.create && (
                    <Link
                        href={route('forms.create')}
                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Create
                    </Link>
                )}

                <div className="overflow-x-auto mt-3">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Form Title</th>
                                <th scope="col" className="px-6 py-3">Recipients</th>
                                <th scope="col" className="px-6 py-3">Fields</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allForms.map((form) => {
                                const recipients = getRecipients(form);
                                return (
                                    <tr key={form.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                        <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                            {form.title}
                                        </td>
                                        <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-wrap gap-1">
                                                {recipients.length > 0 ? (
                                                    recipients.map((recipient, index) => (
                                                        <RoleBadge
                                                            key={`${recipient.type}-${index}`}
                                                            name={recipient.name}
                                                            color={recipient.color}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">No recipients</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                            <div className="flex flex-wrap gap-1">
                                                {form.fields && form.fields.length > 0 ? (
                                                    form.fields.map((field) => (
                                                        <span
                                                            key={field.id}
                                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                                        >
                                                            {field.title} ({field.type})
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">No fields</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={route('forms.show', form.id)}
                                                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                                                >
                                                    Show
                                                </Link>
                                                {formCan.edit && (
                                                    <Link
                                                        href={route('forms.edit', form.id)}
                                                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                                {formCan.delete && (
                                                    <button
                                                        onClick={() => handleDelete(form.id)}
                                                        className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
