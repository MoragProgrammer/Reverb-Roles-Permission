import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface SubmissionDetails {
    id: number;
    form_id: number;
    form_title: string;
    account_name: string;
    school_id: string;
    status: string;
    submitted_time: string;
    responses: Array<{
        id: number;
        field_title: string;
        original_filename: string;
        status: string;
        rejection_reason?: string;
    }>;
    review_history: Array<{
        id: number;
        reviewer_name: string;
        action: string;
        notes: string;
        reviewed_at: string;
    }>;
}

export default function CompletedForm() {
    const { props } = usePage<{ submission: SubmissionDetails }>();
    const { submission } = props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Forms',
            href: '/forms',
        },
        {
            title: submission.form_title,
            href: `/forms/${submission.form_id}`,
        },
        {
            title: 'Completed Submission',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Completed Submission: ${submission.form_title}`} />

            <div className='p-3'>
                <Link 
                    href={route('forms.show', submission.form_id)}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back to Form
                </Link>

                <div className="mt-4 max-w-4xl mx-auto">

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submission Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Title</h3>
                                <p className="text-gray-900 dark:text-white">{submission.form_title}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</h3>
                                <p className="text-gray-900 dark:text-white">{submission.account_name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School ID</h3>
                                <p className="text-gray-900 dark:text-white">{submission.school_id}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submitted Time</h3>
                                <p className="text-gray-900 dark:text-white">{new Date(submission.submitted_time).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Form Responses</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {submission.responses.map((response) => (
                                <div key={response.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{response.field_title}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            response.status === 'approved' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <strong>File:</strong> {response.original_filename}
                                    </p>
                                    {response.rejection_reason && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                                            <strong>Rejection Reason:</strong> {response.rejection_reason}
                                        </p>
                                    )}
                                    {/* Individual file download button */}
                                    <div className="mt-3">
                                        <a
                                            href={route('submissions.download.file', [submission.id, response.id])}
                                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            download
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                            Download File
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review History</h2>
                        
                        <div className="space-y-4">
                            {submission.review_history.map((review) => (
                                <div key={review.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer_name}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            review.action.includes('approved') 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                : review.action === 'edited'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {review.action.charAt(0).toUpperCase() + review.action.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <strong>Notes:</strong> {review.notes || 'No notes provided'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <strong>{review.action === 'edited' ? 'Edited at:' : 'Reviewed at:'}</strong> {new Date(review.reviewed_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
