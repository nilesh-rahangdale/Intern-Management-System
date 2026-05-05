import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../layout/DashboardLayout';
import { changePassword } from '../../redux/slices/userSlice';
import { confirmEmail } from '../../redux/slices/authSlice';
import { useToast } from './Toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { success, error } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { loading: userLoading } = useSelector((state) => state.users);
  const { loading: authLoading } = useSelector((state) => state.auth);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Confirm Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [otp, setOtp] = useState('');

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    try {
      const result = await dispatch(
        changePassword({
          id: user.id,
          passwordData: {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
            confirmNewPassword: passwordData.confirmPassword,
          },
        })
      ).unwrap();

      // Show success message
      success(result.message || 'Password changed successfully');
      
      // Close modal and clear form
      setShowPasswordModal(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // Handle different error response structures
      let errorMessage = 'Failed to change password. Please try again.';
      
      // Log the full error for debugging
      console.error('Password change error:', err);
      
      // Extract error from various possible structures
      if (err?.error?.details) {
        errorMessage = err.error.details;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.error) {
        errorMessage = typeof err.error === 'string' ? err.error : 'Failed to change password';
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Always show error toast
      error(errorMessage);
    }
  };

  // Handle Email Confirmation
  const handleEmailConfirmation = async (e) => {
    e.preventDefault();

    if (!otp || otp.trim().length === 0) {
      error('Please enter the OTP');
      return;
    }

    if (!user?.email) {
      error('User email not found');
      return;
    }

    try {
      const result = await dispatch(
        confirmEmail({ email: user.email, otp: otp.trim() })
      ).unwrap();

      // Show success message
      success(result.message || 'Email confirmed successfully');
      
      // Close modal
      setShowEmailModal(false);
      setOtp('');
      
      // Reload the page to refresh user data and show updated status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      // Handle different error response structures
      let errorMessage = 'Failed to confirm email';
      
      // Extract error from various possible structures
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error?.details) {
        errorMessage = err.error.details;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('Email confirmation error:', err);
      error(errorMessage);
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-violet-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with Avatar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-5">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-800">{user?.fullName || 'User'}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{user?.email || 'No email'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-600">
                    {user?.roles?.[0]?.replace('ROLE_', '') || 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-600">
                    {user?.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        {/* User Information Grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Contact Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-base font-medium text-gray-700">Contact Information</h2>
            </div>
            <div className="space-y-3.5">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                  <p className="text-sm text-gray-700 break-all">{user?.email || 'N/A'}</p>
                </div>
              </div>
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                  <p className="text-sm text-gray-700">{user?.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <h2 className="text-base font-medium text-gray-700">Account Details</h2>
            </div>
            <div className="space-y-3.5">
              {/* User ID */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">User ID</p>
                  <p className="font-mono text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">{user?.id || 'N/A'}</p>
                </div>
              </div>
              {/* Account Created */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Account Created</p>
                  <p className="text-sm text-gray-700">{formatDateTime(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-base font-medium text-gray-700">Additional Information</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Created By */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <p className="text-sm text-gray-700">{user?.createdByName || 'N/A'}</p>
            </div>
            {/* Last Login */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Login</p>
              <p className="text-sm text-gray-700">{user?.lastLogin ? formatDateTime(user.lastLogin) : 'N/A'}</p>
            </div>
            {/* Updated At */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm text-gray-700">{user?.updatedAt ? formatDateTime(user.updatedAt) : 'N/A'}</p>
            </div>
            {/* Created By ID */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Created By ID</p>
              <p className="text-sm text-gray-700">{user?.createdById || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-base font-medium text-gray-700">Security Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Change Password Button */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Change Password
            </button>

            {/* Confirm Email Button */}
            {!user?.isEmailVerified && (
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg font-medium transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Confirm Email
              </button>
            )}
          </div>
        </div>

        {/* Admin Contact Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <div className="flex gap-2.5">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800 mb-1 text-sm">Information Update Policy</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                To update your personal information (name, email, role, etc.), please contact the
                system administrator. Only password changes and email verification can be
                performed directly from this page.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              {/* Old Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Email</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setOtp('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEmailConfirmation}>
              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please enter the 6-digit OTP sent to your email address.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setOtp('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Confirming...' : 'Confirm Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
