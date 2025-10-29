/**
 * SignUp Component
 * 
 * User registration page with two-step verification process.
 * Supports both patient and doctor registration with role-specific fields.
 * 
 * Features:
 * - Role-based form fields (patient/doctor)
 * - Email verification via OTP
 * - Two-step registration flow
 * - Conditional field rendering
 * - Dark mode support
 * 
 * Registration Flow:
 * 1. User fills registration form
 * 2. Backend sends OTP to email
 * 3. User verifies OTP
 * 4. Account is activated and user is logged in
 * 
 * @component
 * @example
 * return (
 *   <SignUp />
 * )
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import OTPVerification from '../components/OTPVerification';
import { SignUpFormData } from '../types/index.ts';
import { authService } from '../services/auth.service';


const SignUp = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    qualification: '',
    experience: 0
  });

  /**
   * Handle signup form submission
   * 
   * Step 1: Register user and send OTP for email verification.
   * Removes doctor-specific fields if user registers as patient.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      // Remove doctor-specific fields if registering as a patient
      const registrationData = formData.role === 'patient'
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          }
        : formData;

      console.log('Signup attempt:', registrationData);

      // Step 1: Register the user - backend will send OTP to email
      await authService.register(registrationData);

      // Step 2: Show OTP modal for email verification
      setShowOTPModal(true);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle OTP verification
   * 
   * Step 2: Verify OTP and complete signup.
   * Sets user in context and navigates based on role:
   * - Doctors → profile page (to complete profile)
   * - Patients → home page
   * 
   * @param {string} otp - 6-digit OTP code
   * @throws {Error} Throws error if OTP verification fails
   */
  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await authService.verifyOTP({
        email: formData.email,
        otp,
        role: formData.role,
        purpose: 'registration'
      });

      console.log('OTP verified, signup successful:', response);

      // Set current user in context
      if (response.data) {
        setCurrentUser(response.data);
      }

      // Close OTP modal
      setShowOTPModal(false);

      // Navigate based on role
      if (formData.role === 'doctor') {
        navigate('/profile'); // Doctors need to complete their profile
      } else {
        navigate('/'); // Patients go to doctor list
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw error; // Let OTPVerification component handle the error display
    }
  };

  /**
   * Handle OTP resend
   * 
   * Sends a new OTP to user's email when previous one expires
   * or user didn't receive it.
   * 
   * @throws {Error} Throws error if OTP resend fails
   */
  const handleResendOTP = async () => {
    try {
      await authService.sendOTP({
        email: formData.email,
        role: formData.role,
        purpose: 'registration'
      });
      console.log('OTP resent successfully');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw error; // Let OTPVerification component handle the error display
    }
  };

  /**
   * Handle form input changes
   * 
   * Updates form data state. Converts experience to number for numeric input.
   * 
   * @param {React.ChangeEvent} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) : value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
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
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {formData.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialization" className="sr-only">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="qualification" className="sr-only">
                    Qualification
                  </label>
                  <input
                    id="qualification"
                    name="qualification"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="sr-only">
                    Experience (years)
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    required
                    min="0"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Years of Experience"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner /> : 'Create Account'}
            </button>
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
        purpose="registration"
      />
    </div>
  );
};

export default SignUp;
