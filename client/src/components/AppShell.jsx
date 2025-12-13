import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Shield, Cloud, LayoutDashboard, Server, AlertOctagon, Settings, LogOut, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/cloud-accounts', label: 'Cloud Accounts', icon: <Cloud size={18} /> },
  { to: '/assets', label: 'Assets', icon: <Server size={18} /> },
  { to: '/findings', label: 'Findings', icon: <AlertOctagon size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

function AppShell() {
  const navigate = useNavigate();
  const [tenantInfo, setTenantInfo] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tenant_token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tenant');
        return res.json();
      })
      .then((data) => setTenantInfo(data))
      .catch(() => setTenantInfo({ tenantId: 'Unknown', user: { email: 'user@tenant.com' } }));
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('tenant_token');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="sidebar__brand">
          <Shield size={26} />
          <div>
            <div className="brand-title">Armor</div>
            <div className="brand-subtitle">by CodeMachine</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <div className="app-shell__main">
        <header className="app-shell__header">
          <div>
            <p className="eyebrow">Tenant</p>
            <div className="header__title">{tenantInfo?.tenantId || 'Loading tenant...'}</div>
          </div>
          <div className="header__profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="header__profile-text">
              <div className="header__profile-name">{tenantInfo?.user?.email || 'Signed in user'}</div>
              <div className="header__profile-role">Security Admin</div>
            </div>
            <button className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="app-shell__content">
          <Outlet context={{ tenantInfo }} />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
