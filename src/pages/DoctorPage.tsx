/**
 * DoctorPage Component
 * 
 * Individual doctor profile and appointment booking page.
 * Allows patients to view doctor details and book appointments.
 * 
 * Features:
 * - Display doctor profile information
 * - View doctor's schedule and availability
 * - Date selection (today to 7 days ahead)
 * - Real-time slot availability checking
 * - Appointment booking with reason
 * - Avatar display with fallback
 * - Form validation
 * - Success/error notifications
 * - Dark mode support
 * 
 * Booking Flow:
 * 1. Select appointment date
 * 2. View available time slots for that date
 * 3. Select time slot
 * 4. Enter reason for appointment
 * 5. Submit booking request
 * 
 * @component
 * @example
 * return (
 *   <DoctorPage />
 * )
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  Clock, Briefcase, GraduationCap, User, Phone, Calendar, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import TimeBlockSelector from '../components/TimeBlockSelector';
import { doctorService } from '../services/doctor.service';
import { appointmentService } from '../services/appointment.service';
import { Doctor } from '../types/index.ts';
import { getErrorMessage } from '../utils/auth';
import { formatTime12Hour } from '../utils/timeSlots';

import { useApp } from '../context/AppContext';

const DoctorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const {currentUser} = useApp();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{slotNumber: number, startTime: string, endTime: string} | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{slotNumber: number, startTime: string, endTime: string}>>([]);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingSlots, setIsFetchingSlots] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Calculate date range for appointment booking
   * Allows booking from today up to 7 days in advance
   */
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Load doctor data on component mount
  useEffect(() => {
    loadDoctor();
  }, [id]);

  // Fetch available slots when date or doctor changes
  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

  /**
   * Load doctor details by ID
   * 
   * Fetches complete doctor profile from backend.
   */
  const loadDoctor = async () => {
    try {
      setIsLoading(true);
      const doctorData = await doctorService.getDoctorById(id!);
      console.log("Doctor data:", doctorData);
      setDoctor(doctorData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load doctor details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch available time slots for selected date
   * 
   * Retrieves slots that are not already booked.
   * Resets selected slot when date changes.
   */
  const fetchAvailableSlots = async () => {
    if (!doctor || !selectedDate) return;
    
    try {
      setIsFetchingSlots(true);
      setError(null);
      const slotsData = await appointmentService.getAvailableSlots(doctor._id, selectedDate);
      console.log("Available slots:", slotsData);
      setAvailableSlots(slotsData.availableSlots || []);
      setSelectedSlot(null); // Reset selected slot when date changes
    } catch (err: any) {
      console.error('Failed to fetch available slots:', err);
      setAvailableSlots([]);
      const errorMessage = err.response?.data?.message || 'No available slots for this date';
      setError(errorMessage);
    } finally {
      setIsFetchingSlots(false);
    }
  };

  /**
   * Handle appointment booking submission
   * 
   * Validates all required fields (doctor, date, slot, reason)
   * and creates appointment request.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctor || !selectedDate || !selectedSlot || !reason.trim()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const appointmentData = {
        doctorId: doctor._id,
        date: selectedDate,
        slotNumber: selectedSlot.slotNumber,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason.trim(),
        status: 'pending' as const,
        mode: 'video' as const
      };

      console.log("Booking appointment:", appointmentData);
      const response = await appointmentService.addAppointment(appointmentData);
      console.log("Appointment booked:", response);
      
      setSuccess('Appointment booked successfully! Waiting for doctor confirmation.');
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailableSlots([]);
      setReason('');
      
      // Redirect to appointments page after 2 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to book appointment:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !doctor) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!doctor) {
    return <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-400">Doctor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-400 text-red-700 shadow-sm" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-400 text-green-700 shadow-sm flex items-center gap-2" role="alert">
          <CheckCircle size={20} />
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center space-x-6">
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-100 dark:border-blue-900">
                  {doctor.name?.charAt(0).toUpperCase() || 'D'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {doctor.name ? `Dr. ${doctor.name}` : 'Doctor Profile'}
                </h1>
                {doctor.specialization && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 mt-1">
                    {doctor.specialization}
                  </p>
                )}
                {doctor.experience && (
                  <div className="flex items-center mt-2">
                    <Briefcase size={18} className="text-gray-500 dark:text-gray-400" />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {doctor.experience} years of experience
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {doctor.qualification && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <GraduationCap size={20} className="text-blue-500" /> Qualifications
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {doctor.qualification}
                  </p>
                </div>
              )}

              {doctor.about && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-blue-500" /> About
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {doctor.about}
                  </p>
                </div>
              )}

              {doctor.contactNumber && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Phone size={20} className="text-blue-500" /> Contact
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {doctor.contactNumber}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {doctor.schedule && doctor.schedule.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" /> Weekly Schedule
                  </h2>
                  <div className="space-y-3">
                    {doctor.schedule.map((schedule, index) => (
                      schedule.slots && schedule.slots.length > 0 && (
                        <div key={index} className="border-b dark:border-gray-600 pb-3 last:border-b-0">
                          <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                            {schedule.day}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {schedule.slots.map((slot, slotIndex) => (
                              <span
                                key={slotIndex}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                              >
                                {formatTime12Hour(slot.startTime)}-{formatTime12Hour(slot.endTime)}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {schedule.slots.length} slot{schedule.slots.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOOKING FORM - SLOT BASED */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              Book Appointment
            </h2>
            
            {currentUser?.role === 'patient' ? (
              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date (Next 7 Days)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    You can only book appointments within the next 7 days
                  </p>
                </div>

                {/* Available Slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Available 15-Minute Time Slots
                    </label>
                    
                    {isFetchingSlots ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <TimeBlockSelector
                        selectedSlots={selectedSlot ? [selectedSlot.slotNumber] : []}
                        onSlotToggle={(slotNumber) => {
                          const slot = availableSlots.find(s => s.slotNumber === slotNumber);
                          if (slot) {
                            setSelectedSlot(slot);
                          }
                        }}
                        readOnly={false}
                        mode="view"
                        availableSlots={availableSlots.map(s => s.slotNumber)}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Clock size={32} className="mx-auto mb-2" />
                        <p>No available slots for this date</p>
                        <p className="text-sm mt-1">Please try another date</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reason */}
                {selectedSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Appointment
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Please describe your symptoms or reason for visit..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      required
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedSlot || !reason.trim() || isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <LoadingSpinner /> : (
                    <>
                      <Calendar size={18} />
                      Book Appointment
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Please log in as a patient to book an appointment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
