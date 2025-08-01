import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { RoleBadge } from '@/components/role-badge';
import { useEffect, useState } from 'react';
import { can } from '@/lib/can';
import * as React from 'react';
import { usePage } from '@inertiajs/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
    has_completed_submission?: boolean;
    submission_status?: string | null;
}

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    status: 'not_yet_responded' | 'user_responded' | 'rejection_process' | 'rejected_responded' | 'completed';
    submitted_at: string;
    user: UserType;
    form_id: number;
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

interface FormFieldType {
    id?: number;
    title: string;
    type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'JPEG' | 'PNG';
}

interface FormType {
    submissions?: SubmissionType[];
    id: number;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    assigned_roles: RoleType[];
    assigned_users: UserType[];
    fields: FormFieldType[];
    created_at: string;
    updated_at: string;
    account_name: string;
    school_id: string;
}

export default function Show({ form }: { form: FormType }) {
    const [submissions, setSubmissions] = useState<SubmissionType[]>(form.submissions || []);
const { props } = usePage<{ users: UserType[] }>();
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Forms',
            href: '/forms',
        },
        {
            title: form.title,
            href: `/forms/${form.id}`,
        },
    ];

    // Real-time listeners
    useEffect(() => {
        const channel = window.Echo.channel('submissions');

        channel.listen<{ submission: SubmissionType }>('SubmissionCreated', (data) => {
            if (data.submission.form_id === form.id) {
                setSubmissions((prevSubmissions) => {
                    const exists = prevSubmissions.find(s => s.id === data.submission.id);
                    if (!exists) {
                        return [...prevSubmissions, data.submission];
                    }
                    return prevSubmissions;
                });
            }
        });

        channel.listen<{ submission: SubmissionType }>('SubmissionUpdated', (data) => {
            if (data.submission.form_id === form.id) {
                setSubmissions((prevSubmissions) => 
                    prevSubmissions.map((submission) => 
                        submission.id === data.submission.id ? data.submission : submission
                    )
                );
            }
        });

        channel.listen<{ submissionId: number }>('SubmissionDeleted', (data) => {
            setSubmissions((prevSubmissions) => 
                prevSubmissions.filter((submission) => submission.id !== data.submissionId)
            );
        });

        return () => {
            window.Echo.leave('submissions');
        };
    }, [form.id]);

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


    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'not_yet_responded': {
                class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
                text: 'Not Yet Responded'
            },
            'user_responded': {
                class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                text: 'User Responded'
            },
            'rejection_process': {
                class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                text: 'Rejection Process'
            },
            'rejected_responded': {
                class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                text: 'Rejected (Responded)'
            },
            'completed': {
                class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                text: 'Completed'
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['not_yet_responded'];
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.class}`}>
                {config.text}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={form.title} />

            <div className='p-3'>
                <Link 
                    href={route('forms.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back to Forms
                </Link>

                <div className="mt-4 max-w-4xl mx-auto">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Form Details</h2>
                        
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
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</h3>
                            <p className="text-gray-900 dark:text-white">{form.account_name}</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School ID</h3>
                            <p className="text-gray-900 dark:text-white">{form.school_id}</p>
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

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Fields</h3>
                            {form.fields.length > 0 ? (
                                <ul className="space-y-2">
                                    {form.fields.map((field, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{field.title}</span>
                                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                    {field.type}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 italic">No fields added</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Real-time Forms Section */}
                    <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Real-time Forms</h2>
{form.status === 'active' && can('forms.upload_user') && (
                                <DrawerDialogDemo form={form} users={props.users} />
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                                            Account Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                                            School ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                                            Submitted Time
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-200">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {submissions && submissions.length > 0 ? (
                                        submissions.map((submission) => (
                                            <tr key={submission.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {submission.user.first_name} {submission.user.middle_name ? submission.user.middle_name + ' ' : ''}{submission.user.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {submission.user.school_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(submission.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(submission.submitted_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                	{submission.status === 'completed' ? (
                                                        <div className="flex space-x-2">
                                                            {can('forms.completion_viewer') && (
                                                                <Link 
                                                                    href={route('submissions.completed', submission.id)} 
                                                                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
                                                                >
                                                                    View
                                                                </Link>
                                                            )}
                                                            {can('forms.completion_editor') && (
                                                                <Link 
                                                                    href={route('submissions.completed.edit', submission.id)} 
                                                                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                            {can('forms.completion_delete') && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <button className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800">
                                                                            Delete
                                                                        </button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete the submission and remove all associated files from the server.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction 
                                                                                onClick={() => {
                                                                                    router.delete(route('submissions.completed.destroy', submission.id));
                                                                                }}
                                                                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                                                            >
                                                                                Delete Submission
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                            {!can('forms.completion_viewer') && !can('forms.completion_editor') && (
                                                                <span className="text-gray-400 italic">Completed (No access)</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Processing its submission</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                                                No submissions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// DrawerDialogDemo component for responsive upload form
function DrawerDialogDemo({ form, users }: { form: FormType; users: UserType[] }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Upload User Form</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload User Form</DialogTitle>
            <DialogDescription>
              Upload files for users to auto-complete their form submissions.
            </DialogDescription>
          </DialogHeader>
          <FormUploaderContent form={form} users={users} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Upload User Form</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Upload User Form</DrawerTitle>
          <DrawerDescription>
            Upload files for users to auto-complete their form submissions.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <FormUploaderContent form={form} users={users} onSuccess={() => setOpen(false)} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// Simplified FormUploader content component
function FormUploaderContent({ form, users, onSuccess }: { form: FormType; users: UserType[]; onSuccess: () => void }) {
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [files, setFiles] = useState<{ [key: number]: File | null }>({});
    const [dragOver, setDragOver] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    const handleUserSelect = (userId: number) => {
        const user = users.find(u => u.id === userId);
        setSelectedUser(user || null);
    };

    const handleFileChange = (fieldId: number, file: File | null) => {
        const newFiles = { ...files, [fieldId]: file };
        setFiles(newFiles);
    };

    const handleDragOver = (e: React.DragEvent, fieldId: number) => {
        e.preventDefault();
        setDragOver(fieldId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(null);
    };

    const handleDrop = (e: React.DragEvent, fieldId: number) => {
        e.preventDefault();
        setDragOver(null);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleFileChange(fieldId, droppedFiles[0]);
        }
    };

    const validateFileType = (file: File, expectedType: string): boolean => {
        const typeMap: { [key: string]: string[] } = {
            'Word': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'Excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'PowerPoint': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'PDF': ['application/pdf'],
            'JPEG': ['image/jpeg'],
            'PNG': ['image/png']
        };
        
        const allowedTypes = typeMap[expectedType] || [];
        return allowedTypes.includes(file.type);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUser) {
            alert('Please select a user.');
            return;
        }

        // Validate files
        for (const field of form.fields) {
            const file = files[field.id!];
            if (!file) {
                alert(`Please select a file for ${field.title}.`);
                return;
            }
            
            if (!validateFileType(file, field.type)) {
                alert(`Invalid file type for ${field.title}. Expected: ${field.type}`);
                return;
            }
        }

        setProcessing(true);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('user_id', selectedUser.id.toString());
        formData.append('notes', notes);
        
        // Add files
        Object.entries(files).forEach(([fieldId, file]) => {
            if (file) {
                formData.append(`files[${fieldId}]`, file);
            }
        });

        // Submit via router with FormData
        router.post(route('forms.upload-user', form.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setSelectedUser(null);
                setFiles({});
                setNotes('');
                setProcessing(false);
                onSuccess();
                alert('Form uploaded successfully!');
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                setProcessing(false);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User Account
                </label>
                <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => handleUserSelect(parseInt(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    required
                >
                    <option value="">-- Select a User --</option>
                    {users
                        .filter(user => !user.has_completed_submission) // Filter out users with completed submissions
                        .map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.middle_name} {user.last_name} ({user.school_id})
                                {user.submission_status && user.submission_status !== 'completed' && ` - ${user.submission_status.replace('_', ' ').toUpperCase()}`}
                            </option>
                        ))
                    }
                </select>
                {users.filter(user => user.has_completed_submission).length > 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Note:</strong> {users.filter(user => user.has_completed_submission).length} user(s) with completed submissions are hidden from the list:
                                </p>
                                <ul className="mt-1 text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                                    {users
                                        .filter(user => user.has_completed_submission)
                                        .slice(0, 5) // Show only first 5 to avoid clutter
                                        .map((user) => (
                                            <li key={user.id}>
                                                {user.first_name} {user.last_name} ({user.school_id})
                                            </li>
                                        ))
                                    }
                                    {users.filter(user => user.has_completed_submission).length > 5 && (
                                        <li>...and {users.filter(user => user.has_completed_submission).length - 5} more</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Selected User Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Name:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                                {selectedUser.first_name} {selectedUser.middle_name} {selectedUser.last_name}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">School ID:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedUser.school_id}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedUser.email}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Responses */}
            <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Form Field Response Files
                </h4>
                <div className="space-y-4">
                    {form.fields.map((field) => (
                        <div key={field.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                        {field.title}
                                    </h5>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                        {field.type}
                                    </span>
                                </div>
                            </div>
                            
                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    dragOver === field.id!
                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                                onDragOver={(e) => handleDragOver(e, field.id!)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, field.id!)}
                            >
                                {files[field.id!] ? (
                                    <div className="space-y-2">
                                        <div className="text-green-600 dark:text-green-400">
                                            ✓ {files[field.id!]!.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Size: {(files[field.id!]!.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleFileChange(field.id!, null)}
                                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="cursor-pointer">
                                                <span className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                                    Click to upload
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        handleFileChange(field.id!, file);
                                                    }}
                                                    accept={field.type === 'Word' ? '.doc,.docx' :
                                                            field.type === 'Excel' ? '.xls,.xlsx' :
                                                            field.type === 'PowerPoint' ? '.ppt,.pptx' :
                                                            field.type === 'PDF' ? '.pdf' :
                                                            field.type === 'JPEG' ? '.jpg,.jpeg' :
                                                            field.type === 'PNG' ? '.png' : ''}
                                                />
                                            </label>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Expected file type: {field.type}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder="Add any notes about this submission..."
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="submit"
                    disabled={processing || !selectedUser || form.fields.some(field => !files[field.id!])}
                    className="px-6 py-2 text-sm font-medium"
                >
                    {processing ? 'Uploading...' : 'Upload Form (Auto-Complete)'}
                </Button>
            </div>
        </form>
    );
}
