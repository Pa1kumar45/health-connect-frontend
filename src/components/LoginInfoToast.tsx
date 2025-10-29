/**
 * LoginInfoToast Component
 * 
 * Animated toast notification that displays detailed login activity information.
 * Shows current, previous login, and last logout timestamps with relative time formatting.
 * 
 * Features:
 * - Slide-in animation from right
 * - Auto-dismiss after 10 seconds
 * - Manual close button
 * - Relative time formatting (e.g., "5 minutes ago")
 * - Visual icons for each activity type
 * - Progress indicator for auto-close
 * - Dark mode support
 * 
 * Time Display Logic:
 * - < 1 minute: "Just now"
 * - < 60 minutes: "X minutes ago"
 * - < 24 hours: "X hours ago"
 * - < 7 days: "X days ago"
 * - >= 7 days: Full date and time
 * 
 * @component
 * @param {LoginInfoToastProps} props - Component props
 * @param {Object} props.loginInfo - Login activity information
 * @param {string} props.loginInfo.currentLogin - ISO timestamp of current login
 * @param {string} [props.loginInfo.previousLogin] - ISO timestamp of previous login
 * @param {string} [props.loginInfo.lastLogout] - ISO timestamp of last logout
 * @param {Function} props.onClose - Callback function when toast is closed
 * 
 * @example
 * return (
 *   <LoginInfoToast 
 *     loginInfo={{ 
 *       currentLogin: '2024-01-15T10:30:00Z',
 *       previousLogin: '2024-01-14T09:00:00Z'
 *     }}
 *     onClose={() => console.log('Toast closed')}
 *   />
 * )
 */
import React, { useEffect, useState } from 'react';
import { Clock, LogIn, LogOut, X } from 'lucide-react';

/**
 * Props interface for LoginInfoToast component
 */
interface LoginInfoToastProps {
  loginInfo: {
    currentLogin: string;
    previousLogin?: string;
    lastLogout?: string;
  };
  onClose: () => void;
}

/**
 * LoginInfoToast Component Implementation
 */
const LoginInfoToast: React.FC<LoginInfoToastProps> = ({ loginInfo, onClose }) => {
  // Visibility state for slide animation
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Effect hook for animations and auto-close timer
   * - Triggers slide-in animation after mount
   * - Sets up 10-second auto-close timer
   */
  useEffect(() => {
    // Slide in animation with slight delay
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle toast close with slide-out animation
   * Triggers slide-out animation before calling onClose callback
   */
  const handleClose = () => {
    setIsVisible(false);

    // Wait for slide-out animation to complete before unmounting
    setTimeout(onClose, 300);
  };

  /**
   * Format timestamp to relative time or absolute date
   * 
   * Time Display Logic:
   * - < 1 minute: "Just now"
   * - < 60 minutes: "X minutes ago"
   * - < 24 hours: "X hours ago"  
   * - < 7 days: "X days ago"
   * - >= 7 days: Full formatted date
   * 
   * @param {string} [dateString] - ISO 8601 date string
   * @returns {string} Formatted time string
   */
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If less than 1 minute
    if (diffMins < 1) return 'Just now';
    
    // If less than 60 minutes
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    // If less than 24 hours
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    // If less than 7 days
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // Otherwise show full date and time
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '400px' }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Login Activity</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Current Login */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Current Login
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(loginInfo.currentLogin)}
              </p>
            </div>
          </div>

          {/* Previous Login */}
          {loginInfo.previousLogin && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Previous Login
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(loginInfo.previousLogin)}
                </p>
              </div>
            </div>
          )}

          {/* Last Logout */}
          {loginInfo.lastLogout && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Last Logout
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(loginInfo.lastLogout)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This notification will close automatically in 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginInfoToast;
