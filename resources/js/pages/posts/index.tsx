import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Posts',
        href: '/posts',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded border p-6 shadow-xl">

                    <div className="mb-5 flex item-center justify-between">
                        <div className="relative w-full sm:w-1/3">
                            <Input id={'search'} className="peer ps-9" placeholder="Search..." type="search" />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <Search size={16} aria-hidden="true" />
                            </div>
                        </div>

                    <Button>
                        <Link href="/posts/create" prefetch>
                            Create Post
                        </Link>
                    </Button>

                    </div>

                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <TableRow>
                                         <TableHead>1</TableHead>
                                        <TableHead>1Image</TableHead>
                                        <TableHead>1Title</TableHead>
                                        <TableHead>1Content</TableHead>
                                        <TableHead>1Category</TableHead>
                                        <TableHead>1Status</TableHead>
                                        <TableHead>1Action</TableHead>
                                    </TableRow>
                                          <TableRow>
                                         <TableHead>2</TableHead>
                                        <TableHead>2Image</TableHead>
                                        <TableHead>2Title</TableHead>
                                        <TableHead>2Content</TableHead>
                                        <TableHead>2Category</TableHead>
                                        <TableHead>2Status</TableHead>
                                        <TableHead>2Action</TableHead>
                                    </TableRow>
                                </TableBody>

                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
