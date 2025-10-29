/**
 * DoctorProfile Component
 * 
 * Complete profile management page for doctors.
 * Allows doctors to update their professional information and availability schedule.
 * 
 * Features:
 * - Edit personal information (name, email, contact)
 * - Update professional details (specialization, qualification, experience)
 * - Manage weekly schedule with time slots
 * - Upload/update profile avatar
 * - Change password
 * - 12 fixed hourly time slots (9 AM - 9 PM)
 * - Day-wise availability toggle
 * - Form validation
 * - Image preview
 * - Dark mode support
 * 
 * Schedule Management:
 * - 7-day weekly schedule
 * - 12 time slots per day (1-hour intervals)
 * - Toggle individual slots on/off
 * - Persistent schedule storage
 * 
 * @component
 * @example
 * return (
 *   <DoctorProfile />
 * )
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Clock, GraduationCap, Briefcase, Phone, Image, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ChangePasswordForm from '../components/ChangePasswordForm';
import TimeBlockSelector from '../components/TimeBlockSelector';
import { Schedule, Doctor } from '../types/index.ts';

import { useApp } from '../context/AppContext';

import { doctorService } from '../services/doctor.service';
import { uploadService } from '../services/upload.service';
import { FIXED_TIME_SLOTS } from '../utils/timeSlots';

/**
 * Form data interface for doctor profile
 */
interface DoctorFormData {
  name: string;
  email: string;
  avatar: string;
  specialization: string;
  experience: number;
  qualification: string;
  about: string;
  contactNumber: string;
  schedule: Schedule[];
}

const DoctorProfile = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorFormData | null>({
    name: '',
    email: '',
    avatar: '',
    specialization: '',
    experience: 0,
    qualification: '',
    about: '',
    contactNumber: '',
    schedule: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Initialize schedule for all 7 days of the week
   * 
   * Creates schedule structure with existing data or empty slots.
   * Ensures all slots have proper isAvailable flag.
   * 
   * @param {Schedule[]} existingSchedule - Existing schedule data
   * @returns {Schedule[]} Initialized schedule for all days
   */
  const initializeSchedule = (existingSchedule: Schedule[]) => {
    const days: Schedule['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
      const existingDay = existingSchedule.find(s => s.day === day);
      if (existingDay) {
        // Keep existing schedule but ensure all slots have proper structure
        return {
          day,
          slots: existingDay.slots.map(slot => ({
            slotNumber: slot.slotNumber,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable ?? true
          }))
        };
      }

      // Initialize empty schedule for this day
      return { day, slots: [] };
    });
  };

  /**
   * Fetch and initialize doctor profile data
   * 
   * Loads current doctor's profile and initializes form with existing data.
   * Only accessible to users with 'doctor' role.
   */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only allow doctors to access this page
        if (currentUser?.role === 'patient' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
          return;
        }

        // Type guard to ensure currentUser is a Doctor
        if (currentUser?.role === 'doctor') {
          const doctorUser = currentUser as Doctor;
          const initialFormData: DoctorFormData = {
            name: doctorUser.name || '',
            email: doctorUser.email || '',
            avatar: doctorUser.avatar || '',
            specialization: doctorUser.specialization || '',
            experience: doctorUser.experience || 0,
            qualification: doctorUser.qualification || '',
            about: doctorUser.about || '',
            contactNumber: doctorUser.contactNumber || '',
            schedule: initializeSchedule(doctorUser.schedule || []),
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

    fetchUserProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      [name]: name === 'experience' ? Number(value) : value
    }));
  };

  const toggleSlotAvailability = (day: Schedule['day'], slotNumber: number) => {
    if (!formData) return;
    
    const updatedSchedule = formData.schedule.map(scheduleDay => {
      if (scheduleDay.day === day) {
        // Check if slot already exists
        const existingSlotIndex = scheduleDay.slots.findIndex(s => s.slotNumber === slotNumber);
        
        if (existingSlotIndex >= 0) {
          // Toggle existing slot
          const updatedSlots = [...scheduleDay.slots];
          updatedSlots[existingSlotIndex] = {
            ...updatedSlots[existingSlotIndex],
            isAvailable: !updatedSlots[existingSlotIndex].isAvailable
          };
          return { ...scheduleDay, slots: updatedSlots };
        }

        // Add new slot from fixed slots
        const fixedSlot = FIXED_TIME_SLOTS.find(s => s.slotNumber === slotNumber);
        if (fixedSlot) {
          return {
            ...scheduleDay,
            slots: [...scheduleDay.slots, { ...fixedSlot, isAvailable: true }].sort((a, b) => a.slotNumber - b.slotNumber)
          };
        }
      }
      return scheduleDay;
    });

    setFormData({ ...formData, schedule: updatedSchedule });
  };

  /**
   * Get selected slot numbers for a specific day
   */
  const getSelectedSlotsForDay = (day: Schedule['day']): number[] => {
    if (!formData) return [];
    const scheduleDay = formData.schedule.find(s => s.day === day);
    if (!scheduleDay) return [];
    return scheduleDay.slots
      .filter(slot => slot.isAvailable)
      .map(slot => slot.slotNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validate contact number is exactly 10 digits
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Filter out slots that are not available (unchecked)
      const cleanedSchedule = formData.schedule.map(day => ({
        ...day,
        slots: day.slots.filter(slot => slot.isAvailable)
      })).filter(day => day.slots.length > 0);

      // Create a new object with all the form data
      const submitData = {
        name: formData.name,
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        about: formData.about,
        contactNumber: formData.contactNumber,
        avatar: formData.avatar,
        schedule: cleanedSchedule
      };

      const response = await doctorService.updateDoctorProfile(submitData);

      // Update both currentUser and formData with the complete data
      setCurrentUser({...currentUser,...response});
      console.log("Profile update response:", response);

      // Update form data with response
      const newFormData: DoctorFormData = {
        name: response.name || '',
        email: response.email || '',
        avatar: response.avatar || '',
        specialization: response.specialization || '',
        experience: response.experience || 0,
        qualification: response.qualification || '',
        about: response.about || '',
        contactNumber: response.contactNumber || '',
        schedule: initializeSchedule(response.schedule || [])
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

  if (isLoading && !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser || !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          Please login to access your profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            Doctor Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your professional information and availability
          </p>
        </div>

        {error && (
          <div className="mb-6 p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 shadow-xl" role="alert">
            <span className="block sm:inline font-semibold">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 shadow-xl" role="alert">
            <span className="block sm:inline font-semibold">{success}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-2xl">
              {formData?.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-gray-700 shadow-xl">
                  {formData?.name?.charAt(0).toUpperCase() || 'D'}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Dr. {formData?.name}
                </h2>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formData?.specialization}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData?.experience} years of experience
                </p>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={18} className="text-blue-500" /> Email
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

                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-500" /> Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" /> Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500" /> Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={18} className="text-blue-500" /> Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Image size={18} className="text-blue-500" /> Profile Picture
                  </label>
                  <input
                    id="doctor-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="doctor-avatar"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Upload size={16} />
                      Upload image
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={!formData.avatar || isUploading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Remove image
                    </button>
                  </div>
                  {isUploading && (
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Uploading image...</p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  )}
                  
                </div>
              </div>
            </div>

            <div>
              <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User size={18} className="text-blue-500" /> About Yourself
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
              />
            </div>

            {/* NEW 15-MIN SLOT SCHEDULE UI */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-2xl">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock size={24} className="text-blue-600" /> Weekly Schedule
                </h2>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  15-Minute Slots
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  ℹ️ Each slot is 15 minutes. Select which slots you want to make available for patient booking.
                  Slots are grouped into 2-hour time blocks for easier management.
                </p>
              </div>

              {formData.schedule.map((scheduleDay) => (
                <div key={scheduleDay.day} className="p-8 border-2 rounded-2xl dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 shadow-lg">
                  <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar size={24} className="text-blue-600" />
                    {scheduleDay.day}
                  </h3>
                  <TimeBlockSelector
                    selectedSlots={getSelectedSlotsForDay(scheduleDay.day)}
                    onSlotToggle={(slotNumber) => toggleSlotAvailability(scheduleDay.day, slotNumber)}
                    mode="select"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-6 border-2 border-transparent rounded-2xl shadow-lg text-lg font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
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
    </div>
  );
};

export default DoctorProfile;
