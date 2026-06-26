import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Key, 
  RefreshCw, 
  Smartphone, 
  Share2, 
  CreditCard, 
  Compass, 
  Settings, 
  LogOut,
  User,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { isAdmin, setIsAdmin, dbIsAdmin, user, logoutUser } = useContext(AppContext);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subs', label: 'Premium Accounts', icon: User, external: true, url: 'https://www.discountzar.com/marketplace' },
    { id: 'otp', label: 'SMS OTP (Temp)', icon: Key },
    { id: 'reuse', label: 'Reuse Number', icon: RefreshCw },
    { id: 'esim', label: 'eSIM Travel', icon: Smartphone },
    { id: 'smm', label: 'SMM Panel', icon: Share2 },
    { id: 'social', label: 'Social Media Logs', icon: ShieldCheck },
    { id: 'wallet', label: 'Wallet & Fund', icon: CreditCard },
    { id: 'orders', label: 'Order History', icon: ClipboardList },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  const handleNavClick = (tabId, external = false, url = '') => {
    if (external) {
      window.open(url, '_blank');
    } else {
      setActiveTab(tabId);
    }
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <>
      {/* Dimmed Overlay Background for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Compass size={28} className="pulse-glow-cyan" style={{ color: 'var(--color-turquoise)' }} />
          <span className="logo-text">discountzar.ng</span>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <div 
              onClick={() => handleNavClick('landing')}
              className={`sidebar-link ${activeTab === 'landing' ? 'active' : ''}`}
            >
              <Compass size={20} />
              <span>Portal Home</span>
            </div>
          </li>

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <li key={item.id} className="sidebar-item">
                <div
                  onClick={() => handleNavClick(item.id, item.external, item.url)}
                  className={`sidebar-link ${isSelected ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{item.label}</span>
                    {item.id === 'subs' && (
                      <span style={{ 
                        fontSize: '7.5px', 
                        background: 'linear-gradient(135deg, var(--color-violet) 0%, var(--color-pink) 100%)', 
                        color: '#fff', 
                        padding: '1px 4px', 
                        borderRadius: '4px', 
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        boxShadow: '0 0 6px rgba(255, 0, 127, 0.3)',
                        flexShrink: 0,
                        marginLeft: '4px'
                      }}>
                        discount zar
                      </span>
                    )}
                    {item.id === 'esim' && !dbIsAdmin && (
                      <span style={{ 
                        fontSize: '8px', 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        color: 'var(--text-secondary)', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                        marginLeft: '4px'
                      }}>
                        Coming Soon
                      </span>
                    )}
                  </span>
                </div>
              </li>
            );
          })}

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
              <li className="sidebar-item">
                <div
                  onClick={() => handleNavClick('admin')}
                  className={`sidebar-link pink ${activeTab === 'admin' ? 'active' : ''}`}
                >
                  <ShieldCheck size={20} style={{ color: 'var(--color-pink)' }} />
                  <span style={{ color: 'var(--color-pink)', fontWeight: '600' }}>Admin Panel</span>
                </div>
              </li>
            </>
          )}
        </ul>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-green)' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Server Status: Live</span>
          </div>
          {user && (
            <>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={user.email}>
                  User: {user.email}
                </span>
              </div>
              <button 
                onClick={() => {
                  logoutUser();
                  handleNavClick('landing');
                }}
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', fontSize: '13px' }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
