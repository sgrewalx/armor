import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TenantLogin from './pages/tenant/Login';
import TenantDashboard from './pages/tenant/Dashboard';
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
        <Route path="/app/*" element={<TenantDashboard />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
