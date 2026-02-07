'use client';

import { useState } from 'react';
import { LoginCredentials, LoginMethod, AuthFormType } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  KeyIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSuccess?: (token: string, user: any) => void;
  onSwitchForm?: (formType: AuthFormType, data?: any) => void;
}

export default function LoginForm({ onSuccess, onSwitchForm }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
    loginMethod: 'username',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const detectLoginMethod = (value: string): LoginMethod => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

    if (emailRegex.test(value)) return 'email';
    if (phoneRegex.test(value)) return 'phone';
    return 'username';
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const detectedMethod = detectLoginMethod(value);

    setFormData(prev => ({
      ...prev,
      identifier: value,
      loginMethod: detectedMethod,
    }));

    if (errors.identifier) {
      setErrors(prev => ({ ...prev, identifier: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identifier || !formData.password) {
      setErrors({
        general: 'Please provide both login identifier and password',
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(formData);

      if (response.success && response.user && response.token) {
        onSuccess?.(response.token, response.user);
      } else {
        const errorMap: Record<string, string> = {};
        if (response.errors) {
          response.errors.forEach(error => {
            errorMap[error.field] = error.message;
          });
        }
        if (!Object.keys(errorMap).length) {
          errorMap.general = response.message || 'Login failed. Please try again.';
        }
        setErrors(errorMap);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onSwitchForm?.('forgot_password');
  };

  const handleOTPLogin = () => {
    onSwitchForm?.('otp_login');
  };

  const getIdentifierIcon = () => {
    switch (formData.loginMethod) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
      case 'phone':
        return <PhoneIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (formData.loginMethod) {
      case 'email':
        return 'Enter your email address';
      case 'phone':
        return 'Enter your phone number';
      default:
        return 'Enter username, email, or phone';
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">Welcome back to EV CMS Portal</p>
        </div>

        {errors.general && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login Identifier Field */}
          <div>
            <label
              htmlFor="login-identifier"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username, Email, or Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {getIdentifierIcon()}
              </div>
              <input
                id="login-identifier"
                type="text"
                value={formData.identifier}
                onChange={handleIdentifierChange}
                className={`block w-full rounded-md border py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={getIdentifierPlaceholder()}
                disabled={isLoading}
              />
            </div>
            {errors.identifier && <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Detected:{' '}
              {formData.loginMethod === 'email'
                ? 'Email'
                : formData.loginMethod === 'phone'
                  ? 'Phone'
                  : 'Username'}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                className={`block w-full rounded-md border px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={e => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 focus:underline focus:outline-none"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Alternative Login Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleOTPLogin}
              className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <EnvelopeIcon className="mr-2 h-4 w-4" />
              Sign in with OTP
            </button>
          </div>
        </div>

        {/* Sample Credentials */}
        <div className="mt-6 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-xs font-medium text-gray-700">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              <span className="font-medium">Admin:</span> admin@evcms.com / password123
            </div>
            <div>
              <span className="font-medium">Franchise:</span> franchise001 / franchise123
            </div>
            <div>
              <span className="font-medium">Partner:</span> partner001 / partner123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
