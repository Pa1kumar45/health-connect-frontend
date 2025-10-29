/**
 * api.service.ts - Core API service module
 * 
 * This service module provides foundational API functionality for the Health-Connect application.
 * It handles:
 * - API URL configuration from environment variables
 * - Patient profile management operations
 * - Shared constants and utilities for other services
 * 
 * Features:
 * - Environment-based API URL configuration
 * - HTTP cookie-based authentication
 * - Error handling with descriptive messages
 * - TypeScript type safety for API responses
 * 
 * Architecture:
 * - Uses native fetch API for HTTP requests
 * - Follows RESTful API conventions
 * - Includes credentials for authenticated requests
 * - Centralized error handling pattern
 * 
 * Used by: Other service modules, patient profile components
 * Dependencies: Patient type definitions, environment variables
 */

// Import type definitions for Patient entity
import { Patient } from '../types/index.ts';

// Environment configuration - backend URL from Vite environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Exported API base URL for use by other service modules
export const API_URL = `${BACKEND_URL}/api`;
/**
 * apiService - Core API service object containing shared API functions
 * 
 * This service object provides common API operations that are used across
 * the application. Currently focuses on patient profile management but
 * can be extended for other shared functionality.
 * 
 * Service Architecture:
 * - Uses fetch API with credentials: 'include' for cookie-based auth
 * - Standardized error handling across all methods
 * - TypeScript integration for type safety
 * - RESTful endpoint conventions
 */
export const apiService = {
  /**
   * updatePatientProfile - Updates patient profile information
   * 
   * Sends partial patient data to update existing patient profile.
   * Uses PUT method for full resource replacement.
   * 
   * API Details:
   * - Endpoint: PUT /api/patients/profile
   * - Authentication: Cookie-based (credentials: 'include')
   * - Content-Type: application/json
   * 
   * @param {Partial<Patient>} userData - Partial patient object with fields to update
   * @returns {Promise<Patient>} Updated patient object from server
   * 
   * @throws {Error} If update fails or server returns error
   * 
   * Example:
   * ```typescript
   * const updatedPatient = await apiService.updatePatientProfile({
   *   name: 'John Doe',
   *   phone: '+1234567890',
   *   address: '123 Main St'
   * });
   * ```
   */
  async updatePatientProfile(userData: Partial<Patient>): Promise<Patient> {
    const response = await fetch(`${API_URL}/patients/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials:"include",    // Include auth cookies
      body: JSON.stringify(userData)
    });

    // Error handling - check response status
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    // Extract and return patient data from response
    const return_data = await response.json();
    return return_data.data;
  },

  // Note: Commented code preserved for potential future implementation
  // getCurrentUser method template available for implementation
}; 



