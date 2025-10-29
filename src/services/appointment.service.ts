/**
 * appointment.service.ts - Appointment management service module
 * 
 * This service module handles all appointment-related API operations in the Health-Connect application.
 * It provides comprehensive appointment management including:
 * - Creating new appointments
 * - Retrieving appointments by user type (doctor/patient)
 * - Updating appointment details
 * - Managing appointment status changes
 * 
 * Features:
 * - Role-based appointment retrieval (doctor vs patient views)
 * - Appointment status management (pending, confirmed, completed, cancelled)
 * - Full CRUD operations for appointment lifecycle
 * - Cookie-based authentication for all requests
 * 
 * API Endpoints:
 * - POST /appointments/ - Create new appointment
 * - GET /appointments/doctor/ - Get doctor's appointments
 * - GET /appointments/patient/ - Get patient's appointments
 * - PUT /appointments/:id - Update appointment details
 * - PUT /appointments/:id (status) - Update appointment status
 * 
 * Used by: Appointment booking components, doctor dashboard, patient appointments
 * Dependencies: Appointment type definitions, api.service for base URL
 */

import { Appointment } from '../types/types';  // Type definition for Appointment entity
import { API_URL } from './api.service';        // Base API URL from core service

/**
 * appointmentService - Comprehensive appointment management service
 * 
 * This service provides all appointment-related operations including creation,
 * retrieval, updates, and status management. Each method handles authentication
 * via cookies and provides proper error handling.
 */
export const appointmentService = {
  /**
   * getAvailableSlots - Get available time slots for a doctor on a specific date
   * 
   * Fetches available 1-hour slots (9 AM - 9 PM) for a doctor.
   * Filters based on doctor's schedule and existing bookings.
   * 
   * @param {string} doctorId - Doctor's unique identifier
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<{date: string, dayOfWeek: string, availableSlots: Slot[]}>}
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<{
    date: string;
    dayOfWeek: string;
    availableSlots: Array<{slotNumber: number, startTime: string, endTime: string}>;
  }> {
    const response = await fetch(`${API_URL}/appointments/available-slots/${doctorId}?date=${date}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch available slots');
    }

    return response.json();
  },

  /**
   * addAppointment - Creates a new appointment in the system
   * 
   * Submits appointment data to create a new appointment booking.
   * Typically called when patients book appointments with doctors.
   * 
   * API Details:
   * - Endpoint: POST /api/appointments/
   * - Authentication: Cookie-based (credentials: 'include')
   * - Content-Type: application/json
   * 
   * @param {Partial<Appointment>} appointmentData - Appointment details to create
   * @returns {Promise<Appointment>} Created appointment object with assigned ID
   * 
   * @throws {Error} If appointment creation fails
   * 
   * Example:
   * ```typescript
   * const newAppointment = await appointmentService.addAppointment({
   *   doctorId: 'doctor123',
   *   date: '2024-01-15',
   *   time: '10:00',
   *   type: 'consultation',
   *   notes: 'Regular checkup'
   * });
   * ```
   */
  async addAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    console.log("appointment data", appointmentData);
    const response = await fetch(`${API_URL}/appointments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',    // Include authentication cookies
      body: JSON.stringify(appointmentData)
    });

    console.log("handle submit response", response);

    // Error handling
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add appointment');
    }

    return response.json();
  },

  /**
   * getDoctorAppointments - Retrieves all appointments for the authenticated doctor
   * 
   * Fetches appointments where the current user is the doctor.
   * Used in doctor dashboard to show scheduled appointments.
   * 
   * API Details:
   * - Endpoint: GET /api/appointments/doctor/
   * - Authentication: Cookie-based (credentials: 'include')
   * - Returns: Array of appointments for the authenticated doctor
   * 
   * @returns {Promise<Appointment[]>} Array of doctor's appointments
   * @throws {Error} If retrieval fails or user not authenticated as doctor
   */
  async getDoctorAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/appointments/doctor/`, {
      credentials: 'include'     // Authentication required
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch doctor appointments');
    }

    return response.json();
  },

  /**
   * getPatientAppointments - Retrieves all appointments for the authenticated patient
   * 
   * Fetches appointments where the current user is the patient.
   * Used in patient dashboard to show booked appointments.
   * 
   * API Details:
   * - Endpoint: GET /api/appointments/patient/
   * - Authentication: Cookie-based (credentials: 'include')
   * - Returns: Array of appointments for the authenticated patient
   * 
   * @returns {Promise<Appointment[]>} Array of patient's appointments
   * @throws {Error} If retrieval fails or user not authenticated as patient
   */
  async getPatientAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/appointments/patient/`, {
      credentials: 'include'     // Authentication required
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch patient appointments');
    }
    console.log("patient appointments", response);
    return response.json();
  },

  /**
   * updateAppointment - Updates appointment details
   * 
   * Updates specific fields of an existing appointment.
   * Can be used to modify date, time, type, notes, or other details.
   * 
   * API Details:
   * - Endpoint: PUT /api/appointments/:id
   * - Authentication: Cookie-based (credentials: 'include')
   * - Content-Type: application/json
   * 
   * @param {string} appointmentId - ID of appointment to update
   * @param {Partial<Appointment>} appointmentData - Fields to update
   * @returns {Promise<Appointment>} Updated appointment object
   * 
   * Example:
   * ```typescript
   * const updated = await appointmentService.updateAppointment('appt123', {
   *   date: '2024-01-16',
   *   notes: 'Rescheduled due to emergency'
   * });
   * ```
   */
  async updateAppointment(appointmentId: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(appointmentData)
    });

    return response.json();
  },

  /**
   * updateAppointmentStatus - Updates only the status of an appointment
   * 
   * Specialized function for changing appointment status (pending, confirmed, 
   * completed, cancelled). Used for appointment workflow management.
   * 
   * API Details:
   * - Endpoint: PUT /api/appointments/:id
   * - Authentication: Cookie-based (credentials: 'include')
   * - Content-Type: application/json
   * - Body: { status: newStatus }
   * 
   * @param {string} appointmentId - ID of appointment to update
   * @param {string} status - New status value ('pending', 'confirmed', 'completed', 'cancelled')
   * @returns {Promise<Appointment>} Updated appointment with new status
   * 
   * @throws {Error} If status update fails
   * 
   * Example:
   * ```typescript
   * const confirmed = await appointmentService.updateAppointmentStatus('appt123', 'confirmed');
   * ```
   */
  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify({ status })  // Send only status field
    });

    // Error handling for status update
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update appointment status');
    }

    return response.json();
  },

  /**
   * getTodayUpcomingCount - Get count of upcoming appointments for today
   * 
   * Fetches the count of scheduled appointments for the current day
   * that haven't started yet. Used in doctor dashboard.
   * 
   * API Details:
   * - Endpoint: GET /api/appointments/doctor/today-count
   * - Authentication: Cookie-based (credentials: 'include')
   * 
   * @returns {Promise<{count: number, date: string, currentTime: string}>}
   */
  async getTodayUpcomingCount(): Promise<{count: number, date: string, currentTime: string}> {
    const response = await fetch(`${API_URL}/appointments/doctor/today-count`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch upcoming count');
    }

    return response.json();
  },

  /**
   * getPendingCount - Get count of pending appointment requests
   * 
   * Fetches the count of pending appointments that require doctor approval.
   * Used in doctor dashboard to show notification badge.
   * 
   * API Details:
   * - Endpoint: GET /api/appointments/doctor/pending-count
   * - Authentication: Cookie-based (credentials: 'include')
   * 
   * @returns {Promise<{count: number}>}
   */
  async getPendingCount(): Promise<{count: number}> {
    const response = await fetch(`${API_URL}/appointments/doctor/pending-count`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pending count');
    }

    return response.json();
  }
};
