import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head} from '@inertiajs/react';
import { type User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Props {
    auth: {
        user: User;
    };
}

export default function Dashboard({ auth }: Props) {
    const { user } = auth;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-8 p-6">
                {/* Welcome Message */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Welcome, {user.first_name}!
                    </h2>
                    <blockquote className="mt-4 italic text-gray-600 dark:text-gray-300">
                        "Behold, he cometh with clouds; and every eye shall see him, and they also which pierced him: and all kindreds of the earth shall wail because of him. Even so, Amen."
                        <br />
                        <span className="block mt-2 text-sm">— Revelation 1:7 (KJV) <br/><br/> by: Document Tracking Team</span>
                    </blockquote>
                </div>
            </div>
        </AppLayout>
    );
}
