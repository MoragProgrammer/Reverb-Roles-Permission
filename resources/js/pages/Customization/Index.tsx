import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Image, Globe, Type, Monitor, Sun } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Customization',
    href: '/customization',
  },
];

interface CustomizationSettings {
  current_logo?: string;
  current_favicon?: string;
  current_title_text?: string;
  current_login_picture?: string;
  login_overlay_opacity?: string;
}

interface Props {
  settings: CustomizationSettings;
}

export default function Index({ settings }: Props) {
  const { flash } = usePage<{ flash: { message?: string } }>().props;
  
  // File upload refs
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const loginPictureRef = useRef<HTMLInputElement>(null);

  // Preview states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [loginPicturePreview, setLoginPicturePreview] = useState<string | null>(null);

  // Form for uploads and text
  const { data, setData, post, processing, errors, reset } = useForm({
    logo: null as File | null,
    favicon: null as File | null,
    login_picture: null as File | null,
    title_text: settings.current_title_text || 'Laravel Starter Kit',
    overlay_opacity: parseFloat(settings.login_overlay_opacity || '0.4'),
    action: '',
  });

  // Handle file selection and preview
  const handleFileSelect = (type: 'logo' | 'favicon' | 'login_picture', file: File) => {
    setData(type, file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    switch (type) {
      case 'logo':
        setLogoPreview(previewUrl);
        break;
      case 'favicon':
        setFaviconPreview(previewUrl);
        break;
      case 'login_picture':
        setLoginPicturePreview(previewUrl);
        break;
    }
  };

  // Handle title text save
  const handleTitleTextSave = () => {
    post(route('customization.update-title'), {
      onSuccess: () => {
        toast.success('Title updated successfully!');
      },
      onError: () => {
        toast.error('Update failed. Please try again.');
      }
    });
  };

  // Handle overlay opacity save
  const handleOverlayOpacitySave = () => {
    post(route('customization.update-overlay-opacity'), {
      onSuccess: () => {
        toast.success('Overlay opacity updated successfully!');
      },
      onError: () => {
        toast.error('Update failed. Please try again.');
      }
    });
  };

  // Handle upload
  const handleUpload = (type: 'logo' | 'favicon' | 'login_picture') => {
    setData('action', 'upload');
    post(route('customization.upload', { type }), {
      onSuccess: () => {
        toast.success('File uploaded successfully!');
        reset();
        // Clear previews
        setLogoPreview(null);
        setFaviconPreview(null);
        setLoginPicturePreview(null);
      },
      onError: () => {
        toast.error('Upload failed. Please try again.');
      }
    });
  };

  // Handle delete
  const handleDelete = (type: 'logo' | 'favicon' | 'login_picture') => {
    setData('action', 'delete');
    post(route('customization.delete', { type }), {
      onSuccess: () => {
        toast.success('File deleted successfully!');
        reset();
      },
      onError: () => {
        toast.error('Delete failed. Please try again.');
      }
    });
  };

  // Component for each customization item
  const CustomizationItem = ({ 
    title, 
    description, 
    icon: Icon, 
    type, 
    currentFile, 
    preview, 
    fileRef, 
    acceptTypes 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    type: 'logo' | 'favicon' | 'login_picture';
    currentFile?: string;
    preview: string | null;
    fileRef: React.RefObject<HTMLInputElement | null>;
    acceptTypes: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current/Preview Image */}
        <div className="flex items-center justify-center w-full">
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
            {preview ? (
              <img 
                src={preview} 
                alt={`${title} preview`} 
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : currentFile ? (
              <img 
                src={`/storage/${currentFile}`} 
                alt={`Current ${title}`} 
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <div className="text-center">
                <Icon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Default Laravel</p>
              </div>
            )}
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileRef}
          type="file"
          accept={acceptTypes}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(type, file);
            }
          }}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </button>

          {data[type] && (
            <button
              onClick={() => handleUpload(type)}
              disabled={processing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save'}
            </button>
          )}

          {(currentFile || preview) && (
            <button
              onClick={() => handleDelete(type)}
              disabled={processing}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {errors[type] && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors[type]}</p>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Customization" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Website Customization
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your website's appearance by uploading your own logos, favicon, and images.
          </p>
        </div>

        {/* Flash Message */}
        {flash.message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {flash.message}
          </div>
        )}

        {/* Customization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <CustomizationItem
            title="Website Logo"
            description="Upload your logo for the header and navigation"
            icon={Image}
            type="logo"
            currentFile={settings.current_logo}
            preview={logoPreview}
            fileRef={logoRef}
            acceptTypes="image/*"
          />

          {/* Favicon */}
          <CustomizationItem
            title="Favicon"
            description="Upload your favicon (appears in browser tabs)"
            icon={Globe}
            type="favicon"
            currentFile={settings.current_favicon}
            preview={faviconPreview}
            fileRef={faviconRef}
            acceptTypes="image/x-icon,image/png,image/gif,image/jpeg"
          />

          {/* Website Title Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Type className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Website Title</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customize the title text displayed in the header</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Title Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <Type className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Preview:</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{data.title_text}</p>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label htmlFor="title_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title Text
                </label>
                <input
                  id="title_text"
                  type="text"
                  value={data.title_text}
                  onChange={(e) => setData('title_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your website title"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleTitleTextSave}
                disabled={processing || !data.title_text.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Saving...' : 'Update Title'}
              </button>

              {/* Error Message */}
              {errors.title_text && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.title_text}</p>
              )}
            </div>
          </div>

          {/* Login Picture */}
          <CustomizationItem
            title="Login Page Picture"
            description="Upload a background image for the login page"
            icon={Monitor}
            type="login_picture"
            currentFile={settings.current_login_picture}
            preview={loginPicturePreview}
            fileRef={loginPictureRef}
            acceptTypes="image/*"
          />

          {/* Login Overlay Brightness */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Sun className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Login Overlay Brightness</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adjust the darkness of the overlay on login background image</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Brightness Preview */}
              <div className="relative w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 bg-black transition-opacity duration-200" 
                  style={{ opacity: data.overlay_opacity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white font-semibold text-sm" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                    Sample Text Preview
                  </p>
                </div>
              </div>

              {/* Slider Input */}
              <div>
                <label htmlFor="overlay_opacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overlay Darkness: {Math.round(data.overlay_opacity * 100)}%
                </label>
                <input
                  id="overlay_opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={data.overlay_opacity}
                  onChange={(e) => setData('overlay_opacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (Bright)</span>
                  <span>100% (Dark)</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleOverlayOpacitySave}
                disabled={processing}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Saving...' : 'Update Brightness'}
              </button>

              {/* Error Message */}
              {errors.overlay_opacity && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.overlay_opacity}</p>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Upload Guidelines
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Logo:</strong> Recommended size: 200x50px (PNG, JPG, SVG)</li>
            <li>• <strong>Favicon:</strong> Recommended size: 32x32px or 16x16px (ICO, PNG)</li>
            <li>• <strong>Title Image:</strong> Recommended size: 1200x300px (PNG, JPG)</li>
            <li>• <strong>Login Picture:</strong> Recommended size: 1920x1080px (PNG, JPG)</li>
            <li>• Maximum file size: 2MB per file</li>
            <li>• Supported formats: PNG, JPG, JPEG, GIF, SVG, ICO</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
