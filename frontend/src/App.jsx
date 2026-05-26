import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Map, BarChart3, UserCircle, Bell } from 'lucide-react';
import LiveMapPage from './pages/LiveMapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import { useState } from 'react';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Shield color="var(--accent-primary)" size={28} />
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Women Safety Risk Zone Prediction System</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          <Map size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Live Map
        </Link>
        <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>
          <BarChart3 size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Analytics
        </Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
          <UserCircle size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Profile
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [alertMsg, setAlertMsg] = useState(null);

  // Expose an alert function globally (hack for prototype)
  window.triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        {alertMsg && (
          <div style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--danger)', color: 'white', padding: '12px 24px', 
            borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
          }}>
            <Bell size={20} className="sos-active" />
            <span style={{ fontWeight: '600' }}>{alertMsg}</span>
          </div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LiveMapPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
