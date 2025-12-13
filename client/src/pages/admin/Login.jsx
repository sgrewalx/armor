import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/armor-admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('provider_token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid provider credentials. Please try again.');
      }
    } catch (err) {
      setError('Unable to reach the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="logo-mark"><Shield size={22} /></div>
          <div>
            <p className="eyebrow">Provider console</p>
            <h1>Provider admin sign in</h1>
          </div>
        </div>

        <p className="muted">Access the provider control plane to manage tenants.</p>

        <form className="form" onSubmit={handleLogin}>
          <label className="form__label">
            <span>Email</span>
            <input
              className="form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@armor.cloud"
              required
            />
          </label>
          <label className="form__label">
            <span>Password</span>
            <input
              className="form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>

          {error && <div className="banner banner--danger">{error}</div>}

          <button className="primary-button full-width" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="helper-text">
          Tenant user? <Link to="/login">Go to tenant login</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
