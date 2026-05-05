import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication
 * Optionally checks for specific roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {string[]} props.roles - Required roles (optional)
 * @param {string} props.redirectTo - Redirect path if not authorized
 * @param {boolean} props.requireAll - Require all roles vs any role
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/auth',
  requireAll = false 
}) => {
  const { isAuthenticated, isInitialized, hasRole, hasAnyRole, hasAllRoles, user } = useAuth();


  // Wait for auth initialization
  if (!isInitialized) {
    // console.log('ProtectedRoute: waiting for initialization');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // console.log('ProtectedRoute: not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (roles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? hasAllRoles(roles) 
      : hasAnyRole(roles);

    // console.log('ProtectedRoute: role check result:', hasRequiredRoles);

    if (!hasRequiredRoles) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-500 mb-4"
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this resource.
            </p>
            <p className="text-sm text-gray-500">
              Required role{roles.length > 1 ? 's' : ''}: <strong>{roles.join(', ')}</strong>
            </p>
          </div>
        </div>
      );
    }
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
