/**
 * Admin Type Definitions
 * 
 * Type definitions specific to admin functionality.
 * Includes user management, dashboard statistics, activity logs, and auth logs.
 * 
 * Features:
 * - Admin user management
 * - Dashboard statistics
 * - Action logging and audit trails
 * - Authentication monitoring
 * - User verification workflow
 * - Security and access control
 * 
 * @module types/admin
 */

/**
 * Admin Interface
 * 
 * Represents an administrator user account.
 * 
 * @interface Admin
 * @property {string} _id - MongoDB unique identifier
 * @property {string} name - Admin's full name
 * @property {string} email - Admin's email
 * @property {'admin'|'super_admin'} role - Admin privilege level
 * @property {string[]} permissions - Array of permission strings
 * @property {boolean} isActive - Whether admin account is active
 * @property {Date} [lastLogin] - Last login timestamp
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last modification date
 */
// frontend/src/types/admin.ts
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserManagementUser Interface
 * 
 * User data for admin user management dashboard.
 * Simplified user representation for listing and management.
 * 
 * @interface UserManagementUser
 * @property {string} _id - User's unique identifier
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} fullName - User's full name
 * @property {string} email - User's email address
 * @property {string} [phone] - User's phone number
 * @property {'doctor'|'patient'} userType - Type of user account
 * @property {'pending'|'verified'|'rejected'|'under_review'} verificationStatus - Account verification status
 * @property {boolean} isActive - Whether account is active
 * @property {string} [specialization] - Doctor's specialization (doctors only)
 * @property {string} [medicalLicense] - Medical license number (doctors only)
 * @property {string} [suspensionReason] - Reason if account is suspended
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */
export interface UserManagementUser {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: 'doctor' | 'patient';
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'under_review';
  isActive: boolean;
  specialization?: string;
  medicalLicense?: string;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DashboardStats Interface
 * 
 * Statistical data for admin dashboard.
 * Provides overview of system usage and activity.
 * 
 * @interface DashboardStats
 * @property {Object} users - User statistics
 * @property {number} users.totalDoctors - Total number of doctors
 * @property {number} users.totalPatients - Total number of patients
 * @property {number} users.pendingVerification - Users awaiting verification
 * @property {number} users.suspended - Number of suspended accounts
 * @property {Object} appointments - Appointment statistics
 * @property {number} appointments.today - Today's appointments
 * @property {number} appointments.total - Total appointments
 * @property {Object} recentActivity - Recent activity metrics
 * @property {number} recentActivity.newDoctors - New doctor registrations
 * @property {number} recentActivity.newPatients - New patient registrations
 */
export interface DashboardStats {
  users: {
    totalDoctors: number;
    totalPatients: number;
    pendingVerification: number;
    suspended: number;
  };
  appointments: {
    today: number;
    total: number;
  };
  recentActivity: {
    newDoctors: number;
    newPatients: number;
  };
}

/**
 * AdminActionLog Interface
 * 
 * Audit log entry for admin actions.
 * Tracks all administrative changes for compliance and security.
 * 
 * @interface AdminActionLog
 * @property {string} _id - Log entry unique identifier
 * @property {Object} adminId - Admin who performed action
 * @property {string} adminId._id - Admin's ID
 * @property {string} adminId.name - Admin's name
 * @property {string} adminId.email - Admin's email
 * @property {string} actionType - Type of action performed
 * @property {string} targetUserId - ID of affected user
 * @property {'Doctor'|'Patient'|'Admin'} targetUserType - Type of affected user
 * @property {Record<string, unknown>} previousData - Data before change
 * @property {Record<string, unknown>} newData - Data after change
 * @property {string} [reason] - Reason for action
 * @property {Date} createdAt - Action timestamp
 */
export interface AdminActionLog {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  actionType: string;
  targetUserId: string;
  targetUserType: 'Doctor' | 'Patient' | 'Admin';
  previousData: Record<string, unknown>;
  newData: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

/**
 * UserFilters Interface
 * 
 * Filter options for user management queries.
 * 
 * @interface UserFilters
 * @property {'doctor'|'patient'|'admin'|'super_admin'} [role] - Filter by user role
 * @property {'active'|'inactive'} [status] - Filter by active status
 * @property {'pending'|'verified'|'rejected'} [verificationStatus] - Filter by verification
 * @property {string} [search] - Search query string
 * @property {number} [page] - Page number for pagination
 * @property {number} [limit] - Results per page
 */
export interface UserFilters {
  role?: 'doctor' | 'patient' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * AuthLog Interface
 * 
 * Authentication log entry for security monitoring.
 * Tracks all login attempts (successful and failed).
 * 
 * @interface AuthLog
 * @property {string} _id - Log entry unique identifier
 * @property {string} [userId] - User ID if login successful
 * @property {string} [email] - Email used for login attempt
 * @property {string} [ipAddress] - IP address of login attempt
 * @property {string} [userAgent] - Browser/device user agent
 * @property {boolean} success - Whether login was successful
 * @property {string} [message] - Login result message
 * @property {string} [reason] - Additional context
 * @property {string} [failureReason] - Reason for failure
 * @property {Date} createdAt - Log entry timestamp
 */
// Auth-related types for Admin Logs page (SRS requirements)
export interface AuthLog {
  _id: string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  message?: string;
  reason?: string;
  failureReason?: string;
  createdAt: Date;
}

/**
 * FailedLoginAttempt Interface
 * 
 * Failed login attempt record for security monitoring.
 * 
 * @interface FailedLoginAttempt
 * @property {string} _id - Attempt unique identifier
 * @property {string} [email] - Email used in attempt
 * @property {string} [ipAddress] - Source IP address
 * @property {string} [userAgent] - Browser/device information
 * @property {string} [reason] - Failure reason
 * @property {Date} createdAt - Attempt timestamp
 */
export interface FailedLoginAttempt {
  _id: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  createdAt: Date;
}

/**
 * AuthStats Interface
 * 
 * Authentication statistics for admin dashboard.
 * Provides security insights and login metrics.
 * 
 * @interface AuthStats
 * @property {number} totalLogins - Total login attempts
 * @property {number} successfulLogins - Successful login count
 * @property {number} failedLogins - Failed login count
 * @property {number} [successRate] - Success rate percentage
 * @property {Array} [topIPs] - Most active IP addresses
 * @property {string} topIPs[].ip - IP address
 * @property {number} topIPs[].count - Login count from IP
 * @property {FailedLoginAttempt[]} [recentFailedAttempts] - Recent failures
 */
export interface AuthStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  successRate?: number;
  topIPs?: { ip: string; count: number }[];
  recentFailedAttempts?: FailedLoginAttempt[];
}