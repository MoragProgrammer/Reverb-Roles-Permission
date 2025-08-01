import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { can } from '@/lib/can';
import React, { useEffect, useState } from 'react';
import SubmissionsNotification from '@/pages/Notification/Submissions_notification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Submissions',
        href: '/submissions',
    },
];

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    form_title: string;
    status: 'not_yet_responded' | 'user_responded' | 'rejection_process' | 'rejected_responded' | 'completed';
    submitted_time: string;
    form_id: number;
}

interface RoleType {
    id: number;
    name: string;
    badge_color: string;
}

interface UserType {
    id: number;
    name: string;
    school_id: string;
}

interface SubmissionGroupType {
    form_id: number;
    form_title: string;
    form_description: string;
    assigned_roles: RoleType[];
    assigned_users: UserType[];
    submissions: SubmissionType[];
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

export default function Index({ submissionGroups: initialSubmissionGroups }: { submissionGroups: SubmissionGroupType[] }) {
    const [submissionGroups, setSubmissionGroups] = useState<SubmissionGroupType[]>(initialSubmissionGroups);

    const submissionCan = {
        review: can('submissions.review'),
        reReview: can('submissions.re-review'),
        delete: can('submissions.delete'),
    };

    useEffect(() => {
        const channel = window.Echo.channel('submissions');

        channel.listen<{ submission: SubmissionType }>('SubmissionCreated', (data) => {
            setSubmissionGroups((prevGroups) => {
                const updatedGroups = [...prevGroups];
                const groupIndex = updatedGroups.findIndex(group => group.form_id === data.submission.form_id);

                if (groupIndex !== -1) {
                    updatedGroups[groupIndex].submissions.push(data.submission);
                } else {
                    updatedGroups.push({
                        form_id: data.submission.form_id,
                        form_title: data.submission.form_title,
                        form_description: '',
                        assigned_roles: [],
                        assigned_users: [],
                        submissions: [data.submission]
                    });
                }

                return updatedGroups;
            });
        });

        channel.listen<{ submission: SubmissionType }>('SubmissionUpdated', (data) => {
            setSubmissionGroups((prevGroups) => 
                prevGroups.map(group => {
                    if (group.form_id === data.submission.form_id) {
                        return {
                            ...group,
                            submissions: group.submissions.map((submission) => 
                                submission.id === data.submission.id ? data.submission : submission
                            )
                        };
                    }
                    return group;
                })
            );
        });

        channel.listen<{ submissionId: number }>('SubmissionDeleted', (data) => {
            setSubmissionGroups((prevGroups) => 
                prevGroups.map(group => (
                    {
                        ...group,
                        submissions: group.submissions.filter((submission) => submission.id !== data.submissionId)
                    }
                ))
            );
        });

        return () => {
            window.Echo.leave('submissions');
        };
    }, []);

    function handleDelete(id: number) {
        if (confirm("Are you sure you want to remove this submission?")) {
            router.delete(route('submissions.destroy', id));
        }
    }

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

    const getActionButtons = (submission: SubmissionType): React.ReactNode[] => {
        const buttons: React.ReactNode[] = [];
        
        // Show button - always available
        buttons.push(
            <Link
                key="show"
                href={route('submissions.show', submission.id)}
                className="mr-1 cursor-pointer px-3 py-2 text-xs font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
                Show
            </Link>
        );

        // Review button - for user_responded status
        if (submission.status === 'user_responded' && submissionCan.review) {
            buttons.push(
                <Link
                    key="review"
                    href={route('submissions.review', submission.id)}
                    className="mr-1 cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Review
                </Link>
            );
        }

        // Re-review button - for rejected_responded status
        if (submission.status === 'rejected_responded' && submissionCan.reReview) {
            buttons.push(
                <Link
                    key="re-review"
                    href={route('submissions.re-review', submission.id)}
                    className="mr-1 cursor-pointer px-3 py-2 text-xs font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                >
                    Re-review
                </Link>
            );
        }

        // Delete button
        if (submissionCan.delete) {
            buttons.push(
                <button
                    key="delete"
                    onClick={() => handleDelete(submission.id)}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 ml-1"
                >
                    Delete
                </button>
            );
        }

        return buttons;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submissions" />
            
            {/* Real-time toast notifications for submissions */}
            <SubmissionsNotification />

            <div className='p-3'>
                <div>
                    {submissionGroups.map((group) => (
                        <div key={group.form_id} className="mb-4">
                            <h2 className="text-lg font-semibold">{group.form_title}</h2>
                            <p className="text-sm text-gray-600">{group.form_description}</p>
                            <div className="overflow-x-auto mt-3">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Account Name</th>
                                            <th scope="col" className="px-6 py-3">School ID</th>
                                            <th scope="col" className="px-6 py-3">Form Title</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3">Submitted Time</th>
                                            <th scope="col" className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.submissions.map((submission) => (
                                            <tr key={submission.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                                <td className="px-6 py-2 font-medium text-gray-900 dark:text-white">
                                                    {submission.account_name}
                                                </td>
                                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                                    {submission.school_id}
                                                </td>
                                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                                    {submission.form_title}
                                                </td>
                                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                                    {getStatusBadge(submission.status)}
                                                </td>
                                                <td className="px-6 py-2 text-gray-600 dark:text-gray-300">
                                                    {new Date(submission.submitted_time).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {getActionButtons(submission)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
