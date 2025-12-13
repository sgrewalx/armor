import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Cloud, LayoutDashboard, Server, AlertOctagon, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/cloud-accounts', label: 'Cloud Accounts', icon: <Cloud size={18} /> },
  { to: '/assets', label: 'Assets', icon: <Server size={18} /> },
  { to: '/findings', label: 'Findings', icon: <AlertOctagon size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

function AppShell() {
  const navigate = useNavigate();
  const { tenantInfo, logout, user } = useAuth();

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

        <button
          className="sidebar__logout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
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
              <div className="header__profile-name">{user?.email || tenantInfo?.user?.email || 'Signed in user'}</div>
              <div className="header__profile-role">Security Admin</div>
            </div>
            <button
              className="ghost-button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
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
