import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface RejectedFieldType {
    field_id: number;
    field_title: string;
    original_reason: string;
    resubmitted_file_path?: string;
    resubmitted_filename?: string;
    resubmitted_at?: string;
}

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    form_title: string;
    form_description: string;
    status: string;
    submitted_time: string;
    rejected_fields: RejectedFieldType[];
    original_submission_date: string;
    resubmission_date: string;
}

interface ReReviewDecisionType {
    decision: 'approve' | 'reject' | '';
    rejection_reasons: { [key: number]: string }; // field_id -> reason
    notes: string;
    [key: string]: string | number | boolean | { [key: number]: string } | undefined;
}

export default function ReReview({ submission }: { submission: SubmissionType }) {
    const [rejectionReasons, setRejectionReasons] = useState<{ [key: number]: string }>({});
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Submissions',
            href: '/submissions',
        },
        {
            title: 'Re-review',
            href: `/submissions/${submission.id}/re-review`,
        },
    ];

    const { data, setData, errors, post, processing } = useForm<ReReviewDecisionType>({
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
        post(route('submissions.reReview.store', submission.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Re-review Submission - ${submission.form_title}`} />

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
                            {submission.form_title} <span className="text-orange-600 text-base">(Re-submission)</span>
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {submission.form_description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Submitted by:</span>
                                <p className="text-gray-900 dark:text-white">{submission.account_name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">School ID:</span>
                                <p className="text-gray-900 dark:text-white">{submission.school_id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Originally Submitted:</span>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(submission.original_submission_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Re-submitted:</span>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(submission.resubmission_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Re-submitted Fields */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Re-submitted Fields <span className="text-sm font-normal text-gray-600">(Previously Rejected)</span>
                        </h3>
                        
                        {submission.rejected_fields.length > 0 ? (
                            <div className="space-y-4">
                                {submission.rejected_fields.map((field) => (
                                    <div key={field.field_id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {field.field_title}
                                                </h4>
                                            </div>
                                            {field.resubmitted_file_path && (
                                                <button
                                                    onClick={() => handleDownload(field.resubmitted_file_path!, field.resubmitted_filename!)}
                                                    className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                                >
                                                    Download New File
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Original Rejection Reason */}
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-3">
                                            <h5 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                                Original Rejection Reason:
                                            </h5>
                                            <p className="text-sm text-red-700 dark:text-red-400">
                                                {field.original_reason}
                                            </p>
                                        </div>
                                        
                                        {/* New File Info */}
                                        {field.resubmitted_file_path ? (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-3">
                                                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                    New Submission:
                                                </h5>
                                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                                    File: {field.resubmitted_filename}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-500">
                                                    Uploaded: {field.resubmitted_at && new Date(field.resubmitted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3">
                                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                                    No new file submitted for this field
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* New Rejection Reason Input (shown only when reject is selected) */}
                                        {data.decision === 'reject' && (
                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    New Rejection Reason:
                                                </label>
                                                <textarea
                                                    value={rejectionReasons[field.field_id] || ''}
                                                    onChange={(e) => handleRejectionReasonChange(field.field_id, e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    placeholder="Enter reason for rejecting this field again..."
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No rejected fields found</p>
                        )}
                    </div>

                    {/* Review Decision Form */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Re-review Decision
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
                                        Approve Re-submission
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
                                        Reject Re-submission
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
                                placeholder="Add any additional comments about the re-review..."
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
                                {processing ? 'Processing...' : (data.decision === 'approve' ? 'Approve Re-submission' : 'Reject Re-submission')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
