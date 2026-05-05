import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDashboardStats } from '../redux/slices/userSlice';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUserDashboardStats());
  }, [dispatch]);

  console.log('UserDashboard - Loading:', loading);
  console.log('UserDashboard - Error:', error);
  console.log('UserDashboard - DashboardStats:', dashboardStats);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No Data</p>
          <p>Dashboard statistics are not available.</p>
        </div>
      </div>
    );
  }

  const { totalUsers, userStatusStats, userRoleStats, recentUsers } = dashboardStats;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{userStatusStats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Inactive Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{userStatusStats.inactive}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Blocked Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{userStatusStats.blocked}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Role Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-gray-700 font-medium">Admin</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userRoleStats.admin}</span>
                <span className="text-gray-500 text-sm">
                  ({((userRoleStats.admin / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userRoleStats.admin / totalUsers) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span className="text-gray-700 font-medium">HR</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userRoleStats.hr}</span>
                <span className="text-gray-500 text-sm">
                  ({((userRoleStats.hr / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userRoleStats.hr / totalUsers) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span className="text-gray-700 font-medium">Director</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userRoleStats.director}</span>
                <span className="text-gray-500 text-sm">
                  ({((userRoleStats.director / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userRoleStats.director / totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* User Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700 font-medium">Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userStatusStats.active}</span>
                <span className="text-gray-500 text-sm">
                  ({((userStatusStats.active / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userStatusStats.active / totalUsers) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-700 font-medium">Inactive</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userStatusStats.inactive}</span>
                <span className="text-gray-500 text-sm">
                  ({((userStatusStats.inactive / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userStatusStats.inactive / totalUsers) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700 font-medium">Blocked</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{userStatusStats.blocked}</span>
                <span className="text-gray-500 text-sm">
                  ({((userStatusStats.blocked / totalUsers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(userStatusStats.blocked / totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Registered Users</h2>
        {recentUsers && recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.role && user.role.map((role, index) => {
                          const roleDisplay = role.replace('ROLE_', '');
                          return (
                            <span key={index} className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              roleDisplay === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              roleDisplay === 'HR' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-cyan-100 text-cyan-800'
                            }`}>
                              {roleDisplay}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        user.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent users found</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
