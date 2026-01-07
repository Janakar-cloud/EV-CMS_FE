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
  ArrowPathIcon
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
    rememberMe: false
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
      loginMethod: detectedMethod
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
        general: 'Please provide both login identifier and password'
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="text-gray-600 mt-2">
            Welcome back to EV CMS Portal
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login Identifier Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username, Email, or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIdentifierIcon()}
              </div>
              <input
                type="text"
                value={formData.identifier}
                onChange={handleIdentifierChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={getIdentifierPlaceholder()}
                disabled={isLoading}
              />
            </div>
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Detected: {formData.loginMethod === 'email' ? 'Email' : formData.loginMethod === 'phone' ? 'Phone' : 'Username'}
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleOTPLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Sign in with OTP
            </button>
          </div>
        </div>

        {/* Sample Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div><span className="font-medium">Admin:</span> admin@evcms.com / password123</div>
            <div><span className="font-medium">Franchise:</span> franchise001 / franchise123</div>
            <div><span className="font-medium">Partner:</span> partner001 / partner123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
