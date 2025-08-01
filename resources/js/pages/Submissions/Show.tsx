import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface SubmissionResponseType {
    id: number;
    field_id: number;
    field_title: string;
    field_type: string;
    file_path: string;
    original_filename: string;
    submitted_at: string;
    status?: 'approved' | 'rejected';
    rejection_reason?: string;
}

interface ReviewHistoryType {
    id: number;
    reviewer_name: string;
    action: 'approved' | 'rejected' | 're-approved' | 're-rejected';
    notes?: string;
    reviewed_at: string;
}

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    form_id: number;
    form_title: string;
    form_description: string;
    status: 'not_yet_responded' | 'user_responded' | 'rejection_process' | 'rejected_responded' | 'completed';
    submitted_time: string;
    responses: SubmissionResponseType[];
    review_history: ReviewHistoryType[];
    created_at: string;
    updated_at: string;
}

export default function Show({ submission }: { submission: SubmissionType }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Submissions',
            href: '/submissions',
        },
        {
            title: `${submission.account_name} - ${submission.form_title}`,
            href: `/submissions/${submission.id}`,
        },
    ];

    const handleDownload = (filePath: string, filename: string) => {
        if (!filePath || filePath === 'null' || !filename) {
            alert('File path is invalid. Cannot download this file.');
            return;
        }
        const link = document.createElement('a');
        link.href = `/storage/${filePath}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const getActionLabel = (action: string) => {
        const actionLabels = {
            'approved': 'Approved',
            'rejected': 'Rejected',
            're-approved': 'Re-approved',
            're-rejected': 'Re-rejected'
        };
        return actionLabels[action as keyof typeof actionLabels] || action;
    };

    const getActionBadgeClass = (action: string) => {
        const actionClasses = {
            'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            're-approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            're-rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
        return actionClasses[action as keyof typeof actionClasses] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Submission - ${submission.form_title}`} />

            <div className='p-3'>
                <Link 
                    href={route('submissions.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back to Submissions
                </Link>

                <div className="mt-4 max-w-6xl mx-auto">
                    {/* Submission Overview */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Submission Details
                            </h2>
                            {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Account Name:</span>
                                <p className="text-gray-900 dark:text-white">{submission.account_name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">School ID:</span>
                                <p className="text-gray-900 dark:text-white">{submission.school_id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Form Title:</span>
                                <p className="text-gray-900 dark:text-white">{submission.form_title}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted Time:</span>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(submission.submitted_time).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Description */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Form Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {submission.form_description}
                        </p>
                    </div>

                    {/* Form Responses */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Form Responses
                        </h3>
                        
                        {submission.responses.length > 0 ? (
                            <div className="space-y-4">
                                {submission.responses.map((response) => (
                                    <div key={response.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {response.field_title}
                                                </h4>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                    {response.field_type}
                                                </span>
                                                {response.status && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        response.status === 'approved' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    }`}>
                                                        {response.status === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDownload(response.file_path, response.original_filename)}
                                                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                            >
                                                Download
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">File:</span>
                                                <p className="text-gray-900 dark:text-white">{response.original_filename}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {new Date(response.submitted_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {response.rejection_reason && (
                                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                                <h5 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                                    Rejection Reason:
                                                </h5>
                                                <p className="text-sm text-red-700 dark:text-red-400">
                                                    {response.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No responses submitted</p>
                        )}
                    </div>

                    {/* Review History */}
                    {submission.review_history.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Review History
                            </h3>
                            
                            <div className="space-y-4">
                                {submission.review_history.map((review) => (
                                    <div key={review.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {review.reviewer_name}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getActionBadgeClass(review.action)}`}>
                                                    {getActionLabel(review.action)}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(review.reviewed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        
                                        {review.notes && (
                                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-medium">Notes:</span> {review.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
