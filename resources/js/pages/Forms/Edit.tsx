import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { RoleBadge } from '@/components/role-badge';

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
    id?: number;
    title: string;
    type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'JPEG' | 'PNG';
}

interface FormType {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    assigned_roles: RoleType[];
    assigned_users: UserType[];
    fields: FormFieldType[];
    created_at: string;
    updated_at: string;
}

interface FormDataType {
    title: string;
    description: string;
    assigned_roles: number[];
    assigned_users: number[];
    fields: FormFieldType[];
    status: 'active' | 'inactive';
    [key: string]: any;
}

export default function Edit({ form, roles, users }: { form: FormType, roles: RoleType[], users: UserType[] }) {
    const [newField, setNewField] = useState<FormFieldType>({ title: '', type: 'Word' });
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Forms',
            href: '/forms',
        },
        {
            title: form.title,
            href: `/forms/${form.id}`,
        },
        {
            title: 'Edit',
            href: `/forms/${form.id}/edit`,
        },
    ];

    const { data, setData, errors, put } = useForm<FormDataType>({
        title: form.title,
        description: form.description,
        assigned_roles: form.assigned_roles.map(role => role.id),
        assigned_users: form.assigned_users.map(user => user.id),
        fields: form.fields,
        status: form.status,
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
        put(route('forms.update', form.id));
    }

    const getCurrentRecipients = () => {
        const recipients = [];
        if (form.assigned_roles.length > 0) {
            recipients.push(...form.assigned_roles.map(role => ({ type: 'role', name: role.name, color: role.badge_color })));
        }
        if (form.assigned_users.length > 0) {
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
            <Head title={`Edit ${form.title}`} />

            <div className='p-3'>
                <Link 
                    href={route('forms.show', form.id)}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back to Form
                </Link>

                <div className="mt-4 max-w-4xl mx-auto">
                    {/* Display Current Form Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Form Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Title</h3>
                                <p className="text-gray-900 dark:text-white">{form.title}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    form.status === 'active' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                    {form.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Description</h3>
                            <p className="text-gray-900 dark:text-white">{form.description}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Recipients</h3>
                            <div className="flex flex-wrap gap-1">
                                {getCurrentRecipients().length > 0 ? (
                                    getCurrentRecipients().map((recipient, index) => (
                                        <RoleBadge
                                            key={`${recipient.type}-${index}`}
                                            name={recipient.name}
                                            color={recipient.color}
                                        />
                                    ))
                                ) : (
                                    <span className="text-gray-400 italic">No recipients assigned</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Editable Form */}
                    <form onSubmit={submit} className="space-y-6">
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Recipients</h3>
                            
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Field (Optional)</h3>
                            
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
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Form Fields (List View)</h3>
                            {data.fields.length > 0 ? (
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
                            ) : (
                                <p className="text-gray-400 italic">No fields added</p>
                            )}
                            {errors.fields && <p className="text-red-500 text-sm mt-1">{errors.fields}</p>}
                        </div>

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
                                Update Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
