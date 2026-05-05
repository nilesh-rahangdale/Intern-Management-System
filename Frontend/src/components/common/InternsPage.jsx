/**
 * Interns Management Page
 * List, search, and filter interns with table view
 * Reusable for both HR and Director roles
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllInterns, searchByName } from '../../redux/slices/internSlice';

const InternsPage = ({ 
  showAddButton = true,  // Control "Add Intern" button visibility
  basePath = '/hr'       // Base path for navigation (hr or director)
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { interns, searchResults, loading, error } = useSelector((state) => state.interns);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    internId: '',
    status: 'ALL',
    internshipType: 'ALL',
  });

  // Fetch all interns on mount
  useEffect(() => {
    dispatch(getAllInterns());
  }, [dispatch]);

  // Debounced search by name
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        dispatch(searchByName(searchTerm));
      } 
      // else {
      //   dispatch(getAllInterns());
      // }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Get display interns (search results or all interns)
  const displayInterns = searchTerm.trim() ? searchResults : interns;

  // Apply filters
  const filteredInterns = displayInterns.filter((intern) => {
    // Filter by Intern ID
    if (filters.internId && !intern.internId.toLowerCase().includes(filters.internId.toLowerCase())) {
      return false;
    }

    // Filter by Status
    if (filters.status !== 'ALL' && intern.status !== filters.status) {
      return false;
    }

    // Filter by Internship Type
    if (filters.internshipType !== 'ALL' && intern.internshipType !== filters.internshipType) {
      return false;
    }

    return true;
  });

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      internId: '',
      status: 'ALL',
      internshipType: 'ALL',
    });
    dispatch(getAllInterns());
  };

  // Calculate duration in months
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    // Add time component to avoid timezone issues with YYYY-MM-DD format
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.round(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
              <p className="text-sm text-gray-600 mt-1">
                {showAddButton ? 'Manage intern records and information' : 'View intern records and information'}
              </p>
            </div>
            {showAddButton && (
              <button
                onClick={() => navigate(`${basePath}/interns/add`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Intern
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Intern Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Intern ID</label>
              <input
                type="text"
                placeholder="Filter by ID..."
                value={filters.internId}
                onChange={(e) => setFilters({ ...filters, internId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Internship Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Internship Type</label>
              <select
                value={filters.internshipType}
                onChange={(e) => setFilters({ ...filters, internshipType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredInterns.length}</span> intern{filteredInterns.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading interns...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading interns</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredInterns.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No interns found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filters.internId || filters.status !== 'ALL' || filters.internshipType !== 'ALL'
                ? 'Try adjusting your search or filters'
                : showAddButton 
                  ? 'Get started by adding your first intern'
                  : 'No interns available to display'}
            </p>
            {showAddButton && !searchTerm && filters.status === 'ALL' && filters.internshipType === 'ALL' && (
              <button
                onClick={() => navigate(`${basePath}/interns/add`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add First Intern
              </button>
            )}
          </div>
        ) : (
          /* Interns Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intern ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Internship Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterns.map((intern, index) => (
                    <tr
                      key={intern.internId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {intern.internId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{intern.fullName}</div>
                        <div className="text-xs text-gray-500">{intern.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{intern.department || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            intern.status === 'ONGOING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : intern.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {intern.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            intern.internshipType === 'PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {intern.internshipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {calculateDuration(intern.startDate, intern.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`${basePath}/interns/${intern.internId}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View More →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternsPage;
