import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

const mockAssets = [
  { id: 1, name: 'eks-prod', type: 'Kubernetes', provider: 'AWS', region: 'us-east-1', risk: 'High' },
  { id: 2, name: 'sql-primary', type: 'Database', provider: 'Azure', region: 'west-europe', risk: 'Medium' },
  { id: 3, name: 'web-tier', type: 'VM', provider: 'GCP', region: 'us-central1', risk: 'Low' },
  { id: 4, name: 'payments-lb', type: 'Load Balancer', provider: 'AWS', region: 'us-west-2', risk: 'Critical' },
  { id: 5, name: 'data-lake', type: 'Storage', provider: 'OCI', region: 'ap-mumbai-1', risk: 'Medium' },
];

const riskClass = {
  Critical: 'badge badge--danger',
  High: 'badge badge--warning',
  Medium: 'badge badge--info',
  Low: 'badge badge--success',
};

function Assets() {
  const [provider, setProvider] = useState('All');
  const [risk, setRisk] = useState('All');

  const filteredAssets = useMemo(() => {
    return mockAssets.filter((asset) => {
      const providerMatch = provider === 'All' || asset.provider === provider;
      const riskMatch = risk === 'All' || asset.risk === risk;
      return providerMatch && riskMatch;
    });
  }, [provider, risk]);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="page__title">Assets</h1>
        </div>
        <div className="chip">{filteredAssets.length} assets</div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="filters">
            <div className="filter">
              <Filter size={16} />
              <span>Filters</span>
            </div>
            <div className="select-group">
              <label>Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option>All</option>
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
                <option>OCI</option>
              </select>
            </div>
            <div className="select-group">
              <label>Risk</label>
              <select value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <button className="ghost-button">Export CSV</button>
        </div>

        <div className="table">
          <div className="table__header">
            <div>Asset Name</div>
            <div>Type</div>
            <div>Cloud Provider</div>
            <div>Region</div>
            <div>Risk</div>
          </div>
          {filteredAssets.map((asset) => (
            <div className="table__row" key={asset.id}>
              <div className="table__title">{asset.name}</div>
              <div>{asset.type}</div>
              <div>{asset.provider}</div>
              <div>{asset.region}</div>
              <div><span className={riskClass[asset.risk]}>{asset.risk}</span></div>
            </div>
          ))}

          {!filteredAssets.length && (
            <div className="empty-state">
              <Filter size={20} />
              <div>
                <div className="empty-state__title">No assets match these filters</div>
                <p className="muted">Adjust filters or onboard more accounts.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assets;
