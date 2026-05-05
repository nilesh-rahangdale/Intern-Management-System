/**
 * Blockchain Connect Page (HR)
 * Search and list blockchain certificates
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  clearError,
  getAllCertificatesFromBlockchain,
  getCertificateFromBlockchain,
} from '../../redux/slices/certificateSlice';
import { useToast } from '../../components/common/Toast';

const BlockchainConnect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    blockchainCertificates,
    blockchainCertificate,
    loading,
    error,
  } = useSelector((state) => state.certificates);

  const [searchId, setSearchId] = useState('');
  const hasFetchedCertificates = useRef(false);

  useEffect(() => {
    if (hasFetchedCertificates.current) return;
    hasFetchedCertificates.current = true;
    dispatch(getAllCertificatesFromBlockchain());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSearch = async () => {
    const trimmed = searchId.trim();
    if (!trimmed) {
      toast.error('Enter a certificate ID');
      return;
    }

    const result = await dispatch(getCertificateFromBlockchain(trimmed));
    if (result.type === 'certificates/getCertificateFromBlockchain/fulfilled') {
      toast.success('Certificate retrieved successfully');
    }
  };

  const filteredCertificates = useMemo(() => {
    const value = searchId.trim().toLowerCase();
    if (!value) return blockchainCertificates;
    return blockchainCertificates.filter((certificate) =>
      certificate.certificateId?.toLowerCase().includes(value)
    );
  }, [blockchainCertificates, searchId]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Blockchain Connect</h1>
          <p className="text-sm text-gray-500 mt-1">Search and view blockchain certificates</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-5">
          <h2 className="text-base font-medium text-gray-700 mb-3">Search Certificate</h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Certificate ID
              </label>
              <input
                type="text"
                placeholder="e.g., CERT-2026-001"
                value={searchId}
                onChange={(event) => setSearchId(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {blockchainCertificate && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800">Search Result</p>
                  <p className="text-sm text-blue-700">
                    {blockchainCertificate.certificateId} - {blockchainCertificate.internName}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/hr/blockchain/${blockchainCertificate.certificateId}`)
                  }
                  className="text-blue-700 font-semibold text-sm hover:text-blue-900"
                >
                  View More
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-700">Blockchain Certificates</h2>
            <span className="text-xs text-gray-500">
              {filteredCertificates.length} items
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                Loading certificates...
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
              No blockchain certificates available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intern Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
                          onClick={() => navigate(`/hr/blockchain/${certificate.certificateId}`)}
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
      </div>
    </DashboardLayout>
  );
};

export default BlockchainConnect;
