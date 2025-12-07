import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Inventory from './pages/Inventory'
import Scans from './pages/Scans'
import Results from './pages/Results'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function Dashboard({ serverStatus }) {
  return (
    <div className="container">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ borderLeft: '4px solid #48bb78' }}>
          <h3 style={{ fontSize: '1rem', color: '#718096', marginBottom: '8px' }}>System Status</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{serverStatus.includes('Online') ? 'Online' : 'Offline'}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
          <h3 style={{ fontSize: '1rem', color: '#718096', marginBottom: '8px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/scans" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: '500' }}>Run Scan &rarr;</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        <p style={{ color: '#718096', marginTop: '10px' }}>No recent scanning activity.</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Health Check
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(`Online: ${data.timestamp}`))
      .catch(err => setServerStatus('Offline (Backend not running or proxy issue)'));

    // Auth Check
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard serverStatus={serverStatus} />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/scans" element={<Scans />} />
        <Route path="/scans/:id" element={<Results />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
