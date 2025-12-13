import { useMemo, useState } from 'react';
import { Cloud, Plus } from 'lucide-react';

const providers = ['AWS', 'Azure', 'GCP', 'OCI'];

const mockAccounts = [
  { id: 'aws-01', name: 'Production', provider: 'AWS', status: 'Connected', regions: 12 },
  { id: 'aws-02', name: 'Sandbox', provider: 'AWS', status: 'Pending', regions: 4 },
  { id: 'az-01', name: 'Corp', provider: 'Azure', status: 'Connected', regions: 6 },
  { id: 'gcp-01', name: 'Analytics', provider: 'GCP', status: 'Disconnected', regions: 3 },
  { id: 'oci-01', name: 'Research', provider: 'OCI', status: 'Connected', regions: 2 },
];

const statusClass = {
  Connected: 'badge badge--success',
  Pending: 'badge badge--warning',
  Disconnected: 'badge badge--danger',
};

function CloudAccounts() {
  const [activeTab, setActiveTab] = useState('AWS');

  const accounts = useMemo(
    () => mockAccounts.filter((acct) => acct.provider === activeTab),
    [activeTab]
  );

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Integrations</p>
          <h1 className="page__title">Cloud Accounts</h1>
        </div>
        <button className="primary-button">
          <Plus size={16} /> Add Cloud Account
        </button>
      </div>

      <div className="tabs">
        {providers.map((provider) => (
          <button
            key={provider}
            className={`tab ${activeTab === provider ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(provider)}
          >
            <Cloud size={16} /> {provider}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card__header">
          <h3>{activeTab} accounts</h3>
          <div className="pill pill--subtle">Status & coverage</div>
        </div>
        <div className="table">
          <div
            className="table__header"
            style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}
          >
            <div>Account</div>
            <div>Regions</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {accounts.map((account) => (
            <div
              className="table__row"
              key={account.id}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}
            >
              <div>
                <div className="table__title">{account.name}</div>
                <div className="muted">ID: {account.id}</div>
              </div>
              <div>{account.regions}</div>
              <div><span className={statusClass[account.status]}>{account.status}</span></div>
              <div className="table__actions">
                <button className="ghost-button">View</button>
                <button className="ghost-button">Rescan</button>
              </div>
            </div>
          ))}

          {!accounts.length && (
            <div className="empty-state">
              <Cloud size={20} />
              <div>
                <div className="empty-state__title">No accounts connected</div>
                <p className="muted">Add a cloud account to start inventory and posture checks.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CloudAccounts;
