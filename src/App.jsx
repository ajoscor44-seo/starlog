import React, { useState, useContext } from 'react';
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
import Profile from './views/Client/Profile';
import AdminDashboard from './views/Admin/AdminDashboard';
import AboutUs from './views/AboutUs';
import ContactUs from './views/ContactUs';
import TermsOfService from './views/TermsOfService';
import PrivacyPolicy from './views/PrivacyPolicy';
import Auth from './views/Auth';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggedIn, activeTab, setActiveTab } = useContext(AppContext);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case 'subs':
        return <Subscriptions />;
      case 'otp':
        return <SMSVerification />;
      case 'reuse':
        return <ReuseNumbers />;
      case 'esim':
        return <ESim />;
      case 'smm':
        return <SmmPanel />;
      case 'wallet':
        return <Wallet />;
      case 'orders':
        return <OrderHistory />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  const consoleTabs = ['overview', 'subs', 'otp', 'reuse', 'esim', 'smm', 'wallet', 'orders', 'profile', 'admin'];

  if (activeTab === 'landing') {
    return <LandingPage setActiveTab={setActiveTab} />;
  }
  if (activeTab === 'about') {
    return <AboutUs setActiveTab={setActiveTab} />;
  }
  if (activeTab === 'contact') {
    return <ContactUs setActiveTab={setActiveTab} />;
  }
  if (activeTab === 'terms') {
    return <TermsOfService setActiveTab={setActiveTab} />;
  }
  if (activeTab === 'privacy') {
    return <PrivacyPolicy setActiveTab={setActiveTab} />;
  }
  if (activeTab === 'auth') {
    return <Auth setActiveTab={setActiveTab} fallbackTab="overview" />;
  }

  // Auth Guard Interceptor
  if (!isLoggedIn && consoleTabs.includes(activeTab)) {
    return <Auth setActiveTab={setActiveTab} fallbackTab={activeTab} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Panel Viewport */}
      <main className="main-content">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1 }}>
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
