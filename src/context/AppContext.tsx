/**
 * App Context Provider
 * 
 * Central state management for the Health-Connect application.
 * Manages user authentication and theme preferences.
 * Provides global state including current user and dark mode.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../utils/axios';
import { Doctor, Patient, Admin, SignUpFormData, LoginCredentials } from '../types/index';

/**
 * Login information interface - timestamp data for login banner
 */
export interface LoginInfo {
  previousLogin?: string;
  lastLogout?: string;
}

/**
 * Theme context interface - defines theme-related state and functions
 */
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * Main app context interface - extends theme context with auth functionality
 */
interface AppContextType extends ThemeContextType {
  // Currently authenticated user
  currentUser: Doctor | Patient | Admin | null;

  // Function to set current user
  setCurrentUser: (user: Doctor | Patient | Admin | null) => void;

  // Global loading state
  isLoading: boolean;

  // Global error state
  error: string | null;

  // Logout function
  logout: () => void;

  // User registration function
  signup: (data: SignUpFormData) => void;

  // User login function
  login: (data: LoginCredentials) => void;

  // Send OTP function
  sendOTP: (data: { email: string; role: string; purpose: 'login' | 'registration' }) => Promise<void>;

  // Verify OTP function
  verifyOTP: (data: { email: string; otp: string; role: string; purpose: 'login' | 'registration' }) => Promise<{ success: boolean; message: string; requirePassword?: boolean }>;

  // Get current user from server
  getCurrentUser: () => Promise<{ data: { data: Doctor | Patient | Admin; success: boolean; message: string } }>;

  // Login timestamp information
  loginInfo: LoginInfo | null;

  // Show login info toast
  showLoginInfoToast: (info: LoginInfo) => void;

  // Hide login info toast
  hideLoginInfoToast: () => void;
}

// Create the app context
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App Context Provider Component
 * Provides all app-wide state and functionality to child components
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize dark mode from localStorage, default to true (dark mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme ? JSON.parse(savedTheme) : true;
    });

    // Current authenticated user state (doctor, patient, or admin)
    const [currentUser, setCurrentUser] = useState<Doctor | Patient | Admin | null>(null);
    
    // Global loading and error states (currently unused but available for future use)
    const [isLoading] = useState(false);
    const [error] = useState<string | null>(null);

    // Login info toast state
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);

    // Apply dark mode class to html element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    /**
     * User signup function - handles new user registration
     * Sets current user state after successful signup
     */
    const signup = async (data: SignUpFormData) => {
        try {
            console.log("register data", data);
            const response = await axios.post('/auth/register', data);
            console.log("Signup response:", response.data);

            // Set the newly registered user as current user
            setCurrentUser(response.data.data);
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    /**
     * User login function - handles user authentication
     * Sets current user state after successful login
     */
    const login = async (data: LoginCredentials) => {
        try {
            console.log("logindata", data);
            const response = await axios.post('/auth/login', data);
            console.log("login responce", response);
            
            // Set the authenticated user as current user
            setCurrentUser(response.data.data);

        } catch (error: unknown) {
            console.log(error);
            throw error;
        }
    }

    /**
     * User logout function - clears user state and calls logout API
     */
    const logout = useCallback(async () => {
        try {
            // Call logout API first to clear cookie and revoke session
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API fails
        } finally {
            // Always clear user state locally
            setCurrentUser(null);
        }
    }, []);

    /**
     * Get current user function - fetches current user from server
     * Used for maintaining authentication state on app reload
     */
    const getCurrentUser = useCallback(async () => {
        try {
            const response = await axios('/auth/me');
            console.log("current me ", response);
            if (response.data.data) {
                setCurrentUser(response.data.data);
            }
            return response;
        } catch (error) {
            console.error("Error getting current user:", error);
            throw error;
        }
    }, []);

    /**
     * Send OTP function - requests OTP to be sent to user's email
     * Used for login and signup verification
     */
    const sendOTP = useCallback(async (data: { email: string; role: string; purpose: 'login' | 'registration' }) => {
        try {
            const response = await axios.post('/auth/send-otp', data);
            console.log('OTP sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    }, []);

    /**
     * Verify OTP function - verifies OTP and completes authentication
     * Updates current user state on successful verification
     */
    const verifyOTP = useCallback(async (data: { email: string; otp: string; role: string; purpose: 'login' | 'registration' }) => {
        try {
            const response = await axios.post('/auth/verify-otp', data);
            console.log('OTP verified successfully:', response.data);
            
            // Set current user if verification successful
            if (response.data.data) {
                setCurrentUser(response.data.data);
            }
            
            return response.data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }, []);

    /**
     * Theme toggle function - switches between light and dark modes
     * Uses useCallback for performance optimization
     */
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev: boolean) => !prev);
    }, []);

    /**
     * Show login info toast - displays login/logout timestamps
     */
    const showLoginInfoToast = useCallback((info: LoginInfo) => {
        setLoginInfo(info);
    }, []);

    /**
     * Hide login info toast - clears login info and hides toast
     */
    const hideLoginInfoToast = useCallback(() => {
        setLoginInfo(null);
    }, []);

    // Provide all context values to child components
    return (
        <AppContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                currentUser,
                setCurrentUser,
                isLoading,
                error,
                logout,
                signup,
                login,
                sendOTP,
                verifyOTP,
                getCurrentUser,
                loginInfo,
                showLoginInfoToast,
                hideLoginInfoToast
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

/**
 * Custom hook to access app context
 * Throws error if used outside of AppProvider
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

/**
 * Custom hook to access theme-specific context values
 * Convenience hook for components that only need theme functionality
 */
export const useTheme = () => {
    const { isDarkMode, toggleDarkMode } = useApp();
    return { isDarkMode, toggleDarkMode };
};
