import { useState, useEffect } from 'react';

function Integrations() {
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
            <div className="flex justify-between items-center mb-4">
                <h2>Cloud Integrations</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Connect AWS Account (IAM Role)</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.9em', color: '#666' }}>
                    Create an IAM Role in your AWS account with ReadOnlyAccess.
                    Update the Trust Relationship to allow your local user/role to assume it.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ marginTop: '1rem', maxWidth: '500px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px' }}>AWS Account ID</label>
                        <input
                            type="text"
                            value={formData.accountId}
                            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Role ARN (e.g. arn:aws:iam::123:role/MyRole)</label>
                        <input
                            type="text"
                            value={formData.roleArn}
                            onChange={(e) => setFormData({ ...formData, roleArn: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px' }}>External ID (Optional)</label>
                        <input
                            type="text"
                            value={formData.externalId}
                            onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px' }}>Region</label>
                        <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                        >
                            <option value="us-east-1">us-east-1 (N. Virginia)</option>
                            <option value="us-west-2">us-west-2 (Oregon)</option>
                            <option value="eu-west-1">eu-west-1 (Ireland)</option>
                            <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                        </select>
                    </div>
                    <button type="submit">Connect Account</button>
                </form>
            </div>

            <div className="card">
                <h3>Connected Accounts</h3>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '8px' }}>Provider</th>
                                <th style={{ padding: '8px' }}>Account ID</th>
                                <th style={{ padding: '8px' }}>Role ARN</th>
                                <th style={{ padding: '8px' }}>Connected At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => (
                                <tr key={acc.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{acc.provider}</td>
                                    <td style={{ padding: '8px' }}>{acc.accountId}</td>
                                    <td style={{ padding: '8px' }}>{acc.roleArn}</td>
                                    <td style={{ padding: '8px' }}>{new Date(acc.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {accounts.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>No accounts connected.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Integrations;
