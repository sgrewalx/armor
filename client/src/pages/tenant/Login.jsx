import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

function TenantLogin() {
  const [tenantId, setTenantId] = useState('');
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
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tenant_token', data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials or tenant. Please try again.');
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
            <p className="eyebrow">Armor by CodeMachine</p>
            <h1>Tenant sign in</h1>
          </div>
        </div>

        <p className="muted">Access your CNAPP workspace with your tenant UUID and credentials.</p>

        <form className="form" onSubmit={handleLogin}>
          <label className="form__label">
            <span>Tenant UUID</span>
            <input
              className="form__input"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              required
            />
          </label>

          <label className="form__label">
            <span>Email</span>
            <input
              className="form__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="form__label">
            <span>Password</span>
            <input
              className="form__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="banner banner--danger">{error}</div>}

          <button className="primary-button full-width" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="helper-text">Single sign-on available upon request.</div>
      </div>
    </div>
  );
}

export default TenantLogin;
