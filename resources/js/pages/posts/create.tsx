import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react'; 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Posts',
        href: '/create/posts',
    },
];

export default function Dashboard() {

   export default function Dashboard() {
    const { data, setData, post, errors, processing } = useForm<{
        title: string;
        category: string;
        status: string;
        content: string;
        image: File | null;
    }>({
        title: '',
        category: '',
        status: '',
        content: '',
        image: null,
    });


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Posts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="rounded border p-6 shadow-xl">

                        <div className="mb-5 flex item-center justify-between">
                        <div className="text-xl text-slate-600">
                           Create Post
                        </div>

                    <Button>
                        <Link href="/posts" prefetch>
                            Go Back
                        </Link>
                    </Button>

                    </div>

                    <Card>
                        <CardContent>
                            <form>


                                    <div className='col-span-2'>
                                        <Label htmlFor="title">Title</Label>
                                        <Input type='text' id='title' placeholder='Title'/>
                                    </div>

                                      <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="category">Category</Label>
                                        <Select>
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Marvel">Marvel</SelectItem>
                                                <SelectItem value="DC">DC</SelectItem>
                                            </SelectContent>
                                            </Select>
                                    </div>

                                       <div className='col-span-2 md:col-span-1'>
                                        <Label htmlFor="status">Status</Label>
                                        <Select>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Active</SelectItem>
                                                <SelectItem value="0">Inactive</SelectItem>
                                            </SelectContent>
                                            </Select>
                                    </div>


                                    <div className="mt-4">
                                        <Label htmlFor='content'>Content</Label>
                                        <Textarea rows={6} id='content' placeholder='Type Content Here ...' />
                                    </div>


                                         <div className="mt-4">
                                        <Label htmlFor='image'>Select Image</Label>
                                        <Input type="file" id='image'/>
                                    </div>

                                <div className="mt-4 text-end">
                                    <Button type="submit">
                                        Create Post
                                    </Button>
                                </div>

                            </form>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
