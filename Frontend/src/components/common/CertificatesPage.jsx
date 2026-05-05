/**
 * Certificates Page
 * Search certificates by Certificate ID or Intern ID
 * Reusable for both HR and Director roles
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllCertificates, getCertificateById, clearSelectedCertificate } from '../../redux/slices/certificateSlice';
import { generateCertificate } from '../../redux/slices/certificateGenSlice';
import { useToast } from '../../components/common/Toast';

const CertificatesPage = ({ 
  allowGenerate = true,  // HR can generate certificates, Director cannot
  basePath = '/hr'
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { certificates, loading } = useSelector((state) => state.certificates);
  const { loading: generateLoading } = useSelector((state) => state.certificateGen);

  // // Debug log to check props
  // console.log('CertificatesPage - allowGenerate:', allowGenerate, 'allowSign:', allowSign);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [listSearch, setListSearch] = useState('');

  // Generate Certificate State
  const [generateInternId, setGenerateInternId] = useState('');
  const [generateCertType, setGenerateCertType] = useState('COMPLETION');
  const [generateError, setGenerateError] = useState('');

  // Clear selected certificate on mount to prevent showing stale data from other pages
  useEffect(() => {
    dispatch(clearSelectedCertificate());
  }, [dispatch]);

  // Load certificates list with optional status filter
  useEffect(() => {
    const status = statusFilter === 'ALL' ? undefined : statusFilter;
    dispatch(getAllCertificates({ status }));
  }, [dispatch, statusFilter]);

  const filteredCertificates = certificates.filter((certificate) => {
    if (!listSearch.trim()) return true;
    const value = listSearch.trim().toLowerCase();
    return (
      certificate.certificateId?.toLowerCase().includes(value) ||
      certificate.internName?.toLowerCase().includes(value)
    );
  });

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    const trimmedInternId = generateInternId.trim();
    
    if (!trimmedInternId) {
      setGenerateError('Please enter an Intern ID');
      return;
    }

    if (!trimmedInternId.includes('INT')) {
      setGenerateError('Invalid Intern ID format. It should contain "INT"');
      return;
    }

    setGenerateError('');

    try {
      const result = await dispatch(generateCertificate({ internId: trimmedInternId, certificateType: generateCertType })).unwrap();
      success('Certificate generated successfully');
      
      // Fetch and display the generated certificate details
      if (result.data && result.data.certificateId) {
        await dispatch(getCertificateById(result.data.certificateId)).unwrap();
      }
      
      // Clear form
      setGenerateInternId('');
      setGenerateCertType('COMPLETION');
    } catch (err) {
      // Extract error message from nested error structure
      const errorMessage = err.error?.details || err.message || 'Failed to generate certificate';
      toastError(errorMessage);
      setGenerateError(errorMessage);
    }
  };


  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search and manage certificates</p>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Search</label>
              <input
                type="text"
                placeholder="Certificate ID or Intern Name"
                value={listSearch}
                onChange={(event) => setListSearch(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All</option>
                <option value="GENERATED">GENERATED</option>
                <option value="SIGNED">SIGNED</option>
                <option value="REVOKED">REVOKED</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                Loading certificates...
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600 mt-4">
              No certificates match the current filters.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertificates.map((certificate) => (
                    <tr key={certificate.certificateId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {certificate.certificateId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {certificate.internName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          certificate.status === 'SIGNED'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : certificate.status === 'GENERATED'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {certificate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigate(`${basePath}/certificates/${certificate.certificateId}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Certificate Card - Only for HR */}
        {allowGenerate && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-5">
            <h2 className="text-base font-medium text-gray-700 mb-3">Generate Certificate</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Intern ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., DRDO2026INT00012"
                value={generateInternId}
                onChange={(e) => {
                  setGenerateInternId(e.target.value);
                  setGenerateError('');
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all ${
                  generateError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Certificate Type <span className="text-red-500">*</span>
              </label>
              <select
                value={generateCertType}
                onChange={(e) => setGenerateCertType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all"
              >
                <option value="COMPLETION">COMPLETION</option>
                <option value="PARTICIPATION">PARTICIPATION</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleGenerateCertificate}
                disabled={generateLoading || !generateInternId.trim()}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {generateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {generateError && (
            <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">{generateError}</p>
            </div>
          )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CertificatesPage;
