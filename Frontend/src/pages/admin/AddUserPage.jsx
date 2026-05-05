/**
 * Add User Page - Admin
 * Form for creating new users
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, clearError, clearMessage } from '../../redux/slices/userSlice';
import { useToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Card from '../../components/common/Card';

const AddUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { actionLoading, error, message } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    blockChainIdentity: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      // Navigate back to users list after successful creation
      setTimeout(() => navigate('/admin/users'), 1500);
    }
  }, [error, message, toast, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    if (!formData.blockChainIdentity.trim()) {
      errors.blockChainIdentity = 'Blockchain identity is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    // Prepare data for API (exclude confirmPassword, convert role to array)
    const { confirmPassword, role, ...userData } = formData;

    await dispatch(registerUser({ ...userData, roles: [role] }));
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button
              onClick={() => navigate('/admin/users')}
              className="hover:text-blue-600 transition-colors"
            >
              Users
            </button>
            <span>/</span>
            <span className="text-gray-900">Add New User</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new user account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={formErrors.fullName}
                  required
                  placeholder="Enter full name"
                />

                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                  required
                  placeholder="user@example.com"
                />

                <FormInput
                  label="Blockchain Identity"
                  name="blockChainIdentity"
                  value={formData.blockChainIdentity}
                  onChange={handleInputChange}
                  error={formErrors.blockChainIdentity}
                  required
                  placeholder="e.g. wallet address / user ID"
                />

                <FormInput
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={formErrors.phoneNumber}
                  required
                  placeholder="+91 9876543210"
                />


              </div>
            </Card>

            {/* Security */}
            <Card title="Security">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                  required
                  placeholder="Minimum 6 characters"
                />

                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={formErrors.confirmPassword}
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </Card>

            {/* Roles & Permissions */}
            <Card title="Role">
              <div className="space-y-4">
                <FormInput
                  label="User Role"
                  name="role"
                  as="select"
                  value={formData.role}
                  onChange={handleInputChange}
                  error={formErrors.role}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="ROLE_ADMIN">Admin - Full system access and user management</option>
                  <option value="ROLE_HR">HR - Manage interns and certificates</option>
                  <option value="ROLE_DIRECTOR">Director - Review and approve certificates</option>
                </FormInput>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={actionLoading}
              >
                {actionLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddUserPage;
