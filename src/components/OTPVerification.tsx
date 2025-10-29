/**
 * OTPVerification Component
 * 
 * Reusable modal component for OTP verification during login and signup.
 * Features:
 * - 6-digit OTP input with auto-focus
 * - Countdown timer for OTP expiry
 * - Resend OTP functionality
 * - Auto-submit on 6 digits
 * - Error handling
 * - Loading states
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Clock, RefreshCw } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { getErrorMessage } from '../utils/auth';

interface OTPVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  email: string;
  purpose: 'login' | 'registration';
  otpExpiryTime?: number; // in seconds, default 300 (5 minutes)
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email,
  purpose,
  otpExpiryTime = 300
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(otpExpiryTime);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''));
      setError(null);
      setTimeLeft(otpExpiryTime);
      setCanResend(false);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, otpExpiryTime]);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = async (otpValue: string) => {
    try {
      setIsVerifying(true);
      setError(null);
      await onVerify(otpValue);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      setIsResending(true);
      setError(null);
      setOtp(Array(6).fill(''));
      await onResend();
      setTimeLeft(otpExpiryTime);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally{
      setIsResending(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verify OTP
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {purpose === 'login' ? 'Enter code to login' : 'Verify your email'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isVerifying}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email Display */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center mt-1">
            {email}
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isVerifying}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center mb-6">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className={`text-sm ${timeLeft <= 60 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
          </span>
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={otp.some(digit => !digit) || isVerifying}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
        >
          {isVerifying ? <LoadingSpinner /> : 'Verify OTP'}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || isResending}
            className={`text-sm font-medium flex items-center justify-center mx-auto gap-1 ${
              canResend
                ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {isResending ? (
              <>
                <LoadingSpinner />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Resend OTP</span>
              </>
            )}
          </button>
          {!canResend && timeLeft > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Available in {formatTime(timeLeft)}
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            💡 Tip: You can paste the code directly or type it digit by digit
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
