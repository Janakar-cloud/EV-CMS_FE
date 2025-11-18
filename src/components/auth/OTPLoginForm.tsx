'use client';

import { useState } from 'react';
import { AuthFormType } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { 
  EnvelopeIcon, 
  PhoneIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface OTPLoginFormProps {
  onSuccess?: (identifier: string) => void;
  onBack?: () => void;
  onSwitchForm?: (formType: AuthFormType, data?: any) => void;
}

export default function OTPLoginForm({ onSuccess, onBack, onSwitchForm }: OTPLoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const detectLoginMethod = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

    if (emailRegex.test(value)) return 'email';
    if (phoneRegex.test(value)) return 'phone';
    return null;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);

    const detectedMethod = detectLoginMethod(value);
    if (detectedMethod) {
      setLoginMethod(detectedMethod);
    }

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      setError('Please enter your email address or phone number');
      return;
    }

    const detectedMethod = detectLoginMethod(identifier);
    if (!detectedMethod) {
      setError('Please enter a valid email address or phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.requestOTP({
        identifier,
        type: 'login'
      });

      if (response.success) {
        onSwitchForm?.('otp_verify', { 
          identifier, 
          otpType: 'login',
          loginMethod: detectedMethod 
        });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP request error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (loginMethod === 'email') {
      return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
    } else if (loginMethod === 'phone') {
      return <PhoneIcon className="h-5 w-5 text-gray-400" />;
    }
    return <UserIcon className="h-5 w-5 text-gray-400" />;
  };

  const getPlaceholder = () => {
    return 'Enter email or phone number';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <EnvelopeIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Login with OTP</h2>
          <p className="text-gray-600 mt-2">
            Enter your email or phone number to receive a login code
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIcon()}
              </div>
              <input
                type="text"
                value={identifier}
                onChange={handleIdentifierChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={getPlaceholder()}
                disabled={isLoading}
              />
            </div>
            {identifier && (
              <p className="mt-1 text-xs text-gray-500">
                Detected: {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !identifier}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading || !identifier
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Sending OTP...
              </div>
            ) : (
              'Send Login Code'
            )}
          </button>
        </form>

        {/* Back to Regular Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none focus:underline"
            disabled={isLoading}
          >
            â† Back to Password Login
          </button>
        </div>

        {/* Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">How it works:</p>
              <p>
                We'll send a 6-digit code to your email or phone. 
                Use this code to sign in without entering your password.
              </p>
            </div>
          </div>
        </div>

        {/* Sample Accounts */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">Demo Accounts (OTP):</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div><span className="font-medium">Admin:</span> admin@evcms.com</div>
            <div><span className="font-medium">Franchise:</span> franchise.owner@evcms.com</div>
            <div><span className="font-medium">Partner:</span> partner@evcms.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
