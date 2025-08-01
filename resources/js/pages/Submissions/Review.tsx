import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface SubmissionResponseType {
    id: number;
    field_id: number;
    field_title: string;
    field_type: string;
    file_path: string;
    original_filename: string;
    submitted_at: string;
}

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    form_title: string;
    form_description: string;
    status: string;
    submitted_time: string;
    responses: SubmissionResponseType[];
}

interface ReviewDecisionType {
    decision: 'approve' | 'reject' | '';
    rejection_reasons: { [key: number]: string }; // field_id -> reason
    notes: string;
    [key: string]: string | number | boolean | { [key: number]: string } | undefined;
}

export default function Review({ submission }: { submission: SubmissionType }) {
    const [rejectionReasons, setRejectionReasons] = useState<{ [key: number]: string }>({});
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Submissions',
            href: '/submissions',
        },
        {
            title: 'Review',
            href: `/submissions/${submission.id}/review`,
        },
    ];

    const { data, setData, errors, post, processing } = useForm<ReviewDecisionType>({
        decision: '',
        rejection_reasons: {},
        notes: '',
    });

    const handleDecisionChange = (decision: 'approve' | 'reject') => {
        setData('decision', decision);
        if (decision === 'approve') {
            setRejectionReasons({});
            setData('rejection_reasons', {});
        }
    };

    const handleRejectionReasonChange = (fieldId: number, reason: string) => {
        const updatedReasons = { ...rejectionReasons, [fieldId]: reason };
        setRejectionReasons(updatedReasons);
        setData('rejection_reasons', updatedReasons);
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('submissions.review.store', submission.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review Submission - ${submission.form_title}`} />

            <div className='p-3'>
                <Link 
                    href={route('submissions.index')}
                    className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    Back to Submissions
                </Link>

                <div className="mt-4 max-w-6xl mx-auto">
                    {/* Form Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {submission.form_title}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {submission.form_description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted by:</span>
                                <p className="text-gray-900 dark:text-white">{submission.account_name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">School ID:</span>
                                <p className="text-gray-900 dark:text-white">{submission.school_id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
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

                    {/* Submission Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Submission Details
                        </h3>
                        
                        {submission.responses.length > 0 ? (
                            <div className="space-y-4">
                                {submission.responses.map((response) => (
                                    <div key={response.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {response.field_title}
                                                </h4>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                                    {response.field_type}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(response.file_path, response.original_filename)}
                                                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                            >
                                                Download
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            File: {response.original_filename}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Uploaded: {new Date(response.submitted_at).toLocaleDateString()}
                                        </p>
                                        
                                        {/* Rejection Reason Input (shown only when reject is selected) */}
                                        {data.decision === 'reject' && (
                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Rejection Reason:
                                                </label>
                                                <textarea
                                                    value={rejectionReasons[response.field_id] || ''}
                                                    onChange={(e) => handleRejectionReasonChange(response.field_id, e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    placeholder="Enter reason for rejecting this field..."
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No files submitted</p>
                        )}
                    </div>

                    {/* Review Decision Form */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Review Decision
                        </h3>
                        
                        {/* Decision Radio Buttons */}
                        <div className="grid gap-4 mb-6">
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="decision"
                                        value="approve"
                                        checked={data.decision === 'approve'}
                                        onChange={() => handleDecisionChange('approve')}
                                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm font-medium text-green-700 dark:text-green-300">
                                        Approve Submission
                                    </span>
                                </label>
                                
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="decision"
                                        value="reject"
                                        checked={data.decision === 'reject'}
                                        onChange={() => handleDecisionChange('reject')}
                                        className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm font-medium text-red-700 dark:text-red-300">
                                        Reject Submission
                                    </span>
                                </label>
                            </div>
                            {errors.decision && <p className="text-red-500 text-sm">{errors.decision}</p>}
                        </div>

                        {/* Additional Notes */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Additional Notes (Optional):
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add any additional comments..."
                                rows={3}
                            />
                            {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('submissions.index')}
                                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.decision}
                                className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:ring-4 focus:outline-none disabled:opacity-50 ${
                                    data.decision === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
                                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800'
                                }`}
                            >
                                {processing ? 'Processing...' : (data.decision === 'approve' ? 'Approve Submission' : 'Reject Submission')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
