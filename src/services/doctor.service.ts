/**
 * doctor.service.ts - Doctor management service module
 * 
 * This service module handles all doctor-related API operations in the Health-Connect application.
 * It provides comprehensive doctor management including:
 * - Retrieving all doctors for browsing/selection
 * - Getting individual doctor profiles and details
 * - Updating doctor profile information
 * - Doctor directory and search functionality
 * 
 * Features:
 * - Public doctor directory access
 * - Individual doctor profile retrieval
 * - Authenticated doctor profile updates
 * - Cookie-based authentication for protected operations
 * - Error handling with descriptive messages
 * 
 * Use Cases:
 * - Patient browsing available doctors
 * - Displaying doctor profiles for appointment booking
 * - Doctor profile management and updates
 * - Doctor directory search and filtering
 * 
 * API Endpoints:
 * - GET /doctors - Retrieve all doctors
 * - GET /doctors/:id - Get specific doctor by ID
 * - PUT /doctors/profile - Update doctor profile (authenticated)
 * 
 * Used by: Doctor listing components, profile pages, appointment booking
 * Dependencies: Doctor type definitions, environment configuration
 */

import { Doctor } from '../types/index.ts';  // Type definition for Doctor entity

// Environment configuration - backend URL from Vite environment variables
const API_URL = import.meta.env.VITE_BACKEND_URL;
/**
 * doctorService - Comprehensive doctor management service
 * 
 * This service provides all doctor-related operations including directory browsing,
 * profile retrieval, and profile management. Supports both public access for
 * doctor discovery and authenticated access for profile updates.
 */
export const doctorService = {
  /**
   * getAllDoctors - Retrieves complete list of all doctors
   * 
   * Fetches the complete directory of all registered doctors in the system.
   * Used for doctor browsing, selection, and appointment booking interfaces.
   * Includes credentials for potential access control.
   * 
   * API Details:
   * - Endpoint: GET /api/doctors
   * - Authentication: Credentials included (may be public or require login)
   * - Returns: Array of doctor objects with profile information
   * 
   * @returns {Promise<Doctor[]>} Array of all doctor profiles
   * @throws {Error} If retrieval fails or access denied
   * 
   * Example:
   * ```typescript
   * const doctors = await doctorService.getAllDoctors();
   * // Display doctors in a list for patient selection
   * doctors.forEach(doctor => {
   *   console.log(`${doctor.name} - ${doctor.specialization}`);
   * });
   * ```
   */
  async getAllDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${API_URL}/api/doctors`, {
      credentials: 'include'    // Include authentication cookies
    });

    // Error handling for retrieval failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch doctors');
    }

    return response.json();
  },

  /**
   * getDoctorById - Retrieves specific doctor profile by ID
   * 
   * Fetches detailed information for a specific doctor using their ID.
   * Used for displaying doctor profiles, appointment booking details,
   * and detailed doctor information pages.
   * 
   * API Details:
   * - Endpoint: GET /api/doctors/:id
   * - Authentication: Credentials included
   * - Returns: Single doctor object with complete profile
   * 
   * @param {string} id - Unique identifier of the doctor to retrieve
   * @returns {Promise<Doctor>} Complete doctor profile object
   * @throws {Error} If doctor not found or retrieval fails
   * 
   * Example:
   * ```typescript
   * const doctor = await doctorService.getDoctorById('doc123');
   * console.log(`Dr. ${doctor.name}`);
   * console.log(`Specialization: ${doctor.specialization}`);
   * console.log(`Experience: ${doctor.experience} years`);
   * ```
   */
  async getDoctorById(id: string): Promise<Doctor> {
    const response = await fetch(`${API_URL}/api/doctors/${id}`, {
      credentials: 'include'    // Include authentication cookies
    });

    // Error handling for doctor not found or other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch doctor');
    }

    return response.json();
  },

  /**
   * updateDoctorProfile - Updates authenticated doctor's profile information
   * 
   * Allows doctors to update their own profile information including
   * specialization, experience, bio, contact details, and other profile fields.
   * Requires doctor authentication.
   * 
   * API Details:
   * - Endpoint: PUT /api/doctors/profile
   * - Authentication: Required (doctor must be authenticated)
   * - Content-Type: application/json
   * - Credentials: Included for authentication
   * 
   * @param {Partial<Doctor>} userData - Partial doctor object with fields to update
   * @returns {Promise<Doctor>} Updated doctor profile object
   * @throws {Error} If update fails or user not authenticated as doctor
   * 
   * Example:
   * ```typescript
   * const updatedProfile = await doctorService.updateDoctorProfile({
   *   specialization: 'Cardiology',
   *   experience: 10,
   *   bio: 'Experienced cardiologist with focus on preventive care',
   *   phone: '+1234567890',
   *   availability: {
   *     monday: '9:00-17:00',
   *     tuesday: '9:00-17:00'
   *   }
   * });
   * ```
   */
  async updateDoctorProfile(userData: Partial<Doctor>): Promise<Doctor> {
    const response = await fetch(`${API_URL}/api/doctors/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',    // Authentication required
      body: JSON.stringify(userData)
    });

    // Error handling for profile update failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result = await response.json();
    return result.success ? result.data : result;
  },

  // Note: Service can be extended with additional doctor-related operations:
  // - searchDoctors(query, filters)
  // - getDoctorAvailability(doctorId, date)
  // - getDoctorReviews(doctorId)
  // - uploadDoctorCertificates(doctorId, files)
}; 
