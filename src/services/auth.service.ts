/**
 * auth.service.ts - Authentication service module
 * 
 * This service module handles all authentication-related operations for the Health-Connect application.
 * It provides comprehensive user authentication including:
 * - User registration (doctors and patients)
 * - User login with role-based access (with OTP verification)
 * - OTP generation and verification
 * - Current user retrieval and validation
 * - Session management and logout
 * - Authentication state checking
 * 
 * Features:
 * - Role-based authentication (doctor/patient/admin)
 * - Two-factor authentication with OTP
 * - Cookie-based session management
 * - Local storage token management
 * - Error handling with descriptive messages
 * - TypeScript type safety
 * 
 * Authentication Flow:
 * 1. User enters credentials (email/password/role)
 * 2. System sends OTP to email
 * 3. User verifies OTP
 * 4. Server returns JWT token and user data
 * 5. Token stored in localStorage, session in cookies
 * 6. Subsequent requests include credentials for validation
 * 7. Logout clears local storage and session
 * 
 * API Endpoints:
 * - POST /auth/register - User registration
 * - POST /auth/send-otp - Send OTP for verification
 * - POST /auth/verify-otp - Verify OTP and complete authentication
 * - POST /auth/login - User login (sends OTP)
 * - GET /auth/me - Get current user
 * - POST /auth/logout - Logout and clear session
 * 
 * Used by: Login/signup forms, authentication context, protected routes
 * Dependencies: LoginCredentials, AuthResponse types
 */

import { LoginCredentials, AuthResponse } from '../types/index.ts';  // Type definitions

// Environment configuration - backend URL from Vite environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// API base URL for authentication endpoints
export const API_URL = `${BACKEND_URL}/api`;


/**
 * authService - Comprehensive authentication service
 * 
 * This service handles all user authentication operations including registration,
 * login, session management, and authentication state checking. Uses both
 * localStorage for client-side tokens and HTTP cookies for server sessions.
 */
export const authService = {
  /**
   * register - Registers a new user (doctor or patient)
   * 
   * Creates a new user account with role-based registration.
   * Supports both doctor and patient registration with appropriate
   * data validation and role assignment.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/register
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} data - Registration data object
   * @param {string} data.email - User email address
   * @param {string} data.password - User password
   * @param {string} data.name - User full name
   * @param {string} data.role - User role ('doctor' or 'patient')
   * @returns {Promise<AuthResponse>} Registration response with user data and token
   * 
   * @throws {Error} If registration fails due to validation or server errors
   * 
   * Example:
   * ```typescript
   * const response = await authService.register({
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   *   name: 'John Doe',
   *   role: 'patient'
   * });
   * ```
   */
  async register(data: LoginCredentials & { name: string; role: string }): Promise<AuthResponse> {
    console.log("register data");
    console.log(data);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',    // Include cookies for session management
      body: JSON.stringify(data)
    });

    // Error handling for registration failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const result = await response.json();
    console.log("registration complete", result);
    return result;
  },

  /**
   * login - Authenticates user and creates session
   * 
   * Validates user credentials and creates authenticated session.
   * Returns user data and authentication token for subsequent requests.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/login
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} credentials - Login credentials object
   * @param {string} credentials.email - User email address
   * @param {string} credentials.password - User password
   * @param {string} credentials.role - User role ('doctor' or 'patient')
   * @returns {Promise<AuthResponse>} Login response with user data and token
   * 
   * @throws {Error} If login fails due to invalid credentials
   * 
   * Example:
   * ```typescript
   * const response = await authService.login({
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   *   role: 'patient'
   * });
   * ```
   */
  async login(credentials: LoginCredentials & { role: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',    // Include cookies for session management
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    // Error handling for login failures
    if (!response.ok) {
      const error = await response.json();
      // Create error with the full response data for suspension info
      const err: any = new Error(error.message || 'Login failed');
      err.response = { data: error };
      throw err;
    }

    const result = await response.json();
    return result;
  },

  /**
   * adminLogin - Authenticates admin user (direct login, no OTP)
   * 
   * Admin login is separate from regular user login and does not require OTP verification.
   * Admins are pre-created by system administrators and cannot self-register.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/admin/login
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} credentials - Admin login credentials
   * @param {string} credentials.email - Admin email address
   * @param {string} credentials.password - Admin password
   * @returns {Promise<AuthResponse>} Login response with admin user data and token
   * 
   * @throws {Error} If login fails due to invalid credentials or account issues
   * 
   * Example:
   * ```typescript
   * const response = await authService.adminLogin({
   *   email: 'admin@healthconnect.com',
   *   password: 'securePassword123'
   * });
   * ```
   */
  async adminLogin(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      credentials: 'include',    // Include cookies for session management
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    // Error handling for admin login failures
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Admin login failed');
    }

    const result = await response.json();
    
    // Store token if provided
    if (result.token) {
      localStorage.setItem('token', result.token);
    }

    return result;
  },

  /**
   * getCurrentUser - Retrieves current authenticated user information
   * 
   * Fetches current user data from server using stored authentication token.
   * Used to restore user session on app initialization and verify authentication.
   * 
   * API Details:
   * - Endpoint: GET /api/auth/me
   * - Authentication: Required (token or session)
   * - Credentials: Included for session validation
   * 
   * @returns {Promise<AuthResponse>} Current user data
   * @throws {Error} If no token found or authentication invalid
   * 
   * Example:
   * ```typescript
   * try {
   *   const user = await authService.getCurrentUser();
   *   console.log('Current user:', user);
   * } catch (error) {
   *   console.log('User not authenticated');
   * }
   * ```
   */
  async getCurrentUser() {
    // Check for stored authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include'    // Include session cookies
    });

    // Error handling for authentication validation
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    return response.json();
  },

  /**
   * sendOTP - Sends OTP to user's email for verification
   * 
   * Requests backend to generate and send a 6-digit OTP to the provided email.
   * OTP is valid for 5 minutes and can be used for login or signup verification.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/send-otp
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Rate Limited: Max 3 requests per 15 minutes per email
   * 
   * @param {Object} data - OTP request data
   * @param {string} data.email - User email address to send OTP
   * @param {string} data.role - User role ('doctor', 'patient', or 'admin')
   * @param {string} data.purpose - Purpose of OTP ('login' or 'signup')
   * @returns {Promise<any>} Response confirming OTP sent
   * 
   * @throws {Error} If OTP sending fails or rate limit exceeded
   * 
   * Example:
   * ```typescript
   * await authService.sendOTP({
   *   email: 'user@example.com',
   *   role: 'patient',
   *   purpose: 'login'
   * });
   * ```
   */
  async sendOTP(data: { email: string; role: string; purpose: 'login' | 'registration' }) {
    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return response.json();
  },

  /**
   * verifyOTP - Verifies OTP and completes authentication
   * 
   * Validates the OTP entered by user and completes the authentication process.
   * On successful verification:
   * - For login: Returns user data and creates session
   * - For signup: Activates account and returns user data
   * 
   * API Details:
   * - Endpoint: POST /api/auth/verify-otp
   * - Authentication: Not required (public endpoint)
   * - Content-Type: application/json
   * - Credentials: Included for session creation
   * 
   * @param {Object} data - OTP verification data
   * @param {string} data.email - User email address
   * @param {string} data.otp - 6-digit OTP code
   * @param {string} data.role - User role ('doctor', 'patient', or 'admin')
   * @param {string} data.purpose - Purpose of OTP ('login' or 'signup')
   * @returns {Promise<AuthResponse>} Authentication response with user data and token
   * 
   * @throws {Error} If OTP is invalid, expired, or verification fails
   * 
   * Example:
   * ```typescript
   * const response = await authService.verifyOTP({
   *   email: 'user@example.com',
   *   otp: '123456',
   *   role: 'patient',
   *   purpose: 'login'
   * });
   * console.log('Logged in:', response.data);
   * ```
   */
  async verifyOTP(data: { email: string; otp: string; role: string; purpose: 'login' | 'registration' }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',    // Include cookies for session creation
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid or expired OTP');
    }

    const result = await response.json();
    
    // Store token if provided
    if (result.token) {
      localStorage.setItem('token', result.token);
    }

    return result;
  },

  /**
   * logout - Terminates user session and clears authentication data
   * 
   * Clears stored authentication token from localStorage.
   * Note: Server-side session invalidation should also be implemented.
   * 
   * Actions:
   * - Removes authentication token from localStorage
   * - Clears any cached user data
   * 
   * Example:
   * ```typescript
   * authService.logout();
   * // User is now logged out locally
   * ```
   */
  logout() {
    localStorage.removeItem('token');
    // Note: Consider implementing server-side logout endpoint
    // localStorage.removeItem('user'); // Additional cleanup if needed
  },

  /**
   * isAuthenticated - Checks if user is currently authenticated
   * 
   * Simple check for authentication token presence in localStorage.
   * Used for client-side route protection and UI state management.
   * 
   * @returns {boolean} True if authentication token exists, false otherwise
   * 
   * Note: This only checks for token presence, not validity.
   * Server-side validation should be used for secure operations.
   * 
   * Example:
   * ```typescript
   * if (authService.isAuthenticated()) {
   *   // Show authenticated user interface
   * } else {
   *   // Redirect to login page
   * }
   * ```
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * forgotPassword - Request password reset link
   * 
   * Sends password reset request to server. User will receive an email
   * with a reset link containing a token valid for 1 hour.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/forgot-password
   * - Body: { email, role }
   * - Authentication: Not required (public endpoint)
   * 
   * Flow:
   * 1. User enters email and role
   * 2. Server validates user exists
   * 3. Server generates reset token
   * 4. Email sent with reset link
   * 5. User clicks link to reset password
   * 
   * @param {Object} data - Request data
   * @param {string} data.email - User's email address
   * @param {string} data.role - User's role (doctor/patient)
   * @returns {Promise<{success: boolean, message: string}>} Response with status message
   * @throws {Error} If request fails or user not found
   * 
   * Example:
   * ```typescript
   * try {
   *   const result = await authService.forgotPassword({
   *     email: 'doctor@example.com',
   *     role: 'doctor'
   *   });
   *   console.log(result.message); // "Password reset email sent"
   * } catch (error) {
   *   console.error('Reset failed:', error.message);
   * }
   * ```
   */
  async forgotPassword(data: { email: string; role: string }) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset request failed');
    }

    return await response.json();
  },

  /**
   * resetPassword - Reset password with token
   * 
   * Resets user password using the token received via email.
   * Token is valid for 1 hour from generation.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/reset-password/:token
   * - Body: { password, confirmPassword }
   * - Authentication: Not required (token-based)
   * 
   * Security:
   * - Token is single-use
   * - Token expires after 1 hour
   * - Password must meet minimum requirements (6+ characters)
   * - Passwords must match
   * 
   * @param {Object} data - Reset data
   * @param {string} data.token - Reset token from email link
   * @param {string} data.password - New password
   * @param {string} data.confirmPassword - Password confirmation
   * @returns {Promise<{success: boolean, message: string}>} Response with status message
   * @throws {Error} If token invalid, expired, or passwords don't match
   * 
   * Example:
   * ```typescript
   * try {
   *   const result = await authService.resetPassword({
   *     token: 'abc123...',
   *     password: 'newSecurePassword',
   *     confirmPassword: 'newSecurePassword'
   *   });
   *   console.log(result.message); // "Password reset successful"
  /**
   * resetPassword - Reset password with OTP
   * 
   * Resets user password using the OTP received via email.
   * OTP is valid for 10 minutes from generation.
   * 
   * API Details:
   * - Endpoint: POST /api/auth/reset-password
   * - Body: { email, otp, password, confirmPassword, role }
   * - Authentication: Not required (OTP-based)
   * 
   * Security:
   * - OTP is single-use
   * - OTP expires after 10 minutes
   * - Password must meet minimum requirements (6+ characters)
   * - Passwords must match
   * 
   * @param {Object} data - Reset data
   * @param {string} data.email - User's email address
   * @param {string} data.otp - 6-digit OTP from email
   * @param {string} data.password - New password
   * @param {string} data.confirmPassword - Password confirmation
   * @param {string} data.role - User role (doctor/patient)
   * @returns {Promise<{success: boolean, message: string}>} Response with status message
   * @throws {Error} If OTP invalid, expired, or passwords don't match
   * 
   * Example:
   * ```typescript
   * try {
   *   const result = await authService.resetPassword({
   *     email: 'user@example.com',
   *     otp: '123456',
   *     password: 'newSecurePassword',
   *     confirmPassword: 'newSecurePassword',
   *     role: 'patient'
   *   });
   *   console.log(result.message); // "Password reset successful"
   *   // Redirect to login
   * } catch (error) {
   *   console.error('Reset failed:', error.message);
   * }
   * ```
   */
  async resetPassword(data: { email: string; otp: string; password: string; confirmPassword: string; role: string }) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return await response.json();
  },

  /**
   * getSessions - Get all active sessions for current user
   * 
   * Retrieves list of all active sessions across different devices.
   * Useful for multi-device session management and security monitoring.
   * 
   * API Details:
   * - Endpoint: GET /api/auth/sessions
   * - Authentication: Required (protected route)
   * - Returns: Array of session objects with device info
   * 
   * Session Information:
   * - Session ID
   * - Device information (browser, OS)
   * - IP address
   * - Login time
   * - Last activity
   * - Current session indicator
   * 
   * @returns {Promise<Array>} List of active sessions
   * @throws {Error} If request fails or user not authenticated
   * 
   * Example:
   * ```typescript
   * try {
   *   const sessions = await authService.getSessions();
   *   console.log('Active sessions:', sessions.length);
   *   sessions.forEach(session => {
   *     console.log(`${session.deviceInfo} - ${session.ipAddress}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch sessions:', error.message);
   * }
   * ```
   */
  async getSessions() {
    const response = await fetch(`${API_URL}/auth/sessions`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sessions');
    }

    return await response.json();
  },

  /**
   * revokeSession - Logout from a specific device/session
   * 
   * Revokes a specific session by ID. Used to logout from other devices
   * or remove compromised sessions.
   * 
   * API Details:
   * - Endpoint: DELETE /api/auth/sessions/:sessionId
   * - Authentication: Required (protected route)
   * - Effect: Immediately invalidates the specified session
   * 
   * Use Cases:
   * - Logout from a specific device
   * - Remove suspicious sessions
   * - Clean up old sessions
   * 
   * @param {string} sessionId - ID of session to revoke
   * @returns {Promise<{success: boolean, message: string}>} Confirmation response
   * @throws {Error} If request fails or session not found
   * 
   * Example:
   * ```typescript
   * try {
   *   await authService.revokeSession('session_id_123');
   *   console.log('Session revoked successfully');
   *   // Refresh session list
   * } catch (error) {
   *   console.error('Failed to revoke session:', error.message);
   * }
   * ```
   */
  async revokeSession(sessionId: string) {
    const response = await fetch(`${API_URL}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke session');
    }

    return await response.json();
  },

  /**
   * revokeAllSessions - Logout from all other devices
   * 
   * Revokes all sessions except the current one. Useful for security
   * when you suspect unauthorized access.
   * 
   * API Details:
   * - Endpoint: DELETE /api/auth/sessions/all
   * - Authentication: Required (protected route)
   * - Effect: Keeps current session, invalidates all others
   * 
   * Use Cases:
   * - Security: Logout from all devices after password change
   * - Lost device: Remote logout from stolen/lost device
   * - Session cleanup: Remove all old sessions
   * 
   * Important: Current session remains active!
   * 
   * @returns {Promise<{success: boolean, message: string, revokedCount: number}>} Confirmation with count
   * @throws {Error} If request fails
   * 
   * Example:
   * ```typescript
   * try {
   *   const result = await authService.revokeAllSessions();
   *   console.log(`Logged out from ${result.revokedCount} devices`);
   *   // Refresh session list
   * } catch (error) {
   *   console.error('Failed to revoke sessions:', error.message);
   * }
   * ```
   */
  async revokeAllSessions() {
    const response = await fetch(`${API_URL}/auth/sessions/all`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke all sessions');
    }

    return await response.json();
  },

  /**
   * changePassword - Change user's password
   * 
   * Updates the authenticated user's password after verifying their current password.
   * Requires the user to provide their current password for security verification.
   * 
   * Security Features:
   * - Verifies current password before allowing change
   * - Ensures new password is different from current password
   * - Sends confirmation email after successful change
   * - Logs the password change event for audit trail
   * 
   * @async
   * @param {Object} data - Password change data
   * @param {string} data.currentPassword - User's current password (for verification)
   * @param {string} data.newPassword - New password to set
   * @returns {Promise<Object>} Response with success confirmation
   * @throws {Error} If current password is incorrect, new password is same as current, or API call fails
   * 
   * @example
   * ```typescript
   * try {
   *   await authService.changePassword({
   *     currentPassword: 'oldPassword123',
   *     newPassword: 'newSecurePassword456',
   *     confirmPassword: 'newSecurePassword456'
   *   });
   *   console.log('Password changed successfully');
   * } catch (error) {
   *   console.error('Password change failed:', error.message);
   * }
   * ```
   */
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  }
  
  // Note: Additional methods commented out for potential future implementation
  // getStoredUser() method template available for local user data caching
}; 
