import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface SubmissionResponseType {
  id: number;
  field_title: string;
  file_path: string;
  original_filename: string;
}

interface FormType {
  id: number;
  title: string;
  description: string;
  submission_responses: SubmissionResponseType[];
  submitted_at: string;
}

export default function FormCompleted({ form }: { form: FormType }) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Notifications',
      href: '/notifications',
    },
    {
      title: 'Completed Form',
      href: `/notifications/completed/${form.id}`,
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Completed ${form.title}`} />

      <div className="p-3">
        <Link
          href={route('notifications.index')}
          className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Back to Notifications
        </Link>

        <div className="mt-4 max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <h3 className="text-lg font-medium">Form Submitted Successfully!</h3>
            </div>
            <p className="mt-2">Your form has been accepted and processed.</p>
          </div>

          {/* Form Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {form.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{form.description}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Submitted on: {new Date(form.submitted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Submitted Files */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Submitted Files
            </h3>
            {form.submission_responses.length > 0 ? (
              <div className="space-y-3">
                {form.submission_responses.map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {response.field_title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {response.original_filename}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(response.file_path, response.original_filename)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No files submitted</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
