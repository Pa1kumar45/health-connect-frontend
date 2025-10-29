/**
 * Login Component
 * 
 * User authentication page with OTP verification for doctors and patients.
 * Implements a two-step login process: credentials submission and OTP verification.
 * 
 * Features:
 * - Email and password authentication
 * - Role selection (Doctor/Patient)
 * - OTP verification via email
 * - Account suspension detection and display
 * - Form validation
 * - Error handling and user feedback
 * - Session management integration
 * - Login info banner display
 * 
 * Authentication Flow:
 * 1. User enters credentials (email, password, role)
 * 2. Backend validates and sends OTP to email
 * 3. User enters OTP for verification
 * 4. On success, user is logged in and redirected
 * 
 * @component
 * @example
 * return (
 *   <Login />
 * )
 */
import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import OTPVerification from '../components/OTPVerification';
import { AlertTriangle, X } from 'lucide-react';
import { authService } from '../services/auth.service';

/**
 * Login form data structure
 */
interface LoginFormData {
  email: string;
  password: string;
  role: 'doctor' | 'patient';
}

/**
 * Account suspension information structure
 */
interface SuspensionInfo {
  reason: string;
  suspendedAt?: string;
  adminContact?: {
    name: string;
    email: string;
  };
}

/**
 * Login Component Implementation
 */
const Login = () => {
  // Navigation and context hooks
  const navigate = useNavigate();
  const { setCurrentUser, showLoginInfoToast } = useApp();

  // Component state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suspensionInfo, setSuspensionInfo] = useState<SuspensionInfo | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'patient'
  });

  /**
   * Handle initial login form submission
   * 
   * First step of authentication process:
   * - Validates credentials on backend
   * - Sends OTP to user's email
   * - Opens OTP verification modal
   * - Handles account suspension errors
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuspensionInfo(null);
      
      console.log('Login attempt:', formData);
       
      // Send credentials to backend - OTP will be sent to email
      await authService.login(formData);
      
      // Show OTP verification modal
      setShowOTPModal(true);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle suspended account
      if (err.response?.data?.suspended) {
        setSuspensionInfo({
          reason: err.response.data.suspensionReason,
          suspendedAt: err.response.data.suspendedAt,
          adminContact: err.response.data.adminContact
        });
      } else {
        // Handle general authentication errors
        setError(err.response?.data?.message || err.message || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OTP verification
   * 
   * Second step of authentication process:
   * - Verifies OTP entered by user
   * - Completes login on success
   * - Sets user in context and redirects
   * 
   * @param {string} otp - 6-digit OTP entered by user
   * @throws {Error} If OTP verification fails
   */
  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await authService.verifyOTP({
        email: formData.email,
        otp,
        role: formData.role,
        purpose: 'login'
      });

      console.log('OTP verified, login successful:', response);

      // Set current user in context
      if (response.data) {
        setCurrentUser(response.data);
      }

      // Check for session conflict notification (FR-1.4)
      if (response.sessionInfo?.singleDeviceEnforcement) {
        console.log('Single device enforcement:', response.sessionInfo.message);
        // You could show a toast notification here if desired
        // For now, it's logged and the user is logged in successfully
      }

      // Show login info toast if available
      if (response.loginInfo) {
        showLoginInfoToast(response.loginInfo);
      }

      // Close OTP modal
      setShowOTPModal(false);

      // Navigate based on role
      if (formData.role === 'doctor') {
        navigate('/appointments');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      throw error; // Let OTPVerification component handle the error display
    }
  };

  /**
   * Handle OTP resend
   * Resends OTP to user's email
   */
  const handleResendOTP = async () => {
    try {
      await authService.sendOTP({
        email: formData.email,
        role: formData.role,
        purpose: 'login'
      });
      console.log('OTP resent successfully');
    } catch (error: unknown) {
      console.error('Resend OTP error:', error);
      throw error; // Let OTPVerification component handle the error display
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              create a new account
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : 'Sign in'}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={formData.email}
        purpose="login"
      />

      {/* Suspension Modal */}
      {suspensionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Deactivated
                </h3>
              </div>
              <button
                onClick={() => setSuspensionInfo(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your account has been deactivated by an administrator and you cannot log in at this time.
              </p>

              {/* Suspension Reason */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                  Reason for Deactivation:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {suspensionInfo.reason}
                </p>
              </div>

              {/* Suspension Date */}
              {suspensionInfo.suspendedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Deactivated on: {new Date(suspensionInfo.suspendedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}

              {/* Contact Support */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  <span className="font-medium">Need help?</span> Please contact the administrator for assistance:
                </p>
                <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {suspensionInfo.adminContact?.name || 'System Administrator'}
                  </p>
                  <a 
                    href={`mailto:${suspensionInfo.adminContact?.email || 'support@healthconnect.com'}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {suspensionInfo.adminContact?.email || 'support@healthconnect.com'}
                  </a>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  You can appeal this deactivation or request more information by contacting the administrator above.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => setSuspensionInfo(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
