import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AuthInitializer from './components/AuthInitializer';
import SessionMonitor from './components/SessionMonitor';

// Pages
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AddUserPage from './pages/admin/AddUserPage';
import UserDetailsPage from './pages/admin/UserDetailsPage';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import AddInternPage from './pages/hr/AddInternPage';
import BlockchainConnect from './pages/hr/BlockchainConnect';
import BlockchainCertificateDetails from './pages/hr/BlockchainCertificateDetails';

// Director Pages
import DirectorDashboard from './pages/director/DirectorDashboard';

// Common Components
import ProfilePage from './components/common/ProfilePage';
import InternsPage from './components/common/InternsPage';
import InternDetailsPage from './components/common/InternDetailsPage';
import CertificatesPage from './components/common/CertificatesPage';
import CertificateDetailsPage from './pages/common/CertificateDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthInitializer>
          <SessionMonitor />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/login">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/login">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/login">
                  <AddUserPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/login">
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* HR Routes */}
            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/interns"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <InternsPage showAddButton={true} basePath="/hr" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/interns/add"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <AddInternPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/interns/:internId"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <InternDetailsPage allowedActions={['update', 'generateCert', 'changeType', 'changeStatus']} basePath="/hr" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/certificates"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <CertificatesPage allowGenerate={true} basePath="/hr" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/certificates/:certificateId"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <CertificateDetailsPage allowSign={false} basePath="/hr" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/profile"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/blockchain"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <BlockchainConnect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/blockchain/:certificateId"
              element={
                <ProtectedRoute roles={['ROLE_HR']} redirectTo="/login">
                  <BlockchainCertificateDetails />
                </ProtectedRoute>
              }
            />

            {/* Director Routes */}
            <Route
              path="/director/dashboard"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <DirectorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director/interns"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <InternsPage showAddButton={false} basePath="/director" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director/interns/:internId"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <InternDetailsPage allowedActions={['signCert']} basePath="/director" allowSign={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director/certificates"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <CertificatesPage allowGenerate={false} basePath="/director" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director/certificates/:certificateId"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <CertificateDetailsPage allowSign={true} basePath="/director" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/director/profile"
              element={
                <ProtectedRoute roles={['ROLE_DIRECTOR']} redirectTo="/login">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Default Route - Redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all - Redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthInitializer>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
