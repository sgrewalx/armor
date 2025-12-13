import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const mockFindings = [
  { id: 'F-001', severity: 'Critical', category: 'Identity', resource: 'iam-root', status: 'Open' },
  { id: 'F-002', severity: 'High', category: 'Network', resource: 'sg-public', status: 'Open' },
  { id: 'F-003', severity: 'Medium', category: 'Workload', resource: 'eks-prod', status: 'Investigating' },
  { id: 'F-004', severity: 'Low', category: 'Storage', resource: 's3-backups', status: 'Resolved' },
];

const severityClass = {
  Critical: 'badge badge--danger',
  High: 'badge badge--warning',
  Medium: 'badge badge--info',
  Low: 'badge badge--success',
};

function Findings() {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Risk</p>
          <h1 className="page__title">Findings</h1>
        </div>
        <div className="chip chip--warning">
          <AlertTriangle size={16} /> Active
        </div>
      </div>

      <div className="card">
        <div className="table">
          <div className="table__header">
            <div>ID</div>
            <div>Severity</div>
            <div>Category</div>
            <div>Resource</div>
            <div>Status</div>
          </div>
          {mockFindings.map((finding) => (
            <div key={finding.id} className="table__row">
              <div className="table__title">{finding.id}</div>
              <div><span className={severityClass[finding.severity]}>{finding.severity}</span></div>
              <div>{finding.category}</div>
              <div>{finding.resource}</div>
              <div className="table__actions">
                <span className="pill pill--subtle">{finding.status}</span>
                <button className="ghost-button">Details</button>
              </div>
            </div>
          ))}
        </div>
        <div className="helper-text">
          <CheckCircle2 size={16} /> Findings sync automatically from your connected cloud accounts.
        </div>
      </div>
    </div>
  );
}

export default Findings;
