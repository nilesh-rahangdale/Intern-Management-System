/**
 * Unauthorized Page
 * Displayed when user doesn't have required permissions
 */

import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <svg
          className="mx-auto h-20 w-20 text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource.
        </p>
        {user && (
          <p className="text-sm text-gray-500 mb-6">
            Current role: <strong>{user.role?.[0]?.replace('ROLE_', '') || 'Unknown'}</strong>
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
