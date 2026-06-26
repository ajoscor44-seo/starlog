import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './views/LandingPage';
import DashboardOverview from './views/Client/DashboardOverview';
import Subscriptions from './views/Client/Subscriptions';
import SMSVerification from './views/Client/SMSVerification';
import ReuseNumbers from './views/Client/ReuseNumbers';
import ESim from './views/Client/eSIM';
import SmmPanel from './views/Client/SmmPanel';
import Wallet from './views/Client/Wallet';
import OrderHistory from './views/Client/OrderHistory';
import SocialMediaLogs from './views/Client/SocialMediaLogs';
import Profile from './views/Client/Profile';
import AdminDashboard from './views/Admin/AdminDashboard';
import AboutUs from './views/AboutUs';
import ContactUs from './views/ContactUs';
import TermsOfService from './views/TermsOfService';
import PrivacyPolicy from './views/PrivacyPolicy';
import Auth from './views/Auth';

function ProtectedRoute() {
  const { isLoggedIn } = useContext(AppContext);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  // Sync the context activeTab with the router (optional, but good for backward compatibility if needed)
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/login" element={<Auth fallbackTab="/dashboard" />} />

      {/* Protected Console Routes */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="subs" element={<Subscriptions />} />
          <Route path="otp" element={<SMSVerification />} />
          <Route path="reuse" element={<ReuseNumbers />} />
          <Route path="esim/*" element={<ESim />} />
          <Route path="smm/*" element={<SmmPanel />} />
          <Route path="social/*" element={<SocialMediaLogs />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
