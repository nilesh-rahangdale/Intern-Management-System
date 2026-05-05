/**
 * User Details Page - Admin
 * View and manage individual user information
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUserById,
  updateUser,
  deleteUser,
  changeUserStatus,
  clearError,
  clearMessage,
  clearSelectedUser,
} from '../../redux/slices/userSlice';
import { useToast } from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusChip from '../../components/common/StatusChip';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { selectedUser, actionLoading, loading, error, message } = useSelector((state) => state.users);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    status: '',
    blockChainIdentity: '',
  });

  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [userId, dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        fullName: selectedUser.fullName || '',
        email: selectedUser.email || '',
        phoneNumber: selectedUser.phoneNumber || '',
        role: selectedUser.role?.[0] || '',
        status: selectedUser.status || '',
        blockChainIdentity: selectedUser.blockChainIdentity || '',
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      setIsEditing(false);
    }
  }, [error, message, toast, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    
    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      roles: [formData.role],
      status: formData.status,
      blockChainIdentity: formData.blockChainIdentity,
    };

    await dispatch(updateUser({ id: selectedUser.id, userData }));
  };

  const handleStatusChange = async () => {
    if (!selectedUser || !newStatus) return;
    await dispatch(changeUserStatus({ id: selectedUser.id, status: newStatus }));
    setShowStatusDialog(false);
    setNewStatus('');
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    await dispatch(deleteUser(selectedUser.id));
    setShowDeleteDialog(false);
    setTimeout(() => navigate('/admin/users'), 500);
  };

  const openStatusDialog = (status) => {
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const getRoleBadgeVariant = (role) => {
    if (role.includes('ROLE_ADMIN')) return 'admin';
    if (role.includes('ROLE_HR')) return 'hr';
    if (role.includes('ROLE_DIRECTOR')) return 'director';
    return 'default';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading user details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!selectedUser) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
            <p className="mt-1 text-sm text-gray-500">The user you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Users
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage user information</p>
            </div>
            <StatusChip status={selectedUser.status} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="User ID"
                  name="userId"
                  value={selectedUser.id}
                  disabled
                />
                <FormInput
                  label="Blockchain ID"
                  name="blockChainIdentity"
                  value={selectedUser.blockChainIdentity}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <FormInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
                <FormInput
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </Card>

            {/* Roles and Permissions */}
            <Card title="Role">
              <div>
                {isEditing ? (
                  <FormInput
                    label="User Role"
                    name="role"
                    as="select"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a role</option>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_HR">HR</option>
                    <option value="ROLE_DIRECTOR">Director</option>
                  </FormInput>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Assigned Roles</p>
                    {selectedUser?.roles && selectedUser.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedUser.roles.map((role, index) => (
                          <Badge
                            key={index}
                            variant={getRoleBadgeVariant(role)}
                            size="sm"
                          >
                            {role.replace('ROLE_', '')}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No role assigned</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Account Metadata */}
            <Card title="Account Metadata">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Current Status</p>
                  <StatusChip status={selectedUser.status} />
                </div>
                <div>
                  <p className="text-gray-500 mb-1">User ID</p>
                  <p className="font-medium text-gray-900">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Updated At</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Created By</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.createdByName || 'N/A'} {selectedUser.createdById ? `(ID: ${selectedUser.createdById})` : ''}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <Card title="Actions" className="sticky top-6">
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleUpdate}
                      loading={actionLoading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: selectedUser.fullName || '',
                          email: selectedUser.email || '',
                          phoneNumber: selectedUser.phoneNumber || '',
                          roles: selectedUser.role || [],
                        });
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => setIsEditing(true)}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      }
                    >
                      Update User
                    </Button>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">Change Status</p>
                      <div className="space-y-2">
                        {selectedUser.status !== 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            onClick={() => openStatusDialog('ACTIVE')}
                          >
                            Set Active
                          </Button>
                        )}
                        {selectedUser.status !== 'INACTIVE' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={() => openStatusDialog('INACTIVE')}
                          >
                            Set Inactive
                          </Button>
                        )}
                        {selectedUser.status !== 'BLOCKED' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            fullWidth
                            onClick={() => openStatusDialog('BLOCKED')}
                          >
                            Block User
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        variant="destructive"
                        fullWidth
                        onClick={() => setShowDeleteDialog(true)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Delete User
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={actionLoading}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => {
          setShowStatusDialog(false);
          setNewStatus('');
        }}
        onConfirm={handleStatusChange}
        title="Change User Status"
        message={`Are you sure you want to change ${selectedUser.fullName}'s status to ${newStatus}?`}
        confirmText="Change Status"
        variant="primary"
        loading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default UserDetailsPage;
