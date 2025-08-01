import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users Create',
        href: '/users',
    },
];

interface FormDataType {
    first_name: string;
    middle_name?: string;
    last_name: string;
    school_id: string;
    email: string;
    gender: 'Male' | 'Female' | '';
    profile_picture: File | null;
    status: 'active' | 'inactive';
    password: string;
    roles: string[];
    [key: string]: string | number | boolean | string[] | File | null | undefined;
}

export default function Create({ roles }: { roles: string[] }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, errors, post } = useForm<FormDataType>({
        first_name: '',
        middle_name: '',
        last_name: '',
        school_id: '',
        email: '',
        gender: '',
        profile_picture: null,
        status: 'active',
        password: '',
        roles: [],
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
        post(route('users.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Create" />


                <div className='p-3'>
<Link href={route('users.index')}
className="cursor-pointer px-3 py-2 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Back
                            </Link>

      <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto">
          <div className="grid gap-2">
              <label htmlFor="profile_picture" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Profile Picture:
              </label>
              <input
                  id="profile_picture"
                  type="file"
                  onChange={(e) => setData('profile_picture', e.target.files ? e.target.files[0] : null)}
                  name="profile_picture"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.profile_picture && <p className="text-red-500 text-sm mt-1">{errors.profile_picture}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="first_name" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  First Name:
              </label>
              <input
                  id="first_name"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  name="first_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="middle_name" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Middle Name (optional):
              </label>
              <input
                  id="middle_name"
                  value={data.middle_name}
                  onChange={(e) => setData('middle_name', e.target.value)}
                  name="middle_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter middle name"
              />
              {errors.middle_name && <p className="text-red-500 text-sm mt-1">{errors.middle_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="last_name" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Last Name:
              </label>
              <input
                  id="last_name"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  name="last_name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="gender" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Gender:
              </label>
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
              <label htmlFor="school_id" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  School ID:
              </label>
              <input
                  id="school_id"
                  value={data.school_id}
                  onChange={(e) => setData('school_id', e.target.value)}
                  name="school_id"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter school ID"
              />
              {errors.school_id && <p className="text-red-500 text-sm mt-1">{errors.school_id}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="email" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Email:
              </label>
              <input
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  name="email"
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="password" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Password:
              </label>
              <div className="relative">
                  <input
                      id="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                      {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                  </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="grid gap-2">
              <label htmlFor="roles" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Roles:
              </label>
              {roles.map((role) => (
                  <label key={role} className="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          value={role}
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
              <label htmlFor="status" className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  Status:
              </label>
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


