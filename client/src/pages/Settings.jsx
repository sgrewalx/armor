import { useState, useEffect } from 'react';

function Settings() {
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        provider: 'AWS',
        accountId: '',
        roleArn: '',
        externalId: '',
        region: 'us-east-1'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/cloud-accounts');
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error('Failed to fetch accounts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/cloud-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({
                    provider: 'AWS',
                    accountId: '',
                    roleArn: '',
                    externalId: '',
                    region: 'us-east-1'
                });
                fetchAccounts();
                alert('AWS Account Connected Successfully');
            } else {
                alert('Failed to connect account');
            }
        } catch (err) {
            console.error('Failed to add account', err);
        }
    };

    return (
        <div className="container">
            <div className="mb-8">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Settings</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>AWS Integration</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9em', color: '#666' }}>
                    To scan your AWS environment, create an IAM Role with <strong>ReadOnlyAccess</strong> and trust your local identity.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '1rem', maxWidth: '600px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em', fontWeight: '500' }}>AWS Account ID</label>
                            <input
                                type="text"
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                required
                                placeholder="123456789012"
                                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em', fontWeight: '500' }}>Region</label>
                            <select
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                                <option value="us-west-2">us-west-2 (Oregon)</option>
                                <option value="eu-west-1">eu-west-1 (Ireland)</option>
                                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em', fontWeight: '500' }}>Role ARN</label>
                        <input
                            type="text"
                            value={formData.roleArn}
                            onChange={(e) => setFormData({ ...formData, roleArn: e.target.value })}
                            required
                            placeholder="arn:aws:iam::123456789012:role/ArmorScanRole"
                            style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em', fontWeight: '500' }}>External ID (Optional)</label>
                        <input
                            type="text"
                            value={formData.externalId}
                            onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button type="submit" style={{ backgroundColor: '#4f46e5', padding: '8px 16px', borderRadius: '4px', border: 'none', color: 'white', cursor: 'pointer' }}>
                            Connect Account
                        </button>
                    </div>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Connected Accounts</h3>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', fontSize: '0.9em', color: '#718096' }}>Provider</th>
                                <th style={{ padding: '12px', fontSize: '0.9em', color: '#718096' }}>Account ID</th>
                                <th style={{ padding: '12px', fontSize: '0.9em', color: '#718096' }}>Role ARN</th>
                                <th style={{ padding: '12px', fontSize: '0.9em', color: '#718096' }}>Connected At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '12px' }}>{acc.provider}</td>
                                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{acc.accountId}</td>
                                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.9em' }}>{acc.roleArn}</td>
                                    <td style={{ padding: '12px' }}>{new Date(acc.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {accounts.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>No accounts connected yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Settings;
