import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Camera, ScanFace } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Kiosk from './pages/Kiosk';
import './index.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ScanFace size={32} color="var(--accent-primary)" />
        <span>SentiFace</span>
      </div>
      <nav>
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/register" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <UserPlus size={20} />
          Register Student
        </NavLink>
        <NavLink to="/kiosk" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Camera size={20} />
          Live Kiosk
        </NavLink>
      </nav>
    </aside>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content glass-panel" style={{ margin: '1rem', borderRadius: '24px' }}>
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

export default App;
