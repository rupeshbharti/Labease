import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import LoadingSpinner from './shared/LoadingSpinner';

// Auth & Public pages (not lazy — needed immediately)
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import ProfileSetup from './auth/ProfileSetup';
import LandingPage from './landing/LandingPage';

import { CartProvider } from './patient/CartContext';

// Lazy-loaded role layouts
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/DashboardPage'));
const LabApplicationsPage = lazy(() => import('./admin/LabApplicationsPage'));
const LabReviewPage = lazy(() => import('./admin/LabReviewPage'));
const OrderMonitorPage = lazy(() => import('./admin/OrderMonitorPage'));
const SettingsPage = lazy(() => import('./admin/SettingsPage'));
const PayoutsManagerPage = lazy(() => import('./admin/PayoutsManagerPage'));

const LabLayout = lazy(() => import('./lab/LabLayout'));
const LabDashboard = lazy(() => import('./lab/DashboardPage'));
const OnboardingPage = lazy(() => import('./lab/OnboardingPage'));
const LabProfilePage = lazy(() => import('./lab/ProfilePage'));
const SlotsPage = lazy(() => import('./lab/SlotsPage'));
const ServiceAreaPage = lazy(() => import('./lab/ServiceAreaPage'));
const CatalogPage = lazy(() => import('./lab/CatalogPage'));
const OrdersPage = lazy(() => import('./lab/OrdersPage'));
const ReportUploadPage = lazy(() => import('./lab/ReportUploadPage'));
const LabRevenuePage = lazy(() => import('./lab/RevenuePage'));
const LabReviewsPage = lazy(() => import('./lab/ReviewsPage'));

const PatientLayout = lazy(() => import('./patient/PatientLayout'));
const PatientHome = lazy(() => import('./patient/HomePage'));
const PatientProfile = lazy(() => import('./patient/ProfilePage'));
const SearchPage = lazy(() => import('./patient/SearchPage'));
const LabDetailPage = lazy(() => import('./patient/LabDetailPage'));
const CartPage = lazy(() => import('./patient/CartPage'));
const BookingConfirmationPage = lazy(() => import('./patient/BookingConfirmationPage'));
const MyBookingsPage = lazy(() => import('./patient/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('./patient/BookingDetailPage'));
const LiveTrackingPage = lazy(() => import('./patient/LiveTrackingPage'));
const HealthHistoryPage = lazy(() => import('./patient/HealthHistoryPage'));
const PublicReportSharePage = lazy(() => import('./patient/PublicReportSharePage'));

const PhleboLayout = lazy(() => import('./phlebotomist/PhleboLayout'));
const PhleboDashboard = lazy(() => import('./phlebotomist/DashboardPage'));

// Root redirect based on role
function RootRedirect() {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profile) return <Navigate to="/profile-setup" replace />;

  const dashboards = {
    patient: '/patient',
    lab_staff: '/lab',
    phlebotomist: '/phlebo',
    platform_admin: '/admin',
  };

  return <Navigate to={dashboards[profile.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner fullPage text="Loading..." />}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />

            {/* Patient Routes */}
            <Route path="/patient" element={
              <ProtectedRoute role="patient">
                <CartProvider>
                  <PatientLayout />
                </CartProvider>
              </ProtectedRoute>
            }>
              <Route index element={<PatientHome />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="lab/:id" element={<LabDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="bookings" element={<MyBookingsPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
              <Route path="bookings/:id/track" element={<LiveTrackingPage />} />
              <Route path="booking-confirmed/:id" element={<BookingConfirmationPage />} />
              <Route path="health-history" element={<HealthHistoryPage />} />
            </Route>

            {/* Lab Partner Routes */}
            <Route path="/lab" element={
              <ProtectedRoute role="lab_staff">
                <LabLayout />
              </ProtectedRoute>
            }>
              <Route index element={<LabDashboard />} />
              <Route path="onboard" element={<OnboardingPage />} />
              <Route path="profile" element={<LabProfilePage />} />
              <Route path="slots" element={<SlotsPage />} />
              <Route path="service-area" element={<ServiceAreaPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="reports" element={<ReportUploadPage />} />
              <Route path="revenue" element={<LabRevenuePage />} />
              <Route path="reviews" element={<LabReviewsPage />} />
            </Route>

            {/* Phlebotomist Routes */}
            <Route path="/phlebo" element={
              <ProtectedRoute role="phlebotomist">
                <PhleboLayout />
              </ProtectedRoute>
            }>
              <Route index element={<PhleboDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="platform_admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="labs" element={<LabApplicationsPage />} />
              <Route path="labs/:id" element={<LabReviewPage />} />
              <Route path="orders" element={<OrderMonitorPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="payouts" element={<PayoutsManagerPage />} />
            </Route>

            {/* Public Shared Report Route (Unauthenticated) */}
            <Route path="/patient/share/:token" element={<PublicReportSharePage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--inverse-surface)',
              color: 'var(--inverse-on-surface)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
