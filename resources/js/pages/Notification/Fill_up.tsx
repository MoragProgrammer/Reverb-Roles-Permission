import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface FormFieldType {
  id: number;
  title: string;
  type: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'JPEG' | 'PNG';
}

interface FormType {
  id: number;
  title: string;
  description: string;
  fields: FormFieldType[];
}

interface FieldResponse {
  field_id: number;
  file: File | null;
}

interface FormDataType {
  form_id: number;
  responses: FieldResponse[];
  [key: string]: number | FieldResponse[];
}

export default function FillUp({ form }: { form: FormType }) {
  const { flash } = usePage<{ flash: { message?: string } }>().props;
  const [responses, setResponses] = useState<FieldResponse[]>(
    form.fields.map(field => ({ field_id: field.id, file: null }))
  );

  useEffect(() => {
    if (flash.message) {
      toast.success(flash.message);
    }
  }, [flash.message]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Notifications',
      href: '/notifications',
    },
    {
      title: 'Fill Form',
      href: `/notifications/fill-up/${form.id}`,
    },
  ];

  const { setData, errors, post, processing } = useForm<FormDataType>({
    form_id: form.id,
    responses: responses,
  });

  const handleFileChange = (fieldId: number, file: File | null) => {
    const updatedResponses = responses.map(response => 
      response.field_id === fieldId ? { ...response, file } : response
    );
    setResponses(updatedResponses);
    setData('responses', updatedResponses);
  };

  const getAcceptedFileTypes = (fieldType: string) => {
    switch (fieldType) {
      case 'Word':
        return '.doc,.docx';
      case 'Excel':
        return '.xls,.xlsx';
      case 'PowerPoint':
        return '.ppt,.pptx';
      case 'PDF':
        return '.pdf';
      case 'JPEG':
        return '.jpg,.jpeg';
      case 'PNG':
        return '.png';
      default:
        return '*';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that all fields have files
    const missingFiles = responses.filter(response => !response.file);
    if (missingFiles.length > 0) {
      toast.error(`Please upload files for all required fields.`);
      return;
    }
    
    // Update form data with current responses
    setData('responses', responses);
    
    post(route('notifications.submit', form.id), {
      onSuccess: () => {
        toast.success('🎉 Form submitted successfully! It is now being processed.');
      },
      onError: (errors) => {
        console.error('Submission errors:', errors);
        toast.error('Failed to submit form. Please check your files and try again.');
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Fill ${form.title}`} />

      <div className='p-3'>
        <Link 
          href={route('notifications.index')}
          className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Back to Notifications
        </Link>

        <div className="mt-4 max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{form.title}</h2>
            <p className="text-gray-700 dark:text-gray-300">{form.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => {
              const response = responses.find(r => r.field_id === field.id);
              return (
                <div key={field.id} className="grid gap-2">
                  <label 
                    htmlFor={`field_${field.id}`} 
                    className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                  >
                    {field.title}:
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {field.type}
                    </span>
                  </label>
                  <input
                    id={`field_${field.id}`}
                    type="file"
                    accept={getAcceptedFileTypes(field.type)}
                    onChange={(e) => handleFileChange(field.id, e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {response?.file && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {response.file.name}
                    </p>
                  )}
                  {errors[`responses.${responses.findIndex(r => r.field_id === field.id)}.file`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`responses.${responses.findIndex(r => r.field_id === field.id)}.file`]}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end gap-4">
              <Link
                href={route('notifications.index')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
              >
                {processing ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
