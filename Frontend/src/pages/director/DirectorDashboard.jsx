/**
 * Director Dashboard Page
 * Landing page showing certificates awaiting signature and statistics
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getInternDashboardStats } from '../../redux/slices/internSlice';

const DirectorDashboard = () => {
  const dispatch = useDispatch();
  
  const { dashboardStats, loading, error } = useSelector((state) => state.interns);

  useEffect(() => {
    dispatch(getInternDashboardStats());
  }, [dispatch]);

  // Calculate statistics
  const totalCertificates = dashboardStats?.totalCertificates || 0;
  const generatedCerts = dashboardStats?.certificateStatusStats?.generated || 0;
  const signedCerts = dashboardStats?.certificateStatusStats?.signed || 0;
  const revokedCerts = dashboardStats?.certificateStatusStats?.revoked || 0;

  // Intern statistics
  const totalInterns = dashboardStats?.totalInterns || 0;
  const ongoingInterns = dashboardStats?.internStatusStats?.ongoing || 0;
  const completedInterns = dashboardStats?.internStatusStats?.completed || 0;

  // Calculate percentages for progress indicators
  const ongoingPercentage = totalInterns > 0 ? ((ongoingInterns / totalInterns) * 100).toFixed(1) : 0;
  const completedPercentage = totalInterns > 0 ? ((completedInterns / totalInterns) * 100).toFixed(1) : 0;
  const signedPercentage = totalCertificates > 0 ? ((signedCerts / totalCertificates) * 100).toFixed(1) : 0;
  const pendingPercentage = totalCertificates > 0 ? ((generatedCerts / totalCertificates) * 100).toFixed(1) : 0;

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
      title: 'Total Certificates',
      value: totalCertificates,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-500',
    },
    {
      title: 'Awaiting Signature',
      value: generatedCerts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
    },
    {
      title: 'Signed Certificates',
      value: signedCerts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-500',
    },
    {
      title: 'Revoked Certificates',
      value: revokedCerts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Director Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Review and sign certificates</p>
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
            {/* Hero Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Intern Analytics Card */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Intern Analytics</h3>
                  <div className="bg-blue-200 rounded-lg p-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-blue-700">{totalInterns}</div>
                <p className="text-blue-600 text-sm mb-6">Total Interns Registered</p>
                
                {/* Progress Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Ongoing</span>
                      <span className="text-sm font-bold text-gray-800">{ongoingInterns} ({ongoingPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${ongoingPercentage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Completed</span>
                      <span className="text-sm font-bold text-gray-800">{completedInterns} ({completedPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completedPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Analytics Card */}
              <div className="bg-linear-to-br from-purple-50 to-pink-100 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Certificate Analytics</h3>
                  <div className="bg-purple-200 rounded-lg p-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2 text-purple-700">{totalCertificates}</div>
                <p className="text-purple-600 text-sm mb-6">Total Certificates Issued</p>
                
                {/* Progress Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Awaiting Signature</span>
                      <span className="text-sm font-bold text-gray-800">{generatedCerts} ({pendingPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pendingPercentage}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Signed & Complete</span>
                      <span className="text-sm font-bold text-gray-800">{signedCerts} ({signedPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${signedPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Action Required Banner */}
            {generatedCerts > 0 && (
              <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="bg-amber-400 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Action Required</h3>
                    <p className="text-gray-700 mb-3">
                      You have <span className="font-bold text-amber-600">{generatedCerts} certificate{generatedCerts !== 1 ? 's' : ''}</span> waiting for your digital signature.
                    </p>
                    <button
                      onClick={() => window.location.href = '/director/certificates'}
                      className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Sign Certificates Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Certificate Status Breakdown</h3>
                <div className="bg-linear-to-r from-purple-200 to-pink-200 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Live Data
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Signed Certificates */}
                <div className="text-center p-4 bg-linear-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700 mb-1">{signedCerts}</div>
                  <p className="text-sm font-medium text-emerald-600">Signed</p>
                  <div className="mt-2 text-xs text-emerald-500">{signedPercentage}% of total</div>
                </div>

                {/* Pending Certificates */}
                <div className="text-center p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-1">{generatedCerts}</div>
                  <p className="text-sm font-medium text-amber-600">Pending</p>
                  <div className="mt-2 text-xs text-amber-500">{pendingPercentage}% awaiting signature</div>
                </div>

                {/* Revoked Certificates */}
                <div className="text-center p-4 bg-linear-to-br from-rose-50 to-red-50 rounded-xl border border-rose-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-rose-700 mb-1">{revokedCerts}</div>
                  <p className="text-sm font-medium text-rose-600">Revoked</p>
                  <div className="mt-2 text-xs text-rose-500">Invalid certificates</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DirectorDashboard;
