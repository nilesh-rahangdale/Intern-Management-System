/**
 * HR Dashboard Page
 * Landing page showing intern and certificate statistics
 * Provides quick overview and action buttons for HR operations
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getInternDashboardStats } from '../../redux/slices/internSlice';

const HRDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector((state) => state.interns);

  useEffect(() => {
    dispatch(getInternDashboardStats());
  }, [dispatch]);

  // Calculate statistics
  const totalInterns = dashboardStats?.totalInterns || 0;
  const ongoingInterns = dashboardStats?.internStatusStats?.ongoing || 0;
  const completedInterns = dashboardStats?.internStatusStats?.completed || 0;
  const totalCertificates = dashboardStats?.totalCertificates || 0;
  const recentInterns = dashboardStats?.recentInterns || [];

  // Statistics cards configuration
  const statsCards = [
    {
      title: 'Total Interns',
      value: totalInterns,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
    },
    {
      title: 'Ongoing Internships',
      value: ongoingInterns,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
    },
    {
      title: 'Completed Internships',
      value: completedInterns,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-500',
    },
    {
      title: 'Certificates Generated',
      value: totalCertificates,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-500',
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      name: 'Add Intern',
      description: 'Register a new intern',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/hr/interns/add'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Manage Interns',
      description: 'View and manage all interns',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onClick: () => navigate('/hr/interns'),
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      name: 'Certificates',
      description: 'Generate and manage certificates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => navigate('/hr/certificates'),
      color: 'bg-violet-500 hover:bg-violet-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow border border-gray-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <div className={stat.textColor}>{stat.icon}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`${action.color} text-white rounded-lg p-5 text-left transition-colors`}
                  >
                    <div className="flex items-center mb-2">
                      {action.icon}
                    </div>
                    <h3 className="text-base font-semibold">{action.name}</h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Interns */}
            {recentInterns.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Interns</h2>
                  <button
                    onClick={() => navigate('/hr/interns')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Domain
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Course
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentInterns.slice(0, 5).map((intern) => (
                        <tr
                          key={intern.internId}
                          onClick={() => navigate(`/hr/interns/${intern.intern}`)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{intern.fullName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{intern.email}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{intern.domain}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{intern.course}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                intern.status === 'ONGOING'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : intern.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}
                            >
                              {intern.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HRDashboard;
