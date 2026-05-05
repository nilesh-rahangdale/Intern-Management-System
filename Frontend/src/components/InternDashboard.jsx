import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getInternDashboardStats } from '../redux/slices/internSlice';

const InternDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.interns);

  useEffect(() => {
    dispatch(getInternDashboardStats());
  }, [dispatch]);

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
    return null;
  }

  const {
    totalInterns,
    totalCertificates,
    internStatusStats,
    certificateStatusStats,
    internshipTypeStats,
    recentInterns
  } = dashboardStats;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Intern Management Dashboard</h1>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Interns */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Interns</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalInterns}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Certificates */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalCertificates}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Interns */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Interns</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{internStatusStats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completed Interns */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{internStatusStats.completed}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Intern Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Intern Status Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700 font-medium">Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{internStatusStats.active}</span>
                <span className="text-gray-500 text-sm">
                  ({((internStatusStats.active / totalInterns) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(internStatusStats.active / totalInterns) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span className="text-gray-700 font-medium">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{internStatusStats.completed}</span>
                <span className="text-gray-500 text-sm">
                  ({((internStatusStats.completed / totalInterns) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(internStatusStats.completed / totalInterns) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700 font-medium">Terminated</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{internStatusStats.terminated}</span>
                <span className="text-gray-500 text-sm">
                  ({((internStatusStats.terminated / totalInterns) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(internStatusStats.terminated / totalInterns) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Certificate Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Certificate Status Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-700 font-medium">Pending</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{certificateStatusStats.pending}</span>
                <span className="text-gray-500 text-sm">
                  ({((certificateStatusStats.pending / totalCertificates) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(certificateStatusStats.pending / totalCertificates) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-700 font-medium">HR Approved</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{certificateStatusStats.hrApproved}</span>
                <span className="text-gray-500 text-sm">
                  ({((certificateStatusStats.hrApproved / totalCertificates) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(certificateStatusStats.hrApproved / totalCertificates) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700 font-medium">Director Approved</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{certificateStatusStats.directorApproved}</span>
                <span className="text-gray-500 text-sm">
                  ({((certificateStatusStats.directorApproved / totalCertificates) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(certificateStatusStats.directorApproved / totalCertificates) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700 font-medium">Rejected</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-800">{certificateStatusStats.rejected}</span>
                <span className="text-gray-500 text-sm">
                  ({((certificateStatusStats.rejected / totalCertificates) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(certificateStatusStats.rejected / totalCertificates) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Internship Type Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Internship Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <p className="text-blue-600 text-sm font-medium mb-2">Full-Time</p>
            <p className="text-3xl font-bold text-blue-800">{internshipTypeStats.fullTime}</p>
            <p className="text-blue-600 text-xs mt-2">
              {((internshipTypeStats.fullTime / totalInterns) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <p className="text-green-600 text-sm font-medium mb-2">Part-Time</p>
            <p className="text-3xl font-bold text-green-800">{internshipTypeStats.partTime}</p>
            <p className="text-green-600 text-xs mt-2">
              {((internshipTypeStats.partTime / totalInterns) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <p className="text-purple-600 text-sm font-medium mb-2">Remote</p>
            <p className="text-3xl font-bold text-purple-800">{internshipTypeStats.remote}</p>
            <p className="text-purple-600 text-xs mt-2">
              {((internshipTypeStats.remote / totalInterns) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <p className="text-orange-600 text-sm font-medium mb-2">On-Site</p>
            <p className="text-3xl font-bold text-orange-800">{internshipTypeStats.onSite}</p>
            <p className="text-orange-600 text-xs mt-2">
              {((internshipTypeStats.onSite / totalInterns) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Recent Interns */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Added Interns (Last 5)</h2>
        {recentInterns && recentInterns.length > 0 ? (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInterns.map((intern) => (
                  <tr key={intern.internId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intern.internId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {intern.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intern.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        intern.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        intern.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {intern.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {intern.internshipType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(intern.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent interns found</p>
        )}
      </div>
    </div>
  );
};

export default InternDashboard;
