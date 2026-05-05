/**
 * Add Intern Page
 * Form to register a new intern with validation or bulk upload via CSV
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import { addIntern, uploadCsv } from '../../redux/slices/internSlice';
import { useToast } from '../../components/common/Toast';

const AddInternPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.interns);
  const { success, error: toastError, warning } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'csv'

  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    aadhaarHash: '',

    // Academic Details
    instituteName: '',
    domain: '',
    course: '',
    rollNumber: '',
    cgpa: '',
    hscPercentage: '',
    sscPercentage: '',

    // Internship Details
    startDate: '',
    endDate: '',
    internshipType: 'PAID',
    department: '',
    mentorName: '',
    projectTitle: '',
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: ''}));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Basic Information
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';

    // Academic Details
    if (!formData.instituteName.trim()) newErrors.instituteName = 'Institute name is required';
    if (!formData.domain.trim()) newErrors.domain = 'Domain is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (formData.cgpa && (isNaN(formData.cgpa) || formData.cgpa < 0 || formData.cgpa > 10)) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }
    if (formData.hscPercentage && (isNaN(formData.hscPercentage) || formData.hscPercentage < 0 || formData.hscPercentage > 100)) {
      newErrors.hscPercentage = 'HSC percentage must be between 0 and 100';
    }
    if (formData.sscPercentage && (isNaN(formData.sscPercentage) || formData.sscPercentage < 0 || formData.sscPercentage > 100)) {
      newErrors.sscPercentage = 'SSC percentage must be between 0 and 100';
    }

    // Internship Details
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toastError('Please fix the errors in the form');
      return;
    }

    try {
      // Convert number fields to proper types
      const payload = {
        ...formData,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        hscPercentage: formData.hscPercentage ? parseFloat(formData.hscPercentage) : undefined,
        sscPercentage: formData.sscPercentage ? parseFloat(formData.sscPercentage) : undefined,
        status: 'ONGOING', // Default status for new interns
      };

      // Remove empty optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const result = await dispatch(addIntern(payload)).unwrap();
      success(result.message || 'Intern added successfully');
      navigate('/hr/interns');
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to add intern';
      toastError(errorMessage);
    }
  };

  // Handle CSV file selection
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toastError('Please select a valid CSV file');
        e.target.value = '';
        return;
      }
      setCsvFile(file);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvFile) {
      toastError('Please select a CSV file');
      return;
    }

    try {
      const result = await dispatch(uploadCsv(csvFile)).unwrap();
      setCsvResult(result.data);
      setShowResultModal(true);
      
      if (result.data.failureCount === 0) {
        success(result.message || `Successfully added ${result.data.successCount} interns`);
      } else {
        warning(result.message || `${result.data.successCount} added, ${result.data.failureCount} failed`);
      }
      
      // Clear file input
      setCsvFile(null);
      const fileInput = document.getElementById('csvFileInput');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      const errorMessage = err.error?.details || err.message || 'Failed to upload CSV';
      toastError(errorMessage);
    }
  };

  // Download sample CSV
  const downloadSampleCsv = () => {
    const csvContent = `fullName,email,phone,address,state,district,aadhaarHash,course,domain,instituteName,rollNumber,cgpa,hscPercentage,sscPercentage,department,projectTitle,mentorName,internshipType,startDate,endDate
Rajesh Kumar,rajesh1@example.com,+91-9876543212,123 Main Street,Maharashtra,Pune,hash123,B.Tech Computer Science,Machine Learning,ABC Engineering College,CS2022001,8.5,85.5,90.0,Computer Science,AI-Based Image Recognition,Dr. Sharma,PAID,2026-01-15,2026-06-15
Priya Sharma,priya1@example.com,+91-9876543213,456 Park Avenue,Karnataka,Bangalore,hash456,M.Tech AI,Deep Learning,XYZ Institute,AI2022002,9.0,88.0,92.0,Research & Development,Neural Networks Study,Dr. Patel,UNPAID,2026-01-15,2026-06-15`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'intern_upload_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    success('Sample CSV downloaded');
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/hr/interns')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Intern</h1>
              <p className="text-sm text-gray-600 mt-1">Register new intern(s) in the system</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('manual')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                activeTab === 'manual'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                activeTab === 'csv'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              CSV Upload
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit} className="max-w-4xl">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="intern@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+91-9876543210"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Maharashtra"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Pune"
                  />
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Hash</label>
                  <input
                    type="text"
                    name="aadhaarHash"
                    value={formData.aadhaarHash}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hashed Aadhaar value (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.instituteName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter institute/college name"
                  />
                  {errors.instituteName && <p className="text-red-500 text-sm mt-1">{errors.instituteName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.course ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., B.Tech Computer Science"
                  />
                  {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.domain ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Machine Learning, AI"
                  />
                  {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CS2022001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cgpa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 8.5"
                    min="0"
                    max="10"
                  />
                  {errors.cgpa && <p className="text-red-500 text-sm mt-1">{errors.cgpa}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HSC Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hscPercentage"
                    value={formData.hscPercentage}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.hscPercentage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 85.5"
                    min="0"
                    max="100"
                  />
                  {errors.hscPercentage && <p className="text-red-500 text-sm mt-1">{errors.hscPercentage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSC Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    name="sscPercentage"
                    value={formData.sscPercentage}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sscPercentage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 90.0"
                    min="0"
                    max="100"
                  />
                  {errors.sscPercentage && <p className="text-red-500 text-sm mt-1">{errors.sscPercentage}</p>}
                </div>
              </div>
            </div>

            {/* Internship Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Internship Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internship Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="internshipType"
                    value={formData.internshipType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Computer Science"
                  />
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name</label>
                  <input
                    type="text"
                    name="mentorName"
                    value={formData.mentorName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Dr. Sharma"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., AI-Based Image Recognition"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding Intern...
                  </span>
                ) : (
                  'Add Intern'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/hr/interns')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* CSV Upload Section */}
        {activeTab === 'csv' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Upload Interns</h2>
                <p className="text-gray-600">Upload a CSV file to add multiple interns at once</p>
              </div>

              {/* Sample CSV Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">CSV Format Required</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Download the sample CSV file to see the required format and fields.
                    </p>
                    <button
                      onClick={downloadSampleCsv}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Sample CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="csvFileInput"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="csvFileInput"
                  className="cursor-pointer"
                >
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                </label>
              </div>

              {/* Upload Button */}
              {csvFile && (
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleCsvUpload}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
                        </svg>
                        Upload CSV File
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCsvFile(null);
                      const fileInput = document.getElementById('csvFileInput');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CSV Result Modal */}
        <Modal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            if (csvResult?.failureCount === 0) {
              navigate('/hr/interns');
            }
          }}
          title="CSV Upload Results"
        >
          {csvResult && (
            <div className="p-6">
              {/* Summary */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{csvResult.successCount}</p>
                    <p className="text-sm text-green-700 font-medium">Successful</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{csvResult.failureCount}</p>
                    <p className="text-sm text-red-700 font-medium">Failed</p>
                  </div>
                </div>
              </div>

              {/* Failed Rows */}
              {csvResult.failedRows && csvResult.failedRows.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Failed Entries</h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvResult.failedRows.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900">{row.rowNumber}</td>
                            <td className="px-4 py-2 text-red-600">{row.errorMessage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {csvResult.failureCount === 0 ? (
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      navigate('/hr/interns');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    View All Interns
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowResultModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowResultModal(false);
                        navigate('/hr/interns');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Successful Interns
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AddInternPage;
