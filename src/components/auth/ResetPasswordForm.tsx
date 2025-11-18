'use client';

import { useState } from 'react';
import { PasswordReset, AuthFormType } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ResetPasswordFormProps {
  identifier: string;
  otp: string;
  onSuccess?: () => void;
  onBack?: () => void;
  onSwitchForm?: (formType: AuthFormType, data?: any) => void;
}

export default function ResetPasswordForm({ 
  identifier, 
  otp, 
  onSuccess, 
  onBack, 
  onSwitchForm 
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 3) return 'bg-yellow-500';
    if (strength < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 3) return 'Fair';
    if (strength < 4) return 'Good';
    return 'Strong';
  };

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'confirmPassword' || field === 'newPassword') {
      const newPassword = field === 'newPassword' ? value : formData.newPassword;
      const confirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (errors.confirmPassword && newPassword === confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const resetData: PasswordReset = {
        identifier,
        otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      };

      const response = await authService.resetPassword(resetData);
      
      if (response.success) {
        onSuccess?.();
      } else {
        const errorMap: Record<string, string> = {};
        if (response.errors) {
          response.errors.forEach(error => {
            errorMap[error.field] = error.message;
          });
        }
        setErrors(errorMap);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <KeyIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-600 mt-2">
            Create a strong password for your account
          </p>
          <p className="text-sm text-gray-500 mt-1">
            For: {identifier}
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPasswords(prev => ({ 
                  ...prev, 
                  newPassword: !prev.newPassword 
                }))}
              >
                {showPasswords.newPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength < 2 ? 'text-red-600' :
                    passwordStrength < 3 ? 'text-yellow-600' :
                    passwordStrength < 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className={`block w-full pr-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPasswords(prev => ({ 
                  ...prev, 
                  confirmPassword: !prev.confirmPassword 
                }))}
              >
                {showPasswords.confirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Resetting Password...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Reset Password
              </div>
            )}
          </button>
        </form>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none focus:underline"
            disabled={isLoading}
          >
            â† Back to login
          </button>
        </div>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className={formData.newPassword.length >= 6 ? 'text-green-600' : ''}>
              â€¢ At least 6 characters long
            </li>
            <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              â€¢ Contains lowercase letters
            </li>
            <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              â€¢ Contains uppercase letters
            </li>
            <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : ''}>
              â€¢ Contains numbers
            </li>
            <li className={/[^a-zA-Z\d]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              â€¢ Contains special characters
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
