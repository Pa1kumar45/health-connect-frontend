/**
 * AdminProfile Component
 * 
 * Profile management page for admin users.
 * Allows admins to view and update their profile information.
 * 
 * Features:
 * - Display admin information
 * - Edit name and email
 * - Change password functionality
 * - Role display (admin/super_admin)
 * - Form validation
 * - Success/error notifications
 * - Dark mode support
 * 
 * @component
 * @example
 * return (
 *   <AdminProfile />
 * )
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Admin } from '../types/index';
import { useApp } from '../context/AppContext';

/**
 * Form data interface for admin profile
 */
interface AdminFormData {
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

const AdminProfile = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    role: 'admin'
  });

  // Initialize form with current admin data
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
      const adminUser = currentUser as Admin;
      setFormData({
        name: adminUser.name || '',
        email: adminUser.email || '',
        role: adminUser.role
      });
    }
  }, [currentUser]);

  /**
   * Handle form input changes
   * 
   * @param {React.ChangeEvent} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle profile form submission
   * 
   * Updates admin profile with new name and email.
   * Currently updates local state only (API endpoint to be implemented).
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // For now, we'll just update the local state
      // In a real application, you would call an API endpoint here
      const updatedAdmin: Admin = {
        ...(currentUser as Admin),
        name: formData.name,
        email: formData.email
      };

      setCurrentUser(updatedAdmin);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          Please login to access your profile
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-400 text-red-700 shadow-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-400 text-green-700 shadow-sm" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-100 dark:border-purple-900">
                {formData.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formData.name}
                </h1>
                <p className="text-lg text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-2">
                  <Shield size={20} />
                  {formData.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={18} className="text-purple-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={18} className="text-purple-500" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Shield size={18} className="text-purple-500" /> Role
                  </label>
                  <input
                    type="text"
                    value={formData.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <LoadingSpinner /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="mt-8">
        <ChangePasswordForm 
          onSuccess={async () => {
            setSuccess('Password changed successfully! Redirecting to login...');
            // Logout and redirect to login page
            setTimeout(async () => {
              await logout();
              navigate('/login');
            }, 2000);
          }}
        />
      </div>
    </div>
  );
};

export default AdminProfile;
