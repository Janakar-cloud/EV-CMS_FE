'use client';

import { useState } from 'react';
import { CreateUserRequest, UserValidationError } from '@/types/user';
import { userService } from '@/lib/user-service';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AddUserFormProps {
  onUserAdded?: () => void;
  onCancel?: () => void;
}

export default function AddUserForm({ onUserAdded, onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    userid: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [userIdStatus, setUserIdStatus] = useState<'available' | 'taken' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'tags'
          ? value
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'userid') {
      setUserIdStatus(null);
      if (value.length >= 3) {
        checkUserIdAvailability(value);
      }
    }
  };

  const checkUserIdAvailability = async (userid: string) => {
    setIsCheckingUserId(true);
    try {
      const result = await userService.checkUserIdAvailability(userid);
      setUserIdStatus(result.available ? 'available' : 'taken');
    } catch (error) {
      console.error('Error checking user ID:', error);
    } finally {
      setIsCheckingUserId(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (minimum 10 digits)';
    }

    if (!formData.userid || formData.userid.trim().length < 3) {
      newErrors.userid = 'User ID must be at least 3 characters long';
    } else if (userIdStatus === 'taken') {
      newErrors.userid = 'User ID already taken, please try another';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await userService.createUser(formData);

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          userid: '',
          fullName: '',
          email: '',
          phone: '',
          role: 'user',
          tags: [],
        });
        setUserIdStatus(null);

        setTimeout(() => {
          onUserAdded?.();
        }, 1500);
      } else {
        setSubmitStatus('error');
        if (result.errors) {
          const errorMap: Record<string, string> = {};
          result.errors.forEach((error: UserValidationError) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSubmitStatus('error');
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserIdStatusIcon = () => {
    if (isCheckingUserId) {
      return <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>;
    }

    if (userIdStatus === 'available') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }

    if (userIdStatus === 'taken') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }

    return null;
  };

  return (
    <div className="rounded-lg border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Add New User</h2>
        <p className="mt-1 text-sm text-slate-300">
          Create a new user account. All fields are required and email/phone must be unique.
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 flex items-center rounded-lg border border-green-700 bg-green-900/30 p-4">
          <CheckCircleIcon className="mr-2 h-5 w-5 text-green-400" />
          <span className="text-green-300">User created successfully!</span>
        </div>
      )}

      {submitStatus === 'error' && errors.general && (
        <div className="mb-6 flex items-center rounded-lg border border-red-700 bg-red-900/30 p-4">
          <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-400" />
          <span className="text-red-300">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User ID Field */}
        <div>
          <label htmlFor="userid" className="mb-2 block text-sm font-medium text-white">
            User ID *
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              name="userid"
              id="userid"
              value={formData.userid}
              onChange={handleInputChange}
              className={`block w-full rounded-md border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.userid ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="Enter unique user ID (min 3 characters)"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {getUserIdStatusIcon()}
            </div>
          </div>
          {errors.userid && <p className="mt-1 text-sm text-red-400">{errors.userid}</p>}
          {userIdStatus === 'available' && !errors.userid && (
            <p className="mt-1 text-sm text-green-400">User ID is available</p>
          )}
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-white">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.fullName ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter full name"
            disabled={isSubmitting}
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.email ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.phone ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter phone number (+1234567890)"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium text-white">
            Role *
          </label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.role ? 'border-red-500' : 'border-slate-400'
            }`}
            disabled={isSubmitting}
          >
            <option value="admin">Admin</option>
            <option value="brand">Brand</option>
            <option value="user">User</option>
          </select>
          {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
        </div>

        {/* Tags Field (optional) */}
        <div>
          <label htmlFor="tags" className="mb-2 block text-sm font-medium text-white">
            Tags (optional)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            value={(formData.tags || []).join(', ')}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter tags separated by commas (e.g. SUPER_ADMIN, PARTNER_ADMIN)"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-slate-300">
            Tags are optional labels only. They do not change permissions.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-slate-600 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || userIdStatus === 'taken'}
            className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isSubmitting || userIdStatus === 'taken'
                ? 'cursor-not-allowed bg-slate-600 opacity-50'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
