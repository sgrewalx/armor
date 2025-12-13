import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TenantLogin from './pages/tenant/Login';
import Dashboard from './pages/tenant/Dashboard';
import CloudAccounts from './pages/tenant/CloudAccounts';
import Assets from './pages/tenant/Assets';
import Findings from './pages/tenant/Findings';
import Settings from './pages/tenant/Settings';
import Home from './pages/Home';
import Signup from './pages/Signup';
import AppShell from './components/AppShell';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<TenantLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/provider/login" element={<AdminLogin />} />

        {/* Provider Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Tenant Routes */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cloud-accounts" element={<CloudAccounts />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/settings" element={<Settings />} />

          {/* Legacy paths */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/app/cloud-accounts" element={<Navigate to="/cloud-accounts" replace />} />
          <Route path="/app/assets" element={<Navigate to="/assets" replace />} />
          <Route path="/app/findings" element={<Navigate to="/findings" replace />} />
          <Route path="/app/settings" element={<Navigate to="/settings" replace />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
