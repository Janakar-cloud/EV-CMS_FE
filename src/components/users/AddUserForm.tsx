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
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [userIdStatus, setUserIdStatus] = useState<'available' | 'taken' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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
          phone: ''
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
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      );
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
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg shadow-lg border border-slate-600 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Add New User</h2>
        <p className="mt-1 text-sm text-slate-300">
          Create a new user account. All fields are required and email/phone must be unique.
        </p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-green-300">User created successfully!</span>
        </div>
      )}

      {submitStatus === 'error' && errors.general && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-300">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User ID Field */}
        <div>
          <label htmlFor="userid" className="block text-sm font-medium text-white mb-2">
            User ID *
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              name="userid"
              id="userid"
              value={formData.userid}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder-slate-400 ${
                errors.userid ? 'border-red-500' : 'border-slate-400'
              }`}
              placeholder="Enter unique user ID (min 3 characters)"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {getUserIdStatusIcon()}
            </div>
          </div>
          {errors.userid && (
            <p className="mt-1 text-sm text-red-400">{errors.userid}</p>
          )}
          {userIdStatus === 'available' && !errors.userid && (
            <p className="mt-1 text-sm text-green-400">User ID is available</p>
          )}
        </div>

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder-slate-400 ${
              errors.fullName ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter full name"
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder-slate-400 ${
              errors.email ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 placeholder-slate-400 ${
              errors.phone ? 'border-red-500' : 'border-slate-400'
            }`}
            placeholder="Enter phone number (+1234567890)"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-600">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-500 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || userIdStatus === 'taken'}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isSubmitting || userIdStatus === 'taken'
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
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
