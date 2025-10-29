/**
 * Authentication Utilities Module
 * 
 * Comprehensive utility functions for user authentication, authorization,
 * and session management in the Health-Connect application.
 * 
 * Features:
 * - User authentication status checking
 * - Role-based authorization (admin, super_admin, doctor, patient)
 * - Local storage user data management
 * - Error message extraction from API responses
 * - Session cleanup utilities
 * 
 * User Roles Supported:
 * - super_admin: Full system access
 * - admin: Administrative access
 * - doctor: Medical professional access
 * - patient: Patient user access
 * 
 * Storage Keys:
 * - 'user': Current user data (JSON)
 * - 'token': Authentication token
 * 
 * @module utils/auth
 */

import { Doctor, Patient } from '../types';

/**
 * Extract error message from unknown error types
 * 
 * Handles different error formats from API responses and JavaScript errors.
 * Provides consistent error message extraction.
 * 
 * @param {unknown} error - Error object from API or JavaScript
 * @returns {string} Extracted error message
 * 
 * @example
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   showNotification(message);
 * }
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  const apiError = error as { response?: { data?: { message?: string } }; message?: string };
  return apiError.response?.data?.message || apiError.message || 'An error occurred';
};

/**
 * Get current user from localStorage
 * 
 * Retrieves and parses the current user data from browser localStorage.
 * Returns null if no user is logged in or data is corrupted.
 * 
 * @returns {Doctor|Patient|Admin|null} Current user object or null
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log(`Welcome, ${user.name}!`);
 * }
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * 
 * Determines if a user is currently logged in by checking localStorage.
 * 
 * @returns {boolean} True if user is authenticated, false otherwise
 * 
 * @example
 * if (!isAuthenticated()) {
 *   navigate('/login');
 * }
 */
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return user !== null;
};

/**
 * Check if current user is an admin
 * 
 * Returns true if user has admin or super_admin role.
 * Used for protecting admin-only routes and features.
 * 
 * @returns {boolean} True if user is admin or super_admin
 * 
 * @example
 * if (isAdmin()) {
 *   return <AdminDashboard />;
 * }
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'admin' || user.role === 'super_admin';
};

/**
 * Check if current user is a super admin
 * 
 * Returns true only for super_admin role.
 * Used for protecting super admin-only features.
 * 
 * @returns {boolean} True if user is super_admin
 * 
 * @example
 * if (isSuperAdmin()) {
 *   showSystemSettings();
 * }
 */
export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'super_admin';
};

/**
 * Check if current user is a doctor
 * 
 * Returns true if user has doctor role.
 * Used for protecting doctor-only routes and features.
 * 
 * @returns {boolean} True if user is a doctor
 * 
 * @example
 * if (isDoctor()) {
 *   return <DoctorDashboard />;
 * }
 */
export const isDoctor = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'doctor';
};

/**
 * Check if current user is a patient
 * 
 * Returns true if user has patient role.
 * Used for protecting patient-only routes and features.
 * 
 * @returns {boolean} True if user is a patient
 * 
 * @example
 * if (isPatient()) {
 *   return <PatientDashboard />;
 * }
 */
export const isPatient = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'patient';
};

/**
 * Get user role
 * 
 * Returns the role of the current user.
 * 
 * @returns {string|null} User role or null if not authenticated
 * 
 * @example
 * const role = getUserRole();
 * if (role === 'doctor') {
 *   loadDoctorData();
 * }
 */
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Clear authentication data
 * 
 * Removes all authentication-related data from localStorage.
 * Used during logout to clean up user session.
 * 
 * @example
 * const handleLogout = () => {
 *   clearAuth();
 *   navigate('/login');
 * };
 */
export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Set user data in localStorage
 * 
 * Stores user data in localStorage after successful authentication.
 * Converts user object to JSON string.
 * 
 * @param {Doctor|Patient|Admin} user - User object to store
 * 
 * @example
 * const handleLoginSuccess = (userData) => {
 *   setUser(userData);
 *   navigate('/dashboard');
 * };
 */
export const setUser = (user: Doctor | Patient) => {
  localStorage.setItem('user', JSON.stringify(user));
};
