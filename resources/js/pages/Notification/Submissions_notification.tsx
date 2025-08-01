import { useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import { can } from '@/lib/can';
import { Button } from '@/components/ui/button';

interface SubmissionType {
    id: number;
    account_name: string;
    school_id: string;
    form_title: string;
    status: 'not_yet_responded' | 'user_responded' | 'rejection_process' | 'rejected_responded' | 'completed';
    submitted_time: string;
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

interface SubmissionsNotificationProps {
    // Optional: You can pass specific form IDs to filter notifications
    formIds?: number[];
}

export default function SubmissionsNotification({ formIds }: SubmissionsNotificationProps) {
    // Check permissions at the component level (not inside useEffect)
    const hasSubmissionNotificationPermission = can('notifications.Submissions_view');
    const hasReviewPermission = can('submissions.review');
    const hasReReviewPermission = can('submissions.re-review');

    useEffect(() => {
        // Early return if user doesn't have permission
        if (!hasSubmissionNotificationPermission) {
            return;
        }

        const channel = window.Echo.channel('submissions');

        // Listen for submission updates (when user responds to forms)
        channel.listen<{ submission: SubmissionType }>('SubmissionUpdated', (data) => {
            const { submission } = data;
            
            // Only show notifications for specific form IDs if provided
            if (formIds && !formIds.includes(submission.form_id)) {
                return;
            }

            // Show toast notification based on submission status
            if (submission.status === 'user_responded') {
                // User responded to initial form
                toast.success(
                    <div className="flex flex-col gap-2">
                        <div className="font-medium">
                            {submission.account_name} Responded: {submission.form_title}
                        </div>
                        <div className="flex gap-2">
                            {hasReviewPermission && (
                                <Link href={`/submissions/${submission.id}/review`}>
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Go to Review
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>,
                    {
                        duration: 8000,
                        description: `Form: ${submission.form_title}`,
                    }
                );
            } else if (submission.status === 'rejected_responded') {
                // User responded to rejected form
                toast.info(
                    <div className="flex flex-col gap-2">
                        <div className="font-medium">
                            {submission.account_name} Responded: the rejected form
                        </div>
                        <div className="flex gap-2">
                            {hasReReviewPermission && (
                                <Link href={`/submissions/${submission.id}/re-review`}>
                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                        Go to Re-review
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>,
                    {
                        duration: 8000,
                        description: `Form: ${submission.form_title}`,
                    }
                );
            }
        });

        // Cleanup function
        return () => {
            window.Echo.leave('submissions');
        };
    }, [formIds, hasSubmissionNotificationPermission, hasReviewPermission, hasReReviewPermission]);

    // This component doesn't render anything visible
    return null;
}
