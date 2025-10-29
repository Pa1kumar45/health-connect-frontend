/**
 * App Component
 * 
 * Root application component that sets up routing and authentication.
 * Handles route protection, user session management, and role-based navigation.
 * 
 * Features:
 * - Role-based routing (Patient, Doctor, Admin, Super Admin)
 * - Protected routes for authenticated users
 * - Admin-only route protection
 * - Automatic user session restoration
 * - Login information banner display
 * - Redirect logic based on user roles
 * 
 * Route Structure:
 * - Public: Home, Login, Signup, Forgot Password
 * - Patient: Doctor List, Appointments, Profile
 * - Doctor: Dashboard, Appointments, Profile
 * - Admin: Dashboard, User Management, Logs, Profile
 * 
 * @component
 * @returns {React.FC} Root application component with routing
 */
import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LoginInfoBanner from './components/LoginInfoBanner';
import Homepage from './pages/Homepage';
import DoctorList from './pages/DoctorList';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import AdminProfile from './pages/AdminProfile';
import DoctorPage from './pages/DoctorPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogs from './pages/AdminLogs';
import Appointments from './pages/Appointments';
import { Doctor, Patient, Admin } from './types';

/**
 * Response type for getCurrentUser API call
 */
interface GetCurrentUserResponse {
  data: {
    data: Doctor | Patient | Admin;
    success: boolean;
    message: string;
  }
}

/**
 * AdminRoute Component
 * 
 * Higher-order component that protects admin-only routes.
 * Redirects unauthorized users to appropriate pages.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactElement} Protected route or redirect
 */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  // Redirect to login if not authenticated, preserving intended destination
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to home if user is not an admin or super admin
  if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  // Render protected content for authorized admin users
  return <>{children}</>;
};

/**
 * App Component Implementation
 */
const App: React.FC = () => {
  // Get app context values
  const { currentUser, setCurrentUser, getCurrentUser, loginInfo, hideLoginInfoToast } = useApp();

  // Ref to prevent duplicate user fetching on mount
  const hasFetchedUser = useRef(false);

  /**
   * Effect hook to restore user session on app mount
   * Fetches current user from server if valid session exists
   * Uses ref to ensure it only runs once
   */
  useEffect(() => {
    // Ensure this only runs once on mount to avoid duplicate requests
    if (!hasFetchedUser.current) {
      hasFetchedUser.current = true;
      
      /**
       * Fetch current user from server
       * Restores user session if valid JWT token exists
       */
      const fetchCurrentUser = async () => {
        try {
          console.log('🔍 Fetching current user...');
          const response = await getCurrentUser() as GetCurrentUserResponse;
          if (response?.data?.data) {
            console.log('✅ User session found:', response.data.data.role);
            setCurrentUser(response.data.data);
          } else {
            console.log('❌ No user data in response');
            setCurrentUser(null);
          }
        } catch (error) {
          // Session invalid or expired - user will see public pages
          console.log('❌ No active session found, clearing user state');
          setCurrentUser(null);
        }
      };
      
      fetchCurrentUser();
    }
  }, [getCurrentUser, setCurrentUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        {/* Login Info Banner - shows at top when available */}
        {loginInfo && (
          <LoginInfoBanner 
            loginInfo={loginInfo} 
            onClose={hideLoginInfoToast}
          />
        )}
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            currentUser ? (
              (currentUser.role === 'admin' || currentUser.role === 'super_admin') ? <Navigate to="/admin" /> :
              currentUser.role === 'doctor' ? <DoctorDashboard /> : <DoctorList />
            ) : (
              <Homepage />
            )
          } />
          <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/admin/login" element={!currentUser ? <AdminLogin /> : <Navigate to="/admin" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/doctor/:id" element={<DoctorPage />} />
          <Route path="/doctors" element={<DoctorList />} />

          {/* Protected user routes */}
          {currentUser ? (
            <>
              <Route
                path="/profile"
                element={
                  currentUser?.role === 'doctor' ? <DoctorProfile /> : 
                  (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') ? <AdminProfile /> :
                  <PatientProfile />
                }
              />
              {currentUser.role === 'patient' && (
                <Route
                  path="/appointments"
                  element={<Appointments />}
                />
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <AdminRoute>
                <AdminLogs />
              </AdminRoute>
            } 
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
