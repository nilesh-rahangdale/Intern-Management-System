import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * SessionMonitor Component
 * 
 * Monitors user session and handles:
 * 1. Session expiry warnings
 * 2. Automatic logout on expiry
 * 3. Activity tracking
 * 4. Idle timeout detection
 * 
 * @param {Object} props
 * @param {number} props.warningTime - Minutes before expiry to show warning (default: 5)
 * @param {number} props.idleTimeout - Minutes of inactivity before logout (default: 30)
 */
const SessionMonitor = ({ warningTime = 5, idleTimeout = 30 }) => {
  const { 
    isAuthenticated, 
    getSessionTimeRemaining, 
    isSessionExpired,
    trackActivity,
    forceLogoutUser,
    refreshUser,
  } = useAuth();

  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Track user activity
  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      trackActivity();
    }
  }, [isAuthenticated, trackActivity]);

  // Check session status
  const checkSession = useCallback(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    if (isSessionExpired()) {
      setShowWarning(false);
      forceLogoutUser();
      return;
    }

    const remaining = getSessionTimeRemaining();
    setTimeRemaining(remaining);

    if (remaining <= warningTime && remaining > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isAuthenticated, isSessionExpired, getSessionTimeRemaining, warningTime, forceLogoutUser]);

  // Extend session
  const handleExtendSession = async () => {
    await refreshUser();
    setShowWarning(false);
  };

  // Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, handleActivity]);

  // Session check interval
  useEffect(() => {
    if (!isAuthenticated) return;

    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  // Warning modal
  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <svg
            className="h-8 w-8 text-yellow-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Session Expiring Soon</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Your session will expire in <strong className="text-red-600">{timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}</strong>.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Click "Stay Logged In" to extend your session, or you will be automatically logged out.
        </p>

        <div className="flex gap-3">
          {/* <button
            onClick={handleExtendSession}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Stay Logged In
          </button> */}
          <button
            onClick={forceLogoutUser}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionMonitor;
