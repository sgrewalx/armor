import { useOutletContext } from 'react-router-dom';
import { Shield, User } from 'lucide-react';

const iamPlaceholders = [
  'SCIM provisioning',
  'SAML configuration',
  'Just-in-time access',
];

function Settings() {
  const { tenantInfo } = useOutletContext();

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page__title">Settings</h1>
        </div>
      </div>

      <div className="grid grid--cols-2 gap-lg">
        <div className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Tenant</p>
              <h3>Tenant details</h3>
            </div>
            <Shield size={16} />
          </div>
          <div className="info-grid">
            <div>
              <div className="muted">Tenant ID</div>
              <div className="table__title">{tenantInfo?.tenantId || 'Loading...'}</div>
            </div>
            <div>
              <div className="muted">Plan</div>
              <div className="table__title">Enterprise</div>
            </div>
            <div>
              <div className="muted">Data region</div>
              <div className="table__title">US-East</div>
            </div>
            <div>
              <div className="muted">Support</div>
              <div className="table__title">24/7 Priority</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">User</p>
              <h3>Profile</h3>
            </div>
            <User size={16} />
          </div>
          <div className="info-grid">
            <div>
              <div className="muted">Email</div>
              <div className="table__title">{tenantInfo?.user?.email || 'user@tenant.com'}</div>
            </div>
            <div>
              <div className="muted">Role</div>
              <div className="table__title">Administrator</div>
            </div>
            <div>
              <div className="muted">MFA</div>
              <div className="pill pill--subtle">Enabled</div>
            </div>
            <div>
              <button className="primary-button">Update profile</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card__header">
          <div>
            <p className="eyebrow">IAM</p>
            <h3>Identity & access</h3>
          </div>
        </div>
        <ul className="iam-list">
          {iamPlaceholders.map((item) => (
            <li key={item} className="iam-list__item">
              <div className="table__title">{item}</div>
              <span className="muted">Coming soon</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Settings;
