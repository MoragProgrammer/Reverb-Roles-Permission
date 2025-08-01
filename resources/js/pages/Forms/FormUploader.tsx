import React, { useState } from 'react';

// Define interfaces for type safety
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface FormField {
    id: number;
    title: string;
    type: string;
}

interface Form {
    id: number;
    title: string;
    fields: FormField[];
}

interface FormUploaderProps {
    form: Form;
    users: User[];
}

interface FormResponses {
    [key: number]: string;
}

const FormUploader: React.FC<FormUploaderProps> = ({ form, users }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formResponses, setFormResponses] = useState<FormResponses>({});

    const handleUserChange = (user: User) => {
        setSelectedUser(user);
    };

    const handleResponseChange = (fieldId: number, value: string) => {
        setFormResponses({ ...formResponses, [fieldId]: value });
    };

    const handleSubmit = () => {
        // Handle form submission here
        console.log({ selectedUser, formResponses });
    };

    return (
        <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Upload User Form</h2>

            {/* Select User */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                </label>
                <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                        const userId = parseInt(e.target.value);
                        const user = users.find(u => u.id === userId);
                        if (user) handleUserChange(user);
                    }}
                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Select a user...</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.email})
                        </option>
                    ))}
                </select>
            </div>

            {/* Form responses inputs */}
            {form.fields.map((field) => (
                <div key={field.id} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        {field.title}
                    </label>
                    <input
                        type="text"
                        value={formResponses[field.id] || ''}
                        onChange={(e) => handleResponseChange(field.id, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
            ))}

            {/* Submit button */}
            <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Submit
            </button>
        </div>
    );
};

export default FormUploader;
