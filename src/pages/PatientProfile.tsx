/**
 * PatientProfile Component
 * 
 * Complete profile management page for patients.
 * Allows patients to update their personal and medical information.
 * 
 * Features:
 * - Edit personal information (name, email, contact)
 * - Update medical details (DOB, gender, blood group, allergies)
 * - Manage emergency contacts (add/remove multiple)
 * - Upload/update profile avatar
 * - Age auto-calculation from DOB
 * - 18+ age validation
 * - Change password
 * - Form validation
 * - Image preview
 * - Dark mode support
 * 
 * Emergency Contacts:
 * - Multiple emergency contacts support
 * - Name, relationship, and phone number fields
 * - Add/remove functionality
 * 
 * @component
 * @example
 * return (
 *   <PatientProfile />
 * )
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Phone, Droplet, AlertCircle, Plus, Trash2, Image, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Patient, EmergencyContact } from '../types/index.ts';
import { apiService } from '../services/api.service';
import { useApp } from '../context/AppContext';
import { uploadService } from '../services/upload.service';

/**
 * Form data interface for patient profile
 */
interface PatientFormData {
  name: string;
  email: string;
  avatar: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  role: string;
  bloodGroup: string;
  allergies: string;
  contactNumber: string;
  emergencyContact: EmergencyContact[];
}

/**
 * Calculate age from date of birth
 * 
 * Computes current age based on birth date,
 * accounting for month and day differences.
 * 
 * @param {string} dateOfBirth - Date of birth in ISO format
 * @returns {number} Calculated age in years
 */
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get minimum date for 18+ validation (18 years ago from today)
 * 
 * Calculates the maximum birth date that allows user to be 18 years old.
 * Used for form validation to ensure adults-only registration.
 * 
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getMinDateFor18Plus = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
};

const PatientProfile = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>({
    name: '',
    email: '',
    avatar: '',
    dateOfBirth: '',
    role: 'patient',
    gender: '',
    bloodGroup: '',
    allergies: '',
    contactNumber: '',
    emergencyContact: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Fetch and initialize patient profile data
   * 
   * Loads current patient's profile and initializes form with existing data.
   * Only accessible to users with 'patient' role.
   */
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Only allow patients to access this page
        if (currentUser?.role === 'doctor' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
          return;
        }

        if (currentUser?.role === 'patient') {
          const patientUser = currentUser as Patient;
          const initialFormData: PatientFormData = {
            name: patientUser.name || '',
            email: patientUser.email || '',
            avatar: patientUser.avatar || '',
            dateOfBirth: patientUser.dateOfBirth || '',
            role: patientUser.role || 'patient',
            gender: patientUser.gender || '',
            bloodGroup: patientUser.bloodGroup || '',
            allergies: patientUser.allergies || '',
            contactNumber: patientUser.contactNumber || '',
            emergencyContact: patientUser.emergencyContact || []
          };
          
          setFormData(initialFormData);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;

    // For contact number, only allow digits and limit to 10 characters
    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setFormData(prev => ({ ...prev!, [name]: digits }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    if (!formData) return;

    const updatedContacts = [...formData.emergencyContact];

    // For emergency contact phone, only allow digits and limit to 10 characters
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        updatedContacts[index] = { ...updatedContacts[index], [field]: digits };
      } else {
        return;
      }
    } else {
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    }

    setFormData(prev => ({
      ...prev!,
      emergencyContact: updatedContacts
    }));
  };

  const addEmergencyContact = () => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      emergencyContact: [
        ...prev!.emergencyContact,
        { name: '', relationship: '', phone: '' }
      ]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      emergencyContact: prev!.emergencyContact.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validate date of birth and age
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        setError('You must be at least 18 years old to use this platform');
        return;
      }
    }

    // Validate contact number is exactly 10 digits
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }

    // Validate emergency contact phone numbers are exactly 10 digits
    for (let i = 0; i < formData.emergencyContact.length; i++) {
      const phone = formData.emergencyContact[i].phone;
      if (phone && phone.length !== 10) {
        setError(`Emergency contact ${i + 1} phone number must be exactly 10 digits`);
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a new object with all the form data
      const submitData = {
        ...currentUser,
        ...formData,
        emergencyContact: formData.emergencyContact
      };

      const UpdatedData = await apiService.updatePatientProfile(submitData as Patient);
      const updatedData=UpdatedData;

      // Update both currentUser and formData with the complete data
      setCurrentUser(UpdatedData);

      // Create a new form data object with all required fields
      const newFormData: PatientFormData = {
        name: updatedData.name || '',
        email: updatedData.email || '',
        avatar: updatedData.avatar || '',
        dateOfBirth: updatedData.dateOfBirth || '',
        role: updatedData.role || 'patient',
        gender: updatedData.gender || '',
        bloodGroup: updatedData.bloodGroup || '',
        allergies: updatedData.allergies || '',
        contactNumber: updatedData.contactNumber || '',
        emergencyContact: formData.emergencyContact
      };
      
      setFormData(newFormData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      setIsUploading(true);
      const url = await uploadService.uploadAvatar(file);
      setFormData(prev => ({ ...prev!, avatar: url }));
      setSuccess('Profile picture uploaded. Don\'t forget to save changes.');
    } catch (err: unknown) {
      console.error('Avatar upload failed:', err);
      setUploadError('Failed to upload image. Please try a different file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    if (!formData) return;
    setUploadError(null);
    setFormData(prev => ({ ...prev!, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccess('Profile picture removed. Don\'t forget to save changes.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser && !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          Please login to access your profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 shadow-md animate-fade-in" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border-l-4 border-green-500 text-green-700 shadow-md animate-fade-in" role="alert">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
          {/* Gradient Header Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-800"></div>
          </div>
          
          <div className="px-8 pb-8">
            {/* Profile Avatar and Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 relative z-10">
              <div className="relative group">
                {formData?.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-gray-800 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    {formData?.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formData?.name || 'Patient Name'}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-lg text-gray-600 dark:text-gray-300">
                  <div className="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    Patient Profile
                  </div>
                  {formData?.dateOfBirth && (
                    <div className="px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                      Age: {calculateAge(formData.dateOfBirth)} years
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Droplet size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Blood Group</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formData?.bloodGroup || 'Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Gender</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                      {formData?.gender || 'Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-xl border border-pink-200 dark:border-pink-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Contact</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formData?.contactNumber || 'Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Allergies</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {formData?.allergies || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Update your profile and medical information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <User size={20} className="text-blue-500" />
                  Basic Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData?.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData?.email}
                        onChange={handleChange}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 cursor-not-allowed"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                      {formData?.dateOfBirth && (
                        <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                          ({calculateAge(formData.dateOfBirth)} years old)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData?.dateOfBirth}
                        onChange={handleChange}
                        max={getMinDateFor18Plus()}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                    </div>
                    {formData?.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        You must be at least 18 years old
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <select
                        name="gender"
                        value={formData?.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-no-repeat bg-right"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Droplet size={20} className="text-blue-500" />
                  Medical Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Blood Group
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Droplet size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <select
                        name="bloodGroup"
                        value={formData?.bloodGroup}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData?.contactNumber}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter 10-digit mobile number</p>
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Allergies (if any)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                        <AlertCircle size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="allergies"
                        value={formData?.allergies}
                        onChange={handleChange}
                        placeholder="e.g., Peanuts, Penicillin, Pollen"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Picture Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Image size={20} className="text-blue-500" />
                  Profile Picture
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="relative">
                    {formData?.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        <Image size={32} className="text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <input
                      id="patient-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label
                        htmlFor="patient-avatar"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Upload size={18} />
                        Upload New Photo
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={!formData?.avatar || isUploading}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                      >
                        <Trash2 size={18} />
                        Remove Photo
                      </button>
                    </div>
                    {isUploading && (
                      <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <LoadingSpinner />
                        Uploading image...
                      </p>
                    )}
                    {uploadError && (
                      <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {uploadError}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone size={20} className="text-blue-500" />
                    Emergency Contacts
                  </h3>
                  <button
                    type="button"
                    onClick={addEmergencyContact}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus size={16} /> Add Contact
                  </button>
                </div>

                {formData?.emergencyContact.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Phone size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No emergency contacts added yet</p>
                    <button
                      type="button"
                      onClick={addEmergencyContact}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} /> Add Your First Contact
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData?.emergencyContact.map((contact, index) => (
                      <div 
                        key={index} 
                        className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Contact {index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeEmergencyContact(index)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="group">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                              placeholder="Contact name"
                            />
                          </div>
                          
                          <div className="group">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={contact.relationship}
                              onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                              placeholder="e.g., Father, Mother"
                            />
                          </div>
                          
                          <div className="group">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200"
                              placeholder="10-digit number"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 py-4 px-6 border-2 border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
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
    </div>
  );
};

export default PatientProfile;
