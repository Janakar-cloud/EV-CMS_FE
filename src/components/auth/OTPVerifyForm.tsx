'use client';

import { useState, useEffect, useRef } from 'react';
import { OTPVerification, AuthFormType } from '@/types/auth';
import { authService } from '@/lib/auth-service';
import { 
  KeyIcon, 
  ArrowPathIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface OTPVerifyFormProps {
  identifier: string;
  otpType: 'login' | 'password_reset';
  onSuccess?: (token?: string, user?: any) => void;
  onBack?: () => void;
  onSwitchForm?: (formType: AuthFormType, data?: any) => void;
}

export default function OTPVerifyForm({ 
  identifier, 
  otpType, 
  onSuccess, 
  onBack, 
  onSwitchForm 
}: OTPVerifyFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); 
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(index + pastedOtp.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verification: OTPVerification = {
        identifier,
        otp: otpString,
        type: otpType
      };

      const response = await authService.verifyOTP(verification);
      
      if (response.success) {
        if (otpType === 'login' && response.user && response.token) {
          onSuccess?.(response.token, response.user);
        } else if (otpType === 'password_reset') {
          onSwitchForm?.('reset_password', { identifier, otp: otpString });
        }
      } else {
        if (response.errors && response.errors.length > 0) {
          setError(response.errors[0].message);
        } else {
          setError('Invalid OTP. Please try again.');
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await authService.requestOTP({
        identifier,
        type: otpType
      });

      if (response.success) {
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {otpType === 'login' ? 'OTP Login' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="font-medium text-gray-900 mt-1">
            {identifier}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter OTP
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                OTP expires in {formatTime(timeLeft)}
              </span>
            </div>
            
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend OTP'}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Didn't receive the code? You can request a new one in {formatTime(Math.max(timeLeft, 0))}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !isOtpComplete || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {otpType === 'login' ? 'Sign In' : 'Verify OTP'}
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
            â† Back to {otpType === 'login' ? 'login options' : 'login'}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 text-center">
            Check your {identifier.includes('@') ? 'email inbox' : 'SMS messages'} for the verification code.
            The code will expire in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
