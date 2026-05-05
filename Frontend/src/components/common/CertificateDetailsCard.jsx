/**
 * Certificate Details Card Component
 * Reusable component to display certificate information with download functionality
 */

import { useDispatch, useSelector } from 'react-redux';
import { downloadCertificatePdfById } from '../../redux/slices/certificateSlice';
import { revokeCertificate, signCertificate, uploadCertificateToBlockchain } from '../../redux/slices/certificateGenSlice';
import { useToast } from './Toast';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';
import { useAuth } from '../../hooks/useAuth';

const CertificateDetailsCard = ({ certificate, allowSign = false, onCertificateSigned }) => {
  const dispatch = useDispatch();
  const { success, error: toastError } = useToast();
  const { hasRole } = useAuth();
  const { downloadLoading } = useSelector((state) => state.certificates);
  const { signLoading, revokeLoading, uploadLoading } = useSelector((state) => state.certificateGen);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const isHrUser = hasRole('ROLE_HR');

  // Format date from YYYY-MM-DD or ISO format to readable format
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

    const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  // Handle certificate download
  const handleDownload = async () => {
    if (!certificate || !certificate.certificateId) {
      toastError('No certificate selected');
      return;
    }

    if (certificate.status !== 'SIGNED' && certificate.status !== 'GENERATED') {
      toastError('Certificate is not available for download');
      return;
    }

    try {
      await dispatch(downloadCertificatePdfById(certificate.certificateId)).unwrap();
      success('Certificate downloaded successfully');
    } catch (err) {
      toastError(err.message || 'Failed to download certificate');
    }
  };

  // Handle certificate signing (Director only)
  const handleSign = async () => {
    if (!certificate || !certificate.certificateId) {
      toastError('No certificate selected');
      return;
    }

    try {
      const result = await dispatch(signCertificate(certificate.certificateId)).unwrap();
      success(result.message || 'Certificate signed successfully');
      setShowSignConfirm(false);
      // Callback to refresh certificate data
      if (onCertificateSigned) {
        onCertificateSigned();
      } 
      // Niyora
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to sign certificate';
      toastError(errorMessage);
    }
  };

  const handleRevoke = async () => {
    if (!certificate || !certificate.certificateId) {
      toastError('No certificate selected');
      return;
    }

    if (certificate.status !== 'SIGNED') {
      toastError('Only signed certificates can be revoked');
      return;
    }

    if (!revokeReason.trim()) {
      toastError('Please provide a revocation reason');
      return;
    }

    try {
      const result = await dispatch(
        revokeCertificate({
          certificateId: certificate.certificateId,
          revocationReason: revokeReason.trim(),
        })
      ).unwrap();
      success(result.message || 'Certificate revoked successfully');
      setShowRevokeModal(false);
      setRevokeReason('');
      if (onCertificateSigned) {
        onCertificateSigned();
      }
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to revoke certificate';
      toastError(errorMessage);
    }
  };

  const handleUploadToBlockchain = async () => {
    if (!certificate || !certificate.certificateId) {
      toastError('No certificate selected');
      return;
    }

    if (certificate.status !== 'SIGNED' && certificate.status !== 'REVOKED') {
      toastError('Only signed or revoked certificates can be uploaded');
      return;
    }

    try {
      const result = await dispatch(
        uploadCertificateToBlockchain(certificate.certificateId)
      ).unwrap();
      success(result.message || 'Certificate uploaded to blockchain');
      setShowUploadConfirm(false);
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to upload certificate to blockchain';
      toastError(errorMessage);
    }
  };

  if (!certificate) return null;

  

  return (
    <div 
      className="bg-white rounded-lg shadow-md border-2 border-amber-500 overflow-hidden relative"
      style={{
        backgroundImage: 'url(/bg1.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
      
      {/* Content with relative positioning to appear above overlay */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-50/95 to-yellow-50/95 border-b-2 border-amber-500 px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Certificate Details</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              certificate.status === 'SIGNED'
                ? 'bg-green-100 text-green-800 border-green-500'
                : certificate.status === 'GENERATED'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-500'
                : 'bg-red-100 text-red-800 border-red-500'
            }`}>
              {certificate.status}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Certificate Information */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Certificate Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Certificate ID</label>
                  <p className="text-gray-900 font-mono mt-1">{certificate.certificateId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Certificate Type</label>
                  <p className="text-gray-900 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      certificate.certificateType === 'COMPLETION'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {certificate.certificateType}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Issue Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(certificate.issueDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Metadata Hash (SHA256)</label>
                  <p className="text-gray-900 font-mono text-xs mt-1 break-all">{certificate.metadataHashSha256 || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Intern Information */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Intern Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Intern ID</label>
                  <p className="text-gray-900 font-mono mt-1">{certificate.internId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Intern Name</label>
                  <p className="text-gray-900 mt-1">{certificate.internName}</p>
                </div>
              </div>
            </div>

            {/* Digital Signature Information */}
            {certificate.digitalSignature && (
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Digital Signature
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Signer Name</label>
                    <p className="text-gray-900 mt-1">{certificate.digitalSignature.signerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Signer Role</label>
                    <p className="text-gray-900 mt-1">{certificate.digitalSignature.signerRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Signature Algorithm</label>
                    <p className="text-gray-900 mt-1">{certificate.digitalSignature.signatureAlgorithm}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Certificate Chain</label>
                    <p className="text-gray-900 mt-1">{certificate.digitalSignature.certificateChainPath}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Signed At</label>
                    <p className="text-gray-900 mt-1">{formatDateTime(certificate.digitalSignature.signedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Path */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">PDF Path</label>
              <p className="text-gray-900 font-mono text-xs mt-1 break-all bg-gray-50 p-2 rounded">
                {certificate.pdfPath}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {(certificate.status === 'SIGNED' || certificate.status === 'GENERATED' || (allowSign && certificate.status === 'GENERATED')) && (
            <div className="mt-4 pt-4 border-t border-amber-300">
              <div className="flex flex-col sm:flex-row gap-3">
                
                {/* Sign Certificate Button (Director only, GENERATED status only) */}
                {allowSign && certificate.status === 'GENERATED' && (
                  <button
                    onClick={() => setShowSignConfirm(true)}
                    disabled={signLoading}
                    className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {signLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Signing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Sign Certificate
                      </>
                    )}
                  </button>
                )}

                {/* Download Button */}
                {(certificate.status === 'SIGNED' || certificate.status === 'GENERATED') && (
                  <button
                    onClick={handleDownload}
                    disabled={downloadLoading}
                    className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {downloadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Certificate PDF
                      </>
                    )}
                  </button>
                )}

                {isHrUser && certificate.status === 'SIGNED' && (
                  <button
                    onClick={() => setShowRevokeModal(true)}
                    disabled={revokeLoading}
                    className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {revokeLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Revoking...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Revoke Certificate
                      </>
                    )}
                  </button>
                )}
{/* NIYORA CHECK */}
                {isHrUser && certificate.uploaded === false && (  certificate.status === 'SIGNED' || certificate.status === 'REVOKED') && (
                  <button
                    onClick={() => setShowUploadConfirm(true)}
                    disabled={uploadLoading}
                    className="flex-1 sm:flex-none px-5 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Upload to Blockchain
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Certificate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSignConfirm}
        title="Sign Certificate"
        message={`Are you sure you want to sign this certificate? This action will apply your digital signature and cannot be undone.`}
        confirmText="Sign Certificate"
        cancelText="Cancel"
        onConfirm={handleSign}
        onClose={() => setShowSignConfirm(false)}
        confirmColor="blue"
      />

      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Certificate"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Provide a reason for revoking this certificate.
          </p>
          <textarea
            value={revokeReason}
            onChange={(event) => setRevokeReason(event.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="Enter revocation reason"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRevoke}
              disabled={revokeLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {revokeLoading ? 'Revoking...' : 'Revoke'}
            </button>
            <button
              onClick={() => setShowRevokeModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showUploadConfirm }
        loading={uploadLoading}
        title="Upload Certificate"
        message="Upload this certificate to the blockchain?"
        confirmText="Upload"
        cancelText="Cancel"
        onConfirm={handleUploadToBlockchain}
        onClose={() => setShowUploadConfirm(false)}
        confirmColor="green"
      />
    </div>
  );
};

export default CertificateDetailsCard;
