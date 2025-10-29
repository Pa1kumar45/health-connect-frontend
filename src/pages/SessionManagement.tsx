/**
 * SessionManagement.tsx - Multi-Device Session Management Page
 * 
 * This component allows users to view and manage their active sessions
 * across multiple devices. Users can:
 * - View all active sessions with device info
 * - See current device indicator
 * - Logout from specific devices
 * - Logout from all other devices
 * 
 * Features:
 * - Real-time session list
 * - Device/browser information display
 * - IP address and location
 * - Last activity timestamp
 * - Session revocation with confirmation
 * - Bulk logout functionality
 * - Loading states and error handling
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface Session {
  _id: string;
  userId: string;
  userType: string;
  deviceInfo: string;
  ipAddress: string;
  browser?: string;
  os?: string;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

const SessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getSessions();
      setSessions(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Logout from specific device
  const handleRevokeSession = async (sessionId: string, deviceInfo: string) => {
    if (!confirm(`Logout from ${deviceInfo}?`)) return;

    try {
      setActionLoading(sessionId);
      setError('');
      setSuccess('');
      
      await authService.revokeSession(sessionId);
      setSuccess(`Successfully logged out from ${deviceInfo}`);
      
      // Refresh session list
      await fetchSessions();
    } catch (err: any) {
      console.error('Failed to revoke session:', err);
      setError(err.message || 'Failed to logout from device');
    } finally {
      setActionLoading(null);
    }
  };

  // Logout from all other devices
  const handleRevokeAllSessions = async () => {
    if (!confirm('Logout from all other devices? You will remain logged in on this device.')) return;

    try {
      setActionLoading('all');
      setError('');
      setSuccess('');
      
      const response = await authService.revokeAllSessions();
      setSuccess(`Successfully logged out from ${response.revokedCount || 0} device(s)`);
      
      // Refresh session list
      await fetchSessions();
    } catch (err: any) {
      console.error('Failed to revoke all sessions:', err);
      setError(err.message || 'Failed to logout from all devices');
    } finally {
      setActionLoading(null);
    }
  };

  // Get device icon based on device info
  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return <Smartphone className="h-6 w-6" />;
    } else if (info.includes('tablet') || info.includes('ipad')) {
      return <Tablet className="h-6 w-6" />;
    } else {
      return <Monitor className="h-6 w-6" />;
    }
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Profile
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Session Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your active sessions across all devices
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
              <span className="text-sm text-green-600 dark:text-green-400">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Logout All Button */}
        {sessions.length > 1 && !loading && (
          <div className="mb-6">
            <button
              onClick={handleRevokeAllSessions}
              disabled={actionLoading === 'all'}
              className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'all' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout from all other devices</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {/* Sessions List */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No active sessions
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You don't have any active sessions at the moment.
            </p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                  session.isCurrent
                    ? 'border-blue-500 dark:border-blue-400'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Device Icon */}
                    <div className={`p-3 rounded-lg ${
                      session.isCurrent
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {getDeviceIcon(session.deviceInfo)}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {session.deviceInfo}
                        </h3>
                        {session.isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Current Device
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {/* IP Address */}
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span>{session.ipAddress}</span>
                        </div>

                        {/* Last Activity */}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Last active: {formatRelativeTime(session.lastActivity)}</span>
                        </div>

                        {/* Login Time */}
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Logged in: {new Date(session.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session._id, session.deviceInfo)}
                      disabled={actionLoading === session._id}
                      className="ml-4 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Logout from this device"
                    >
                      {actionLoading === session._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {!loading && sessions.length > 0 && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Security Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Review your active sessions regularly</li>
                  <li>Logout from devices you don't recognize</li>
                  <li>Use "Logout from all devices" if you suspect unauthorized access</li>
                  <li>Your current session will remain active when logging out from other devices</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
