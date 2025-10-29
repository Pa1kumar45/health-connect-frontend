/**
 * LoginInfoBanner Component
 * 
 * Displays user's last login and logout information as a banner at the top of the page.
 * Provides session tracking information to enhance security awareness.
 * 
 * Features:
 * - Shows last login timestamp
 * - Shows last logout timestamp
 * - Handles first-time login scenario
 * - Manual close button
 * - Readable date formatting
 * - Dark mode support
 * 
 * Display Logic:
 * - Both timestamps: Shows both login and logout
 * - Only login: Shows last login time
 * - Neither: Shows "first login" message
 * 
 * @component
 * @param {LoginInfoBannerProps} props - Component props
 * @param {Object} props.loginInfo - Login information object
 * @param {string} [props.loginInfo.previousLogin] - ISO timestamp of previous login
 * @param {string} [props.loginInfo.lastLogout] - ISO timestamp of last logout
 * @param {Function} props.onClose - Callback function to close the banner
 * 
 * @example
 * return (
 *   <LoginInfoBanner 
 *     loginInfo={{ previousLogin: '2024-01-15T10:30:00Z' }}
 *     onClose={() => console.log('Banner closed')}
 *   />
 * )
 */
import React from 'react';
import { Info, X } from 'lucide-react';

/**
 * Props interface for LoginInfoBanner component
 */
interface LoginInfoBannerProps {
  loginInfo: {
    previousLogin?: string;
    lastLogout?: string;
  };
  onClose: () => void;
}

/**
 * LoginInfoBanner Component Implementation
 */
const LoginInfoBanner: React.FC<LoginInfoBannerProps> = ({ loginInfo, onClose }) => {
  
  /**
   * Format date to human-readable string
   * Converts ISO timestamp to localized date and time format
   * 
   * @param {string} [dateString] - ISO 8601 date string
   * @returns {string} Formatted date string or 'Never' if not provided
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              
              {loginInfo.previousLogin && (
                <span>  Last login: {formatDate(loginInfo.previousLogin)}</span>
              )}
              {loginInfo.previousLogin && loginInfo.lastLogout && <span>.</span>}
              {loginInfo.lastLogout && (
                <span> Last logout: {formatDate(loginInfo.lastLogout)}</span>
              )}
              {!loginInfo.previousLogin && !loginInfo.lastLogout && (
                <span> this is your first login.</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0 ml-4"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginInfoBanner;
