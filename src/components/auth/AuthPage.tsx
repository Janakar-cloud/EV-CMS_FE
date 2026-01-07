'use client';

import { useState } from 'react';
import { AuthFormType } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import OTPLoginForm from '@/components/auth/OTPLoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import OTPVerifyForm from '@/components/auth/OTPVerifyForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

interface AuthPageProps {
  onAuthSuccess?: (token: string, user: any) => void;
  className?: string;
}

export default function AuthPage({ onAuthSuccess, className }: AuthPageProps) {
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
                ? (token, user) => handleAuthSuccess(token || '', user)
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

  const classes = ['space-y-6', className].filter(Boolean).join(' ');
  return <div className={classes}>{renderCurrentForm()}</div>;
}
