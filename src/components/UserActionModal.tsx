/**
 * UserActionModal Component
 * 
 * Admin modal for performing actions on user accounts.
 * Supports verification, status changes (suspend/activate), and role changes.
 * 
 * Features:
 * - User verification (approve/reject/review)
 * - Account suspension/activation
 * - Reason requirement for critical actions
 * - Warning messages for destructive actions
 * - User details display
 * - Dark mode support
 * 
 * @component
 * @param {UserManagementUser} user - User to perform action on
 * @param {string} actionType - Type of action: 'verify' | 'status' | 'role'
 * @param {Function} onClose - Close modal callback
 * @param {Function} onVerify - Verification action callback
 * @param {Function} onToggleStatus - Status toggle callback
 * 
 * @example
 * return (
 *   <UserActionModal
 *     user={selectedUser}
 *     actionType="verify"
 *     onClose={() => setModalOpen(false)}
 *     onVerify={handleVerify}
 *     onToggleStatus={handleToggleStatus}
 *   />
 * )
 */

// frontend/src/components/UserActionModal.tsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { UserManagementUser } from '../types/admin';

/**
 * Props interface for UserActionModal component
 */
interface UserActionModalProps {
  user: UserManagementUser;
  actionType: 'verify' | 'status' | 'role';
  onClose: () => void;
  onVerify: (status: string, reason?: string) => void;
  onToggleStatus: (action: 'suspend' | 'activate', reason?: string) => void;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  user,
  actionType,
  onClose,
  onVerify,
  onToggleStatus
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission
   * 
   * Executes the selected action (verify or status change)
   * and handles loading states.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (actionType === 'verify') {
        await onVerify(selectedAction, reason);
      } else if (actionType === 'status') {
        await onToggleStatus(selectedAction as 'suspend' | 'activate', reason);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get modal title based on action type
   * 
   * @returns {string} Modal title
   */
  const getModalTitle = (): string => {
    switch (actionType) {
      case 'verify':
        return 'User Verification';
      case 'status':
        return 'Update User Status';
      case 'role':
        return 'Change User Role';
      default:
        return 'User Action';
    }
  };

  /**
   * Get available actions based on action type
   * 
   * Returns different action options for:
   * - verify: approved/rejected/under_review
   * - status: suspend/activate (based on current status)
   * 
   * @returns {Array} Array of action options with value, label, and color
   */
  const getActionOptions = () => {
    switch (actionType) {
      case 'verify':
        return [
          { value: 'verified', label: 'Approve (Verified)', color: 'text-green-600' },
          { value: 'rejected', label: 'Reject and Deactivate Account', color: 'text-red-600' },
          { value: 'under_review', label: 'Mark Under Review', color: 'text-blue-600' }
        ];
      case 'status':
        return user.isActive 
          ? [{ value: 'suspend', label: 'Deactivate Account', color: 'text-red-600' }]
          : [{ value: 'activate', label: 'Activate Account', color: 'text-green-600' }];
      default:
        return [];
    }
  };

  /**
   * Check if reason is required for selected action
   * 
   * Reason is mandatory for destructive actions:
   * - Rejecting verification
   * - Suspending account
   * 
   * @returns {boolean} True if reason is required
   */
  const isReasonRequired = (): boolean => {
    return selectedAction === 'rejected' || selectedAction === 'suspend';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">User Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {user.fullName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Type:</span> {user.userType}</p>
              <p><span className="font-medium">Current Status:</span> 
                <span className={`ml-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p><span className="font-medium">Verification:</span> 
                <span className="ml-1">{user.verificationStatus}</span>
              </p>
            </div>
          </div>

          {/* Action Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Action
            </label>
            <div className="space-y-2">
              {getActionOptions().map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value={option.value}
                    checked={selectedAction === option.value}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={option.color}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason {isReasonRequired() && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={isReasonRequired()}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter reason for this action..."
            />
          </div>

          {/* Warning Message */}
          {(selectedAction === 'suspend' || selectedAction === 'rejected') && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Warning</p>
                  <p>
                    {selectedAction === 'suspend' 
                      ? 'Suspending this user will cancel all their future appointments and restrict access.'
                      : 'Rejecting this user will permanently deny their verification request.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAction || loading || (isReasonRequired() && !reason.trim())}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserActionModal;
