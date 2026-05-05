/**
 * Intern Details Page
 * View intern information with role-based actions
 * Reusable for both HR and Director roles
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CertificateDetailsCard from '../../components/common/CertificateDetailsCard';
import { 
  getInternById, 
  updateIntern, 
  updateInternStatus,
  changeInternshipType 
} from '../../redux/slices/internSlice';
import { generateCertificate, signCertificate } from '../../redux/slices/certificateGenSlice';
import { getCertificatesByInternId, clearSelectedCertificate, clearCertificates } from '../../redux/slices/certificateSlice';
import { useToast } from '../../components/common/Toast';





const InternDetailsPage = ({ 
  allowedActions = ['update', 'generateCert', 'changeType', 'changeStatus', 'signCert'],  // Control which actions to show
  basePath = '/hr',
  allowSign = false  // Base path for navigation (hr or director)
}) => {



  const { internId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error: toastError, warning } = useToast();

  // Format date from YYYY-MM-DD to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Ensure date is in YYYY-MM-DD format for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise convert
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { selectedIntern, loading, actionLoading } = useSelector((state) => state.interns);
  const { loading: certLoading, signLoading } = useSelector((state) => state.certificateGen);
  const { certificates, selectedCertificate, loading: certFetchLoading } = useSelector((state) => state.certificates);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});

  // Certificate generation modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [certificateType, setCertificateType] = useState('COMPLETION');

  // Status and Type change modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState('');

  // Sign certificate modal
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [certificateStatusFilter, setCertificateStatusFilter] = useState('ALL');

  // Fetch intern details on mount
  useEffect(() => {
    if (internId) {
      dispatch(getInternById(internId));
    }

    // Cleanup: clear selected certificate when leaving this page
    return () => {
      dispatch(clearSelectedCertificate());
    };
  }, [dispatch, internId]);

  // Fetch certificates when filter changes
  useEffect(() => {
    if (!internId) return;

    const status = certificateStatusFilter === 'ALL' ? undefined : certificateStatusFilter;
    dispatch(clearCertificates());
    setSelectedCertificateId(null);
    dispatch(getCertificatesByInternId({ internId, status }));
  }, [dispatch, internId, certificateStatusFilter]);

  // Initialize edit data when intern is loaded
  useEffect(() => {
    if (selectedIntern && !editData) {
      setEditData(selectedIntern);
    }
  }, [selectedIntern, editData]);

  const filteredCertificates = useMemo(() => {
    if (certificateStatusFilter === 'ALL') {
      return certificates;
    }

    return certificates.filter(
      (certificate) => certificate.status === certificateStatusFilter
    );
  }, [certificates, certificateStatusFilter]);

  useEffect(() => {
    if (filteredCertificates.length === 0) {
      setSelectedCertificateId(null);
      return;
    }

    const hasSelected = filteredCertificates.some(
      (certificate) => certificate.certificateId === selectedCertificateId
    );

    if (!hasSelected) {
      setSelectedCertificateId(filteredCertificates[0].certificateId);
    }
  }, [filteredCertificates, selectedCertificateId]);

  const displayCertificate = useMemo(() => {
    if (selectedCertificateId) {
      return (
        filteredCertificates.find(
          (certificate) => certificate.certificateId === selectedCertificateId
        ) || null
      );
    }

    return filteredCertificates[0] || selectedCertificate || null;
  }, [filteredCertificates, selectedCertificate, selectedCertificateId]);

  // Handle edit mode toggle
  const handleUpdateClick = () => {
    setIsEditing(true);
    setEditData(selectedIntern);
  };

  // Handle input change in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!editData.fullName?.trim()) newErrors.fullName = 'Name is required';
    if (!editData.email?.trim()) newErrors.email = 'Email is required';
    if (!editData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!editData.instituteName?.trim()) newErrors.instituteName = 'College is required';
    if (!editData.startDate) newErrors.startDate = 'Start date is required';
    if (!editData.endDate) newErrors.endDate = 'End date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toastError('Please fix the errors in the form');
      return;
    }

    try {
      const result = await dispatch(updateIntern(editData)).unwrap();
      success(result.message || 'Intern updated successfully');
      setIsEditing(false);
      dispatch(getInternById(internId)); // Refresh data
    } catch (err) {
      toastError(err.message || 'Failed to update intern');
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(selectedIntern);
    setErrors({});
  };

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    try {
      const result = await dispatch(
        generateCertificate({ internId, certificateType })
      ).unwrap();
      success(result.message || 'Certificate generated successfully');
      setShowCertModal(false);
      setCertificateType('COMPLETION');
      // Refresh certificate data
      dispatch(getCertificatesByInternId({ internId }));
    } catch (err) {
      // Extract error message from nested error structure
      const errorMessage = err.error?.details || err.message || 'Failed to generate certificate';
      toastError(errorMessage);
    }
  };

  // Handle sign certificate (for Director)
  const handleSignCertificate = async () => {
    if (!displayCertificate || !displayCertificate.certificateId) {
      toastError('No certificate found to sign');
      return;
    }

    try {
      const result = await dispatch(signCertificate(displayCertificate.certificateId)).unwrap();
      success(result.message || 'Certificate signed successfully');
      setShowSignModal(false);
      // Refresh certificate data
      dispatch(getCertificatesByInternId({ internId }));
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to sign certificate';
      toastError(errorMessage);
      console.error('Sign certificate error:', err);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus) {
      toastError('Please select a status');
      return;
    }

    try {
      const result = await dispatch(
        updateInternStatus({ internId, status: newStatus })
      ).unwrap();
      success(result.message || 'Status updated successfully');
      setShowStatusModal(false);
      setNewStatus('');
      // Refresh intern data
      dispatch(getInternById(internId));
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to update status';
      toastError(errorMessage);
    }
  };

  // Handle internship type change
  const handleTypeChange = async () => {
    if (!newType) {
      toastError('Please select an internship type');
      return;
    }

    try {
      const result = await dispatch(
        changeInternshipType({ internId, type: newType })
      ).unwrap();
      success(result.message || 'Internship type updated successfully');
      setShowTypeModal(false);
      setNewType('');
      // Refresh intern data
      dispatch(getInternById(internId));
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to change internship type';
      toastError(errorMessage);
    }
  };

  // Calculate duration
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

  // Loading state
  if (loading || !selectedIntern) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading intern details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const intern = isEditing ? editData : selectedIntern;
  const isCompleted = selectedIntern.status === 'COMPLETED';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(`${basePath}/interns`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{selectedIntern.fullName}</h1>
              <p className="text-sm text-gray-600 mt-1">Intern Information</p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-5">
          <span
            className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
              selectedIntern.status === 'ONGOING'
                ? 'bg-yellow-100 text-yellow-800'
                : selectedIntern.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {selectedIntern.status}
          </span>
          <span
            className={`ml-3 px-3 py-1 inline-flex text-xs font-medium rounded-full ${
              selectedIntern.internshipType === 'PAID'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {selectedIntern.internshipType}
          </span>
        </div>

        {/* Actions Section */}
        {allowedActions.length > 0 && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4 mb-5">
            <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Update Intern */}
              {allowedActions.includes('update') && (
                <button
                  onClick={handleUpdateClick}
                  disabled={isEditing}
                  className="bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-blue-300 hover:border-blue-400 text-blue-700 p-3 rounded-lg text-sm transition-all flex flex-col items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="font-medium">Update Intern</span>
                </button>
              )}

              {/* Generate Certificate */}
              {allowedActions.includes('generateCert') && (
                <button
                  onClick={() => {
                    if (selectedIntern.status === 'COMPLETED') {
                      setShowCertModal(true);
                    } else {
                      warning('Certificate can only be generated for COMPLETED interns');
                    }
                  }}
                  disabled={selectedIntern.status !== 'COMPLETED'}
                  className="bg-white hover:bg-green-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-green-300 hover:border-green-400 disabled:border-gray-300 text-green-700 disabled:text-gray-400 p-3 rounded-lg text-sm transition-all flex flex-col items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">Generate Certificate</span>
                  {selectedIntern.status !== 'COMPLETED' && (
                    <span className="text-xs text-gray-500">Requires COMPLETED</span>
                  )}
                </button>
              )}

              {/* Sign Certificate (Director only) */}
              {allowedActions.includes('signCert') && (
                <button
                  onClick={() => {
                    if (selectedCertificate && selectedCertificate.status === 'GENERATED') {
                      setShowSignModal(true);
                    } else if (!selectedCertificate) {
                      warning('No certificate found to sign');
                    } else {
                      warning('Certificate is already signed or cannot be signed');
                    }
                  }}
                  disabled={!selectedCertificate || selectedCertificate.status !== 'GENERATED'}
                  className="bg-white hover:bg-indigo-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-indigo-300 hover:border-indigo-400 disabled:border-gray-300 text-indigo-700 disabled:text-gray-400 p-3 rounded-lg text-sm transition-all flex flex-col items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="font-medium">Sign Certificate</span>
                  {!selectedCertificate && (
                    <span className="text-xs text-gray-500">No certificate</span>
                  )}
                  {selectedCertificate && selectedCertificate.status !== 'GENERATED' && (
                    <span className="text-xs text-gray-500">Already signed</span>
                  )}
                </button>
              )}

              {/* Change Internship Type */}
              {allowedActions.includes('changeType') && (
                <button
                  onClick={() => {
                    setNewType(selectedIntern.internshipType === 'PAID' ? 'UNPAID' : 'PAID');
                    setShowTypeModal(true);
                  }}
                  className="bg-white hover:bg-purple-50 border border-purple-300 hover:border-purple-400 text-purple-700 p-3 rounded-lg text-sm transition-all flex flex-col items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Change Type</span>
                  <span className="text-xs text-gray-600">({selectedIntern.internshipType})</span>
                </button>
              )}

              {/* Update Status */}
              {allowedActions.includes('changeStatus') && (
                <button
                  onClick={() => {
                    setNewStatus(selectedIntern.status);
                    setShowStatusModal(true);
                  }}
                  className="bg-white hover:bg-amber-50 border border-amber-300 hover:border-amber-400 text-amber-700 p-3 rounded-lg text-sm transition-all flex flex-col items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Update Status</span>
                  <span className="text-xs text-gray-600">({selectedIntern.status})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
          <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="fullName"
                    value={intern.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </>
              ) : (
                <p className="text-gray-900 font-medium text-lg">{intern.fullName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={intern.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </>
              ) : (
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {intern.email}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={intern.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </>
              ) : (
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {intern.phone}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={intern.state || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {intern.state || 'N/A'}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">District</label>
              {isEditing ? (
                <input
                  type="text"
                  name="district"
                  value={intern.district || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900 font-medium">{intern.district || 'N/A'}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Intern ID</label>
              <p className="text-gray-900 font-mono font-semibold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{intern.internId}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={intern.address || ''}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900 font-medium flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {intern.address || 'N/A'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
          <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Academic Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">College/University</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="instituteName"
                    value={intern.instituteName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.instituteName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.instituteName && <p className="text-red-500 text-sm mt-1">{errors.instituteName}</p>}
                </>
              ) : (
                <p className="text-gray-900">{intern.instituteName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Domain</label>
              {isEditing ? (
                <input
                  type="text"
                  name="domain"
                  value={intern.domain || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.domain || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
              {isEditing ? (
                <input
                  type="text"
                  name="course"
                  value={intern.course || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.course || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Roll Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="rollNumber"
                  value={intern.rollNumber || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.rollNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Domain/Specialization</label>
              {isEditing ? (
                <input
                  type="text"
                  name="domain"
                  value={intern.domain || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.domain || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">CGPA</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={intern.cgpa || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.cgpa || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">HSC Percentage</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="hscPercentage"
                  value={intern.hscPercentage || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.hscPercentage ? `${intern.hscPercentage}%` : 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">SSC Percentage</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="sscPercentage"
                  value={intern.sscPercentage || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.sscPercentage ? `${intern.sscPercentage}%` : 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Internship Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
          <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Internship Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
              {isEditing ? (
                <>
                  <input
                    type="date"
                    name="startDate"
                    value={formatDateForInput(intern.startDate)}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </>
              ) : (
                <p className="text-gray-900">{formatDate(intern.startDate)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
              {isEditing ? (
                <>
                  <input
                    type="date"
                    name="endDate"
                    value={formatDateForInput(intern.endDate)}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </>
              ) : (
                <p className="text-gray-900">{formatDate(intern.endDate)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
              <p className="text-gray-900">{calculateDuration(intern.startDate, intern.endDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">DRDO Department</label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={intern.department || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.department || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mentor Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="mentorName"
                  value={intern.mentorName || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.mentorName || 'N/A'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Project Title</label>
              {isEditing ? (
                <input
                  type="text"
                  name="projectTitle"
                  value={intern.projectTitle || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{intern.projectTitle || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Mode Action Buttons */}
        {isEditing && (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={actionLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Certificate Details Section */}
        <div className="mb-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Certificate Details</h2>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">Status Filter</label>
            <select
              value={certificateStatusFilter}
              onChange={(event) => setCertificateStatusFilter(event.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All</option>
              <option value="GENERATED">GENERATED</option>
              <option value="SIGNED">SIGNED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </div>

          {certFetchLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                Loading certificates...
              </div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              No certificates available for the selected filter.
            </div>
          ) : (
            <>
              {filteredCertificates.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {filteredCertificates.map((certificate) => (
                    <button
                      key={certificate.certificateId}
                      onClick={() => setSelectedCertificateId(certificate.certificateId)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        certificate.certificateId === displayCertificate?.certificateId
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {certificate.certificateId}
                      <span className="ml-2 text-[10px] text-gray-500">{certificate.status}</span>
                    </button>
                  ))}
                </div>
              )}
              {displayCertificate && (
                <CertificateDetailsCard 
                  certificate={displayCertificate} 
                  // allowSign={false}
                  allowSign={allowSign}
                />
              )}
            </>
          )}
        </div>

        {/* Certificate Generation Modal */}
        <Modal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          title="Generate Certificate"
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Select the certificate type to generate for <strong>{selectedIntern.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PARTICIPATION">Participation Certificate</option>
                <option value="COMPLETION">Completion Certificate</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateCertificate}
                disabled={certLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {certLoading ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Status Change Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Intern Status"
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Change status for <strong>{selectedIntern.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Current status: <span className="font-semibold">{selectedIntern.status}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStatusChange}
                disabled={actionLoading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Type Change Modal */}
        <Modal
          isOpen={showTypeModal}
          onClose={() => setShowTypeModal(false)}
          title="Change Internship Type"
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Change internship type for <strong>{selectedIntern.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Internship Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Current type: <span className="font-semibold">{selectedIntern.internshipType}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleTypeChange}
                disabled={actionLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Change Type'}
              </button>
              <button
                onClick={() => setShowTypeModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Sign Certificate Modal */}
        <ConfirmDialog
          isOpen={showSignModal}
          title="Sign Certificate"
          message={`Are you sure you want to sign the certificate for ${selectedIntern.fullName}? This action will apply your digital signature to the certificate.`}
          confirmText="Sign Certificate"
          cancelText="Cancel"
          onConfirm={handleSignCertificate}
          onClose={() => setShowSignModal(false)}
          confirmColor="blue"
        />
      </div>
    </DashboardLayout>
  );
};

export default InternDetailsPage;
