import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TenantLogin from './pages/tenant/Login';
import Dashboard from './pages/tenant/Dashboard';
import CloudAccounts from './pages/tenant/CloudAccounts';
import Assets from './pages/tenant/Assets';
import Findings from './pages/tenant/Findings';
import Settings from './pages/tenant/Settings';
import AppShell from './components/AppShell';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Provider Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Tenant Routes */}
        <Route path="/login" element={<TenantLogin />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route element={<AppShell />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/cloud-accounts" element={<CloudAccounts />} />
          <Route path="/app/assets" element={<Assets />} />
          <Route path="/app/findings" element={<Findings />} />
          <Route path="/app/settings" element={<Settings />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
