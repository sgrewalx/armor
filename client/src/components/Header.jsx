import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        <div className="logo-mark logo-mark--ghost">
          <Shield size={18} />
        </div>
        <div>
          <div className="brand-title">Armor</div>
          <div className="brand-subtitle">Cloud Security</div>
        </div>
      </Link>

      {isAuthenticated ? (
        <div className="user-menu">
          <button className="ghost-button" onClick={() => navigate('/dashboard')}>
            Open dashboard
          </button>
          <button
            className="user-menu__chip"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <User size={16} />
            <span>Sign out</span>
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <div className="header-actions">
          <Link className="ghost-button" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/signup">
            Request access
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
