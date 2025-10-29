/**
 * AdminLogs Component
 * 
 * System activity monitoring and authentication logs viewer for administrators.
 * Displays comprehensive login activities and system events with search and filtering.
 * 
 * Features:
 * - View authentication logs (login/logout events)
 * - Search by user email or event type
 * - Expandable log details
 * - Pagination support
 * - Success/failure status indicators
 * - Timestamp formatting
 * - IP address tracking
 * - User agent information
 * - System performance monitoring
 * - Dark mode support
 * 
 * Log Information:
 * - User identification (email, role)
 * - Event type (login, logout, failed attempt)
 * - Timestamp
 * - IP address
 * - Browser/device information
 * - Success/failure status
 * 
 * @component
 * @example
 * return (
 *   <AdminLogs />
 * )
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
  XCircle,
  CheckCircle
} from 'lucide-react';
import adminService from '../services/admin.service';
import { AuthLog } from '../types/admin';

const AdminLogs: React.FC = () => {
  const navigate = useNavigate();
  
  // State management for logs and UI
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  /**
   * Load data when search or page changes
   */
  useEffect(() => {
    loadAuthLogs();
  }, [search, currentPage]);

  /**
   * Fetch authentication logs
   * 
   * Retrieves paginated auth logs with optional search filtering.
   * Updates logs list and pagination state.
   */
  const loadAuthLogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAuthLogs({ 
        page: currentPage, 
        limit, 
        search 
      });
      setAuthLogs(Array.isArray(response) ? response : response.logs || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle page change in pagination
   * 
   * @param {number} page - Page number to navigate to
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Toggle expanded log details
   * 
   * Shows/hides detailed information for a specific log entry.
   * 
   * @param {string} logId - ID of the log to expand/collapse
   */
  const toggleLogExpansion = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  /**
   * Format date and time for display
   * 
   * Converts timestamp to readable locale string format.
   * 
   * @param {Date | string} date - Date to format
   * @returns {string} Formatted date-time string
   */
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  if (loading && authLogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Shield className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                    System Activity Logs
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Monitor login activities and system performance
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Clock className="inline-block h-4 w-4 mr-1" />
                {authLogs.length} {authLogs.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Login Activity Timeline
              </h2>
              
              {/* Search */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email or IP..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 w-64"
                  />
                </div>
                {search && (
                  <button
                    onClick={clearSearch}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logs List View */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading logs...</span>
              </div>
            </div>
          ) : authLogs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No logs found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try a different search or check back later</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {authLogs.map((log: AuthLog) => {
                const isExpanded = expandedLog === log._id;
                const isSuccess = 'success' in log ? log.success : false;
                
                return (
                  <div key={log._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            isSuccess 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {isSuccess ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            {isSuccess ? 'Success' : 'Failed'}
                          </span>
                          
                          {/* Timestamp */}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>

                        {/* Log Details */}
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.email || log.userId || 'Unknown'}
                          </p>
                          {log.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {log.message}
                            </p>
                          )}
                          {log.reason && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              <span className="font-medium">Reason:</span> {log.reason}
                            </p>
                          )}
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Full Details</h4>
                            <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                              {JSON.stringify(log, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleLogExpansion(log._id)}
                        className="ml-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand details'}
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
