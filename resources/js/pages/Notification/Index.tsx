import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage} from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { can } from '@/lib/can';
import React from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Notifications',
    href: '/notifications',
  },
];

interface FormType {
  id: number; // This is now the notification ID for uniqueness
  form_id?: number; // The actual form ID for navigation
  title: string;
  status: 'pending' | 'in-process' | 'rejected' | 'completed';
  can_fill: boolean;
  submission_status?: string;
  message?: string; // For toast notifications
  notification_id?: number;
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>; // Additional data for notifications
}

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

interface Props {
  assignedForms: FormType[];
  rejectedForms: FormType[];
  submissionGroups: SubmissionGroupType[];
}

export default function Index({ assignedForms, rejectedForms, submissionGroups }: Props) {
  const { flash } = usePage<{ flash: { message?: string } }>().props;
  const [formsToShow, setFormsToShow] = useState<FormType[]>([]);
  const [submissionGroupsState, setSubmissionGroupsState] = useState<SubmissionGroupType[]>(submissionGroups || []);

  // Check permissions
  const submissionCan = {
    view: can('notifications.Submissions_view'),
    review: can('submissions.review'),
    reReview: can('submissions.re-review'),
    delete: can('submissions.delete'),
  };

  useEffect(() => {
    // Combine all forms and identify completed ones from status
    const allForms = [...assignedForms, ...rejectedForms];
    setFormsToShow(allForms);
  }, [assignedForms, rejectedForms]);

  useEffect(() => {
    // Show flash messages as toast
    if (flash.message) {
      toast.success(flash.message);
    }

    const notificationChannel = window.Echo.channel('notifications');
    const submissionChannel = window.Echo.channel('submissions');

    notificationChannel.listen<{ notification: FormType }>('NotificationCreated', (data) => {
      // Handle new notification - show toast and refresh forms list
      toast.info(`🔔 New form assigned: ${data.notification.title}`);
      setFormsToShow((prevForms) => [...prevForms, data.notification]);
    });

    notificationChannel.listen<{ notification: FormType }>('NotificationUpdated', (data) => {
      // Handle notification update - show different toast types based on status
      if (data.notification.status === 'rejected') {
        toast.error(data.notification.message || `❌ Form rejected: ${data.notification.title}`, {
          duration: 6000, // Show rejection toasts longer
          description: 'Please check the rejection details and resubmit your form.',
        });
        // Update the form in the list
        setFormsToShow((prevForms) =>
          prevForms.map((form) =>
            form.id === data.notification.id ? data.notification : form
          )
        );
      } else if (data.notification.status === 'completed') {
        toast.success(data.notification.message || `🎉 Form completed: ${data.notification.title}`, {
          duration: 5000,
          description: 'Your form has been successfully approved!',
        });
        // Update the form to show completed status
        setFormsToShow((prevForms) =>
          prevForms.map((form) =>
            form.id === data.notification.id ? data.notification : form
          )
        );
      } else {
        toast.info(data.notification.message || `📝 Form status updated: ${data.notification.title}`);
        // Update the form in the list for other status changes
        setFormsToShow((prevForms) =>
          prevForms.map((form) =>
            form.id === data.notification.id ? data.notification : form
          )
        );
      }
    });

    notificationChannel.listen<{ formId: number, title: string, notification: FormType }>('FormCompleted', (data) => {
      // Handle form completion - show toast and update status
      toast.success(`🎉 Form completed: ${data.title}`);
      setFormsToShow((prevForms) =>
        prevForms.map((form) =>
          form.id === data.formId ? { ...form, status: 'completed' as const } : form
        )
      );
    });

    // Listen for submission updates if user has permission
    if (submissionCan.view) {
      submissionChannel.listen<{ submission: SubmissionType }>('SubmissionCreated', (data) => {
        setSubmissionGroupsState((prevGroups) => {
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

      submissionChannel.listen<{ submission: SubmissionType }>('SubmissionUpdated', (data) => {
        setSubmissionGroupsState((prevGroups) => {
          const updatedGroups = [...prevGroups];
          const groupIndex = updatedGroups.findIndex(group => group.form_id === data.submission.form_id);
          
          if (groupIndex !== -1) {
            // Group exists, update or remove submission
            const group = updatedGroups[groupIndex];
            const submissionIndex = group.submissions.findIndex(sub => sub.id === data.submission.id);
            
            if (data.submission.status === 'completed') {
              // Remove completed submissions from the list
              if (submissionIndex !== -1) {
                group.submissions.splice(submissionIndex, 1);
              }
              // If no submissions left, remove the group
              if (group.submissions.length === 0) {
                updatedGroups.splice(groupIndex, 1);
              }
            } else if (['user_responded', 'rejected_responded'].includes(data.submission.status)) {
              // Update or add submission if it has reviewable status
              if (submissionIndex !== -1) {
                // Update existing submission
                group.submissions[submissionIndex] = data.submission;
              } else {
                // Add new submission to existing group
                group.submissions.push(data.submission);
              }
            } else if (submissionIndex !== -1) {
              // Remove submission if it no longer has reviewable status
              group.submissions.splice(submissionIndex, 1);
              // If no submissions left, remove the group
              if (group.submissions.length === 0) {
                updatedGroups.splice(groupIndex, 1);
              }
            }
          } else if (['user_responded', 'rejected_responded'].includes(data.submission.status)) {
            // Group doesn't exist but submission has reviewable status, create new group
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

      submissionChannel.listen<{ submissionId: number }>('SubmissionDeleted', (data) => {
        setSubmissionGroupsState((prevGroups) =>
          prevGroups.map(group => ({
            ...group,
            submissions: group.submissions.filter((submission) => submission.id !== data.submissionId)
          }))
        );
      });
    }

    return () => {
      window.Echo.leave('notifications');
      if (submissionCan.view) {
        window.Echo.leave('submissions');
      }
    };
  }, [flash.message, submissionCan.view]);

  // Helper functions for submissions table
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

  const getActionLink = (submission: SubmissionType): React.ReactNode => {
    // Review link - for user_responded status
    if (submission.status === 'user_responded' && submissionCan.review) {
      return (
        <a
          href={route('submissions.review', submission.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200"
        >
          <span className="mr-1">📝</span>
          Review Form
          <span className="ml-1">↗</span>
        </a>
      );
    }

    // Re-review link - for rejected_responded status
    if (submission.status === 'rejected_responded' && submissionCan.reReview) {
      return (
        <a
          href={route('submissions.re-review', submission.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 transition-colors duration-200"
        >
          <span className="mr-1">🔄</span>
          Re-review Form
          <span className="ml-1">↗</span>
        </a>
      );
    }

    // No action available - show specific permission requirement
    if (submission.status === 'user_responded' && !submissionCan.review) {
      return (
        <span className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-500 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
          Requires review permission
        </span>
      );
    }

    if (submission.status === 'rejected_responded' && !submissionCan.reReview) {
      return (
        <span className="inline-flex items-center px-3 py-2 text-xs font-medium text-purple-500 bg-purple-100 rounded-lg dark:bg-purple-900 dark:text-purple-300">
          Requires re-review permission
        </span>
      );
    }

    // Default
    return (
      <span className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-400">
        No action available
      </span>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className='p-6'>
        {formsToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-300 rounded-lg">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">No forms to fill</h3>
            <p className="text-yellow-600 text-center">You don't have any forms assigned to you at the moment.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {formsToShow.map((form) => (
              <div key={form.id} className={`relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                form.status === 'rejected'
                  ? 'bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-400'
                  : form.status === 'completed'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-400'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-400'
              }`}>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    form.status === 'rejected'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : form.status === 'completed'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : form.can_fill
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {form.status === 'rejected'
                      ? '🔄 Resubmit'
                      : form.status === 'completed'
                        ? '✅ Completed'
                        : form.can_fill
                          ? '📝 Pending'
                          : '⏳ Processing'
                    }
                  </span>
                </div>

                <div className="p-6">
                  {/* Form Icon */}
                  <div className="text-3xl mb-4">
                    {form.status === 'rejected' ? '⚠️' : form.status === 'completed' ? '🎉' : '📄'}
                  </div>

                  {/* Form Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 pr-16">{form.title}</h3>

                  {/* Status Description */}
                  <p className={`text-sm mb-4 ${
                    form.status === 'rejected' ? 'text-red-600' :
                    form.status === 'completed' ? 'text-green-600' :
                    form.can_fill ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {form.status === 'rejected'
                      ? '⚡ Form has been rejected - Please review and resubmit'
                      : form.status === 'completed'
                        ? '🎉 Form has been accepted and completed successfully!'
                        : form.can_fill
                          ? '⏳ Form is ready to fill'
                          : '✅ Form has been submitted and is being processed'
                    }
                  </p>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    {form.status === 'rejected' ? (
                      <Link
                        href={`/notifications/rejected/${form.form_id || form.id}`}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <span className="mr-2">👁️</span>
                        View Rejection Details
                      </Link>
                    ) : form.status === 'completed' ? (
                      <Link
                        href={route('notifications.completed', form.form_id || form.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <span className="mr-2">📋</span>
                        View Completed Form
                      </Link>
                    ) : form.can_fill ? (
                      <Link
                        href={`/notifications/fill-up/${form.form_id || form.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span className="mr-2">✏️</span>
                        Fill Form
                      </Link>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg border border-yellow-200">
                        <span className="mr-2">⏳</span>
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Render submissions table if user has view permission */}
      {submissionCan.view && submissionGroupsState.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Submissions Overview</h2>

          {submissionGroupsState.map((group) => (
            <div key={group.form_id} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{group.form_title}</h3>
              <p className="text-sm mb-1 text-gray-500">{group.form_description}</p>

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
                          {getActionLink(submission)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
