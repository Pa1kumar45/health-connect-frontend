/**
 * Admin Service
 * 
 * Handles all admin-related API calls for user management dashboard.
 * Provides functionality for:
 * - Dashboard statistics
 * - User management (list, verify, suspend, activate, delete)
 * - Authentication logs
 * - Failed login attempts tracking
 * 
 * @class AdminService
 */

// frontend/src/services/admin.service.ts
import axios from '../utils/axios';
import { DashboardStats, UserFilters } from '../types/admin';

class AdminService {
  private baseURL = '/admin';

  /**
   * Get dashboard statistics
   * 
   * Fetches overview statistics for admin dashboard including:
   * - Total users count
   * - Pending verifications
   * - Active users
   * - Recent activity
   * 
   * @returns {Promise<DashboardStats>} Dashboard statistics
   * @throws {Error} If fetch fails
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${this.baseURL}/dashboard/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get all users with filtering and pagination
   * 
   * Retrieves user list with optional filters for:
   * - User type (doctor/patient)
   * - Verification status
   * - Account status (active/suspended)
   * - Search term
   * - Pagination (page, limit)
   * 
   * @param {UserFilters} filters - Optional filtering parameters
   * @returns {Promise} Users array with pagination info
   * @throws {Error} If fetch fails
   */
  async getUsers(filters: UserFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/users?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Verify or update user verification status
   * @param userId User ID to verify
   * @param verificationStatus New verification status
   * @param userType Type of user (doctor/patient)
   * @param reason Optional reason for the action
   */
  async verifyUser(
    userId: string, 
    verificationStatus: string, 
    userType: 'doctor' | 'patient',
    reason?: string
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/verify`, {
        verificationStatus,
        userType,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw new Error('Failed to verify user');
    }
  }

  /**
   * Suspend or activate user account
   * @param userId User ID to toggle status
   * @param action Action to perform ('suspend' | 'activate')
   * @param userType Type of user (doctor/patient)
   * @param reason Reason for the action
   */
  async toggleUserStatus(
    userId: string, 
    action: 'suspend' | 'activate',
    userType: 'doctor' | 'patient',
    reason?: string
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/toggle-status`, {
        action,
        userType,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Failed to update user status');
    }
  }

  /**
   * Update user role (super admin only)
   * @param userId User ID to update role
   * @param newRole New role to assign
   * @param userType Type of user (doctor/patient)
   */
  async updateUserRole(
    userId: string,
    newRole: string,
    userType: 'doctor' | 'patient'
  ) {
    try {
      const response = await axios.put(`${this.baseURL}/users/${userId}/role`, {
        newRole,
        userType
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Get admin action logs
   * @param filters Optional filters for logs
   */
  async getAdminLogs(filters: Record<string, string | number | boolean | undefined> = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/logs?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      throw new Error('Failed to fetch admin logs');
    }
  }

  /**
   * Get authentication logs (login activities)
   * @param filters Optional filters for auth logs
   */
  async getAuthLogs(filters: Record<string, string | number | boolean | undefined> = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/auth-logs?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching auth logs:', error);
      throw new Error('Failed to fetch auth logs');
    }
  }

  /**
   * Get failed login attempts
   * @param filters Optional filters for failed attempts
   */
  async getFailedLoginAttempts(filters: Record<string, string | number | boolean | undefined> = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/auth-logs/failed-attempts?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching failed login attempts:', error);
      throw new Error('Failed to fetch failed login attempts');
    }
  }

  /**
   * Get authentication statistics (system performance metrics)
   * @param filters Optional filters for stats
   */
  async getAuthStats(filters: Record<string, string | number | boolean | undefined> = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/auth-logs/stats?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching auth stats:', error);
      throw new Error('Failed to fetch auth stats');
    }
  }
}

export default new AdminService();
