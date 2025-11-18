'use client';

import { useState } from 'react';
import { AuthFormType } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { 
  EnvelopeIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ForgotPasswordFormProps {
  onSuccess?: (identifier: string) => void;
  onBack?: () => void;
  onSwitchForm?: (formType: AuthFormType, data?: any) => void;
}

export default function ForgotPasswordForm({ onSuccess, onBack, onSwitchForm }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.requestOTP({
        identifier: email,
        type: 'password_reset'
      });

      if (response.success) {
        onSwitchForm?.('otp_verify', { identifier: email, otpType: 'password_reset' });
      } else {
        setError(response.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <EnvelopeIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">
            No worries! Enter your email address and we'll send you a reset code.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading || !email
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Sending Reset Code...
              </div>
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none focus:underline"
            disabled={isLoading}
          >
            â† Back to Login
          </button>
        </div>

        {/* Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Security Note:</p>
              <p>
                We'll send a 6-digit verification code to your email. 
                The code will expire in 10 minutes for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
