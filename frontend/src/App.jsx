import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Radio, ScanFace } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Kiosk from './pages/Kiosk';
import './index.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <ScanFace size={24} className="neon-icon" />
        </div>
        <span className="sidebar-title">AttendX</span>
      </div>

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>
        <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <UserPlus size={17} />
          Register
        </NavLink>
        <NavLink to="/kiosk" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Radio size={17} />
          Live Kiosk
        </NavLink>
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/kiosk" element={<Kiosk />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
