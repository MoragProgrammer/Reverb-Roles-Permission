import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';

// Define interfaces locally since they're not exported from @/types
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
    account_name: string;
    school_id: string;
}

interface ResponseItem {
    id: number;
    field_title: string;
    original_filename: string;
    status: string;
    rejection_reason?: string;
}

interface ReviewHistoryItem {
    id: number;
    reviewer: string;
    action: string;
    notes: string;
    created_at: string;
}

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    status: 'not_yet_responded' | 'user_responded' | 'rejection_process' | 'rejected_responded' | 'completed';
    submitted_at: string;
    user: UserType;
    form_id: number;
    form: FormType;
    responses: ResponseItem[];
    review_history?: ReviewHistoryItem[];
}

export default function CompletedEdit({ submission }: { submission: SubmissionType }) {
  const [processing, setProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [responseId: number]: File }>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, responseId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [responseId]: file
      }));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Forms',
      href: '/forms',
    },
    {
      title: submission.form.title,
      href: `/forms/${submission.form.id}`,
    },
    {
      title: 'Edit Submission',
      href: `/submissions/${submission.id}/edit`,
    },
  ];

  const handleSave = () => {
    setProcessing(true);
    
    // Check if there are any files to upload
    if (Object.keys(uploadedFiles).length === 0) {
      setProcessing(false);
      alert('No files selected for upload.');
      return;
    }
    
    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Add uploaded files to FormData
    Object.entries(uploadedFiles).forEach(([responseId, file]) => {
      formData.append(`files[${responseId}]`, file);
    });
    
    // Add existing responses data to maintain structure
    // Instead of JSON.stringify, append each response individually for Laravel to recognize as array
    submission.responses.forEach((response, index) => {
      formData.append(`responses[${index}][id]`, response.id.toString());
      formData.append(`responses[${index}][response]`, uploadedFiles[response.id] ? 'file_reuploaded' : 'existing');
    });
    
    // Add method override for Laravel
    formData.append('_method', 'PATCH');
    
    // Use router.post with FormData for file uploads
    router.post(`/submissions/${submission.id}`, formData, {
      onSuccess: () => {
        setProcessing(false);
        setUploadedFiles({}); // Clear uploaded files
        alert('Files uploaded successfully!');
        // Redirect back to the form page
        router.get(`/forms/${submission.form_id}`);
      },
      onError: (errors) => {
        setProcessing(false);
        console.error('Save errors:', errors);
        alert('Error uploading files. Please try again.');
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Submission ${submission.id}`} />

      <div className='p-3'>
        <Link 
          href={`/forms/${submission.form.id}`}
          className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Back to Form
        </Link>

        <div className="mt-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Edit Submission</h2>

          {/* Submission Details Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submission Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Title</h3>
              <p className="text-gray-900 dark:text-white">{submission.form.title}</p>
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
              <p className="text-gray-900 dark:text-white">{new Date(submission.submitted_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

          {/* Form Responses Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Form Responses</h2>
          </div>
          
          <div className="space-y-4">
            {submission.responses.map((response) => (
              <div key={response.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{response.field_title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${response.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>File:</strong> {response.original_filename}
                </p>

                {/* File re-upload section */}
                <div className="mt-3 mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Re-upload File:
                  </label>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => handleFileUpload(e, response.id)}
                  />
                  {uploadedFiles[response.id] && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      <strong>New file selected:</strong> {uploadedFiles[response.id].name}
                    </p>
                  )}
                </div>

                {response.rejection_reason && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    <strong>Rejection Reason:</strong> {response.rejection_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

          {/* Review History Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review History</h2>
          
          <div className="space-y-4">
            {submission.review_history && submission.review_history.length > 0 ? (
              submission.review_history.map((review: ReviewHistoryItem, index: number) => (
                <div key={review.id || index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer}</h3>
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
                    <strong>{review.action === 'edited' ? 'Edited at:' : 'Reviewed at:'}</strong> {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No review history available.</p>
            )}
          </div>
        </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSave}
              disabled={processing}
              className="px-6 py-2 text-sm font-medium"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}