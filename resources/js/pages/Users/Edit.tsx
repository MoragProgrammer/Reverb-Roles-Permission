import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users Edit',
        href: '/users',
    },
];

interface UserType {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    school_id: string;
    email: string;
    gender: 'Male' | 'Female';
    profile_picture: string | null;
    status: 'active' | 'inactive';
}

interface FormDataType {
    first_name: string;
    middle_name?: string;
    last_name: string;
    school_id: string;
    email: string;
    gender: 'Male' | 'Female' | '';
    profile_picture: File | null;
    status: 'active' | 'inactive';
    password?: string;
    roles: string[];
    _method?: 'PUT';
    [key: string]: any;
}

export default function Edit({ user, userRoles, roles }: { user: UserType, userRoles: string[], roles: string[] }) {
    const getInitials = useInitials();
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(user.profile_picture ? `/storage/${user.profile_picture}` : undefined);

    const { data, setData, errors, post } = useForm<FormDataType>({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        school_id: user.school_id || '',
        email: user.email || '',
        gender: user.gender || '',
        profile_picture: null,
        status: user.status || 'active',
        password: '',
        roles: userRoles || [],
        _method: 'PUT',
    });


function handleCheckboxChange(roleName: string, checked: boolean){
    if (checked){
        setData("roles", [...data.roles, roleName])
    }else{
        setData("roles", data.roles.filter(name => name !== roleName));
    }
}



    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('users.update', user.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Edit" />


                <div className='p-3'>
<Link href={route('users.index')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Back
                            </Link>

      <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto">
          <div className="grid gap-2">
              <label className="text-sm leading-none font-medium select-none">Profile Picture:</label>
              <Avatar className="h-20 w-20 text-2xl">
                  <AvatarImage src={previewUrl} alt="Profile Preview" />
                  <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
              </Avatar>
              <input
                  id="profile_picture"
                  type="file"
                  onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      setData('profile_picture', file);
                      if (file) {
                          setPreviewUrl(URL.createObjectURL(file));
                      } else {
                          setPreviewUrl(user.profile_picture ? `/storage/${user.profile_picture}` : undefined);
                      }
                  }}
                  name="profile_picture"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.profile_picture && <p className="text-red-500 text-sm mt-1">{errors.profile_picture}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="first_name" className="text-sm leading-none font-medium select-none">First Name:</label>
              <input
                  id="first_name"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  name="first_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="middle_name" className="text-sm leading-none font-medium select-none">Middle Name (optional):</label>
              <input
                  id="middle_name"
                  value={data.middle_name || ''}
                  onChange={(e) => setData('middle_name', e.target.value)}
                  name="middle_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.middle_name && <p className="text-red-500 text-sm mt-1">{errors.middle_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="last_name" className="text-sm leading-none font-medium select-none">Last Name:</label>
              <input
                  id="last_name"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  name="last_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="gender" className="text-sm leading-none font-medium select-none">Gender:</label>
              <select
                  id="gender"
                  value={data.gender}
                  onChange={(e) => setData('gender', e.target.value as 'Male' | 'Female')}
                  name="gender"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="school_id" className="text-sm leading-none font-medium select-none">School ID:</label>
              <input
                  id="school_id"
                  value={data.school_id}
                  onChange={(e) => setData('school_id', e.target.value)}
                  name="school_id"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.school_id && <p className="text-red-500 text-sm mt-1">{errors.school_id}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="email" className="text-sm leading-none font-medium select-none">Email:</label>
              <input
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  name="email"
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="password" className="text-sm leading-none font-medium select-none">Password (leave blank to keep current):</label>
              <input
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="roles" className="text-sm leading-none font-medium select-none">Roles:</label>
              {roles.map((role) => (
                  <label key={role} className="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          value={role}
                          checked={data.roles.includes(role)}
                          onChange={(e) => handleCheckboxChange(role, e.target.checked)}
                          id={role}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-800 capitalize">{role}</span>
                  </label>
              ))}
              {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="status" className="text-sm leading-none font-medium select-none">Status:</label>
              <select
                  id="status"
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                  name="status"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
          >
              Submit
          </button>
      </form>


                </div>

        </AppLayout>
    );
}


