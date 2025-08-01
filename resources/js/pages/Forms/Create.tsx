import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Forms',
        href: '/forms',
    },
    {
        title: 'Create',
        href: '/forms/create',
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
    title: string;
    type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'JPEG' | 'PNG';
}

interface FormDataType {
    title: string;
    description: string;
    assigned_roles: number[];
    assigned_users: number[];
    fields: FormFieldType[];
    status: 'active' | 'inactive';
    [key: string]: string | number[] | FormFieldType[] | 'active' | 'inactive';
}

export default function Create({ roles, users }: { roles: RoleType[], users: UserType[] }) {
    const [newField, setNewField] = useState<FormFieldType>({ title: '', type: 'Word' });
    
    const { data, setData, errors, post } = useForm<FormDataType>({
        title: '',
        description: '',
        assigned_roles: [],
        assigned_users: [],
        fields: [],
        status: 'active',
    });

    function handleRoleChange(roleId: number, checked: boolean) {
        if (checked) {
            setData('assigned_roles', [...data.assigned_roles, roleId]);
        } else {
            setData('assigned_roles', data.assigned_roles.filter(id => id !== roleId));
        }
    }

    function handleUserChange(userId: number, checked: boolean) {
        if (checked) {
            setData('assigned_users', [...data.assigned_users, userId]);
        } else {
            setData('assigned_users', data.assigned_users.filter(id => id !== userId));
        }
    }

    function addField() {
        if (newField.title.trim()) {
            setData('fields', [...data.fields, { ...newField }]);
            setNewField({ title: '', type: 'Word' });
        }
    }

    function removeField(index: number) {
        setData('fields', data.fields.filter((_, i) => i !== index));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('forms.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Form" />

            <div className='p-3'>
                <Link 
                    href={route('forms.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back
                </Link>

                <form onSubmit={submit} className="space-y-6 mt-4 max-w-4xl mx-auto">
                    {/* Form Title */}
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Form Title:
                        </label>
                        <input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            name="title"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter form title"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Form Description */}
                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Form Description:
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            name="description"
                            rows={4}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter form description"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Assign Recipients Section */}
                    <div className="grid gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assign Recipients</h3>
                        
                        {/* Roles */}
                        <div className="grid gap-2">
                            <label className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                Entire Roles:
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={data.assigned_roles.includes(role.id)}
                                            onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.assigned_roles && <p className="text-red-500 text-sm mt-1">{errors.assigned_roles}</p>}
                        </div>

                        {/* Individual Users */}
                        <div className="grid gap-2">
                            <label className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                Individual Users:
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {users.map((user) => (
                                        <label key={user.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={data.assigned_users.includes(user.id)}
                                                onChange={(e) => handleUserChange(user.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {`${user.first_name} ${user.last_name}`} ({user.school_id})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {errors.assigned_users && <p className="text-red-500 text-sm mt-1">{errors.assigned_users}</p>}
                        </div>
                    </div>

                    {/* Add New Field Section */}
                    <div className="grid gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Field</h3>
                        
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label htmlFor="field_title" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                    Field Title:
                                </label>
                                <input
                                    id="field_title"
                                    value={newField.title}
                                    onChange={(e) => setNewField({ ...newField, title: e.target.value })}
                                    name="field_title"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter field title"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <label htmlFor="field_type" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                    Field Type:
                                </label>
                                <select
                                    id="field_type"
                                    value={newField.type}
                                    onChange={(e) => setNewField({ ...newField, type: e.target.value as FormFieldType['type'] })}
                                    name="field_type"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Word">Word</option>
                                    <option value="Excel">Excel</option>
                                    <option value="PowerPoint">PowerPoint</option>
                                    <option value="PDF">PDF</option>
                                    <option value="JPEG">JPEG</option>
                                    <option value="PNG">PNG</option>
                                </select>
                            </div>
                            
                            <button
                                type="button"
                                onClick={addField}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                                Add Field
                            </button>
                        </div>
                    </div>

                    {/* Form Fields Display */}
                    {data.fields.length > 0 && (
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Form Fields</h3>
                            <div className="space-y-2">
                                {data.fields.map((field, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">{field.title}</span>
                                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                {field.type}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeField(index)}
                                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {errors.fields && <p className="text-red-500 text-sm mt-1">{errors.fields}</p>}
                        </div>
                    )}

                    {/* Status */}
                    <div className="grid gap-2">
                        <label htmlFor="status" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                            Status:
                        </label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                            name="status"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Create Form
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
