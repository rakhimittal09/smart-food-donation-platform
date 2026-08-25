import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Route Wrappers
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationsPage from './pages/DonationsPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import FAQPage from './pages/FAQPage';

// Authenticated Pages
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import PickupTrackingPage from './pages/PickupTrackingPage';
import RequestsPage from './pages/RequestsPage';

// Donor Pages
import DonorDashboard from './pages/DonorDashboard';
import CreateDonationPage from './pages/CreateDonationPage';
import EditDonationPage from './pages/EditDonationPage';

// Receiver Pages
import ReceiverDashboard from './pages/ReceiverDashboard';

// Volunteer Pages
import VolunteerDashboard from './pages/VolunteerDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDonationsPage from './pages/AdminDonationsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="app-container">
              <Navbar />

              <div className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/donations" element={<DonationsPage />} />
                  <Route path="/donations/:id" element={<DonationDetailsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/faq" element={<FAQPage />} />

                  {/* General Authenticated Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pickup-tracking/:id"
                    element={
                      <ProtectedRoute>
                        <PickupTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/requests"
                    element={
                      <ProtectedRoute>
                        <RequestsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Donor Protected Routes */}
                  <Route
                    path="/donor-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['donor']}>
                        <DonorDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/donations/create"
                    element={
                      <RoleProtectedRoute allowedRoles={['donor']}>
                        <CreateDonationPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/donations/my"
                    element={
                      <RoleProtectedRoute allowedRoles={['donor']}>
                        <DonorDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/donations/edit/:id"
                    element={
                      <RoleProtectedRoute allowedRoles={['donor', 'admin']}>
                        <EditDonationPage />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* Receiver Protected Routes */}
                  <Route
                    path="/receiver-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['receiver']}>
                        <ReceiverDashboard />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* Volunteer Protected Routes */}
                  <Route
                    path="/volunteer-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['volunteer']}>
                        <VolunteerDashboard />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminUsersPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/donations"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDonationsPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/requests"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <RequestsPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminCategoriesPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminReportsPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/activity-logs"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminActivityLogsPage />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminSettingsPage />
                      </RoleProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
