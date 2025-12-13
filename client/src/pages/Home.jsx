import { Link } from 'react-router-dom';
import { Shield, Cloud, LockKeyhole } from 'lucide-react';
import Header from '../components/Header';

function Home() {
  return (
    <div className="public-shell">
      <Header />
      <main className="hero">
        <div className="hero__content">
          <div className="pill pill--subtle">Armor by CodeMachine</div>
          <h1>Cloud Security, Simplified</h1>
          <p className="muted hero__subtitle">
            Multi-cloud CNAPP for AWS, Azure, GCP, and OCI.
          </p>
          <div className="hero__actions">
            <Link className="primary-button" to="/signup">
              Request Access
            </Link>
            <Link className="ghost-button" to="/login">
              Login
            </Link>
          </div>
          <div className="hero__meta">
            <div className="hero__meta-item">
              <div className="hero__icon"><Cloud size={16} /></div>
              Multi-cloud coverage out of the box
            </div>
            <div className="hero__meta-item">
              <div className="hero__icon"><LockKeyhole size={16} /></div>
              Tenant isolation built for enterprises
            </div>
          </div>
        </div>
        <div className="hero__panel">
          <div className="hero__panel-header">
            <div className="logo-mark logo-mark--ghost">
              <Shield size={18} />
            </div>
            <div>
              <p className="eyebrow">Live posture</p>
              <div className="hero__panel-title">CNAPP Overview</div>
            </div>
          </div>
          <div className="hero__stats">
            <div className="stat">
              <span className="stat__label">Cloud accounts</span>
              <span className="stat__value">48</span>
            </div>
            <div className="stat">
              <span className="stat__label">Open risks</span>
              <span className="stat__value stat__value--warning">126</span>
            </div>
            <div className="stat">
              <span className="stat__label">Resolved this week</span>
              <span className="stat__value stat__value--success">32</span>
            </div>
          </div>
          <div className="hero__glow" />
        </div>
      </main>
      <footer className="site-footer">
        <Link className="muted" to="/provider/login">
          Provider Login
        </Link>
      </footer>
    </div>
  );
}

export default Home;
