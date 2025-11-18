'use client';

import { useState } from 'react';
import { AuthFormType } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import OTPLoginForm from '@/components/auth/OTPLoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import OTPVerifyForm from '@/components/auth/OTPVerifyForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { BoltIcon } from '@heroicons/react/24/outline';

interface AuthPageProps {
  onAuthSuccess?: (token: string, user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [currentForm, setCurrentForm] = useState<AuthFormType>('login');
  const [formData, setFormData] = useState<any>({});
  const { login } = useAuth();

  const handleFormSwitch = (formType: AuthFormType, data?: any) => {
    setCurrentForm(formType);
    if (data) {
      setFormData(data);
    }
  };

  const handleAuthSuccess = (token: string, user: any) => {
    console.log('Authentication successful:', { user, token });
    login(token, user);
    onAuthSuccess?.(token, user);
  };

  const handlePasswordResetSuccess = () => {
    setCurrentForm('login');
    setFormData({});
  };

  const handleBackToLogin = () => {
    setCurrentForm('login');
    setFormData({});
  };

  const renderCurrentForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchForm={handleFormSwitch}
          />
        );

      case 'otp_login':
        return (
          <OTPLoginForm
            onSwitchForm={handleFormSwitch}
            onBack={handleBackToLogin}
          />
        );

      case 'forgot_password':
        return (
          <ForgotPasswordForm
            onSwitchForm={handleFormSwitch}
            onBack={handleBackToLogin}
          />
        );

      case 'otp_verify':
        return (
          <OTPVerifyForm
            identifier={formData.identifier}
            otpType={formData.otpType}
            onSuccess={
              formData.otpType === 'login' 
                ? handleAuthSuccess 
                : undefined
            }
            onSwitchForm={handleFormSwitch}
            onBack={
              formData.otpType === 'login' 
                ? () => handleFormSwitch('otp_login')
                : () => handleFormSwitch('forgot_password')
            }
          />
        );

      case 'reset_password':
        return (
          <ResetPasswordForm
            identifier={formData.identifier}
            otp={formData.otp}
            onSuccess={handlePasswordResetSuccess}
            onBack={handleBackToLogin}
            onSwitchForm={handleFormSwitch}
          />
        );

      default:
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchForm={handleFormSwitch}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <BoltIcon className="h-12 w-12 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-3xl font-bold text-gray-900">EV CMS</h1>
              <p className="text-sm text-gray-600">Management Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {renderCurrentForm()}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Â© 2025 EV CMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
