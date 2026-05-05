/**
 * Certificate Details Page
 * Displays a single certificate with actions and back navigation
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import CertificateDetailsCard from '../../components/common/CertificateDetailsCard';
import { clearSelectedCertificate, getCertificateById } from '../../redux/slices/certificateSlice';

const CertificateDetailsPage = ({ allowSign = false, basePath = '/hr' }) => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCertificate, loading, error } = useSelector((state) => state.certificates);

  useEffect(() => {
    if (certificateId) {
      dispatch(getCertificateById(certificateId));
    }

    return () => {
      dispatch(clearSelectedCertificate());
    };
  }, [dispatch, certificateId]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <button
            onClick={() => navigate(`${basePath}/certificates`)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Certificates
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Certificate Details</h1>

        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              Loading certificate...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : selectedCertificate ? (
          <CertificateDetailsCard
            certificate={selectedCertificate}
            allowSign={allowSign}
            onCertificateSigned={() => dispatch(getCertificateById(certificateId))}
          />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Certificate not found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CertificateDetailsPage;
