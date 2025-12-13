import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, AlertTriangle, Cloud, ShieldCheck } from 'lucide-react';

const defaultSummary = {
  assets: 0,
  findings: 0,
  criticalFindings: 0,
  clouds: 0,
};

const mockActivity = [
  { title: 'New AWS account connected', time: '2h ago' },
  { title: 'Baseline scan completed', time: '5h ago' },
  { title: 'CIS benchmark updated', time: '1d ago' },
];

const mockTrends = [65, 72, 75, 81, 79, 88, 93];

function StatCard({ title, value, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p className="eyebrow">{title}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

function TrendBar({ values }) {
  return (
    <div className="trend-bar">
      {values.map((value, idx) => (
        <div key={idx} className="trend-bar__item" style={{ height: `${value}%` }} />
      ))}
    </div>
  );
}

function Dashboard() {
  const { tenantInfo } = useOutletContext();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('tenant_token') : null;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('http://localhost:3000/api/assets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load assets');
        return res.json();
      })
      .then((data) => {
        setAssets(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch(() => {
        setAssets([]);
        setError('Using sample data until the API is reachable.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const summary = useMemo(() => {
    if (!assets.length) return defaultSummary;
    const criticalFindings = Math.max(3, Math.round(assets.length * 0.2));
    return {
      assets: assets.length,
      findings: Math.max(10, assets.length * 2),
      criticalFindings,
      clouds: 4,
    };
  }, [assets]);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="page__title">Security posture</h1>
        </div>
        <div className="pill">{tenantInfo?.tenantId || 'Tenant loading...'}</div>
      </div>

      {error && <div className="banner banner--warning">{error}</div>}

      <div className="grid grid--cols-4 gap-lg">
        <StatCard title="Total Assets" value={summary.assets} icon={<ShieldCheck size={20} />} />
        <StatCard title="Open Findings" value={summary.findings} icon={<Activity size={20} />} />
        <StatCard title="Critical Findings" value={summary.criticalFindings} icon={<AlertTriangle size={20} />} />
        <StatCard title="Cloud Accounts" value={summary.clouds} icon={<Cloud size={20} />} />
      </div>

      <div className="grid grid--cols-2 gap-lg mt-lg">
        <div className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Exposure trend</p>
              <h3>Findings over time</h3>
            </div>
            <div className="pill pill--subtle">Last 7 checks</div>
          </div>
          <TrendBar values={mockTrends} />
          <p className="muted mt-sm">Placeholder visualization. Connect to your SIEM or analytics layer for richer insights.</p>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Activity</p>
              <h3>Recent events</h3>
            </div>
            <div className="pill pill--subtle">Live</div>
          </div>
          <ul className="timeline">
            {mockActivity.map((item) => (
              <li key={item.title} className="timeline__item">
                <div className="timeline__dot" />
                <div>
                  <div className="timeline__title">{item.title}</div>
                  <div className="timeline__time">{item.time}</div>
                </div>
              </li>
            ))}
          </ul>
          {loading && <div className="skeleton skeleton--line" />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
