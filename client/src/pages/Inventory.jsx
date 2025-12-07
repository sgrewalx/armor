import { useState, useEffect } from 'react';

function Inventory() {
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState({ name: '', type: 'AWS_EC2', region: 'us-east-1' });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/inventory');
            const data = await res.json();
            setAssets(data);
        } catch (err) {
            console.error('Failed to fetch assets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/inventory/sync', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
            fetchAssets();
        } catch (err) {
            alert('Sync Failed');
        } finally {
            setSyncing(false);
        }
    };

    const handleAddAsset = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });
            if (res.ok) {
                setNewAsset({ name: '', type: 'AWS_EC2', region: 'us-east-1' });
                fetchAssets();
            }
        } catch (err) {
            console.error('Failed to add asset', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
            fetchAssets();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-4">
                <h2>Cloud Asset Inventory</h2>
                <button onClick={handleSync} disabled={syncing} style={{ backgroundColor: '#2563eb' }}>
                    {syncing ? 'Syncing with AWS...' : 'Sync Assets from AWS'}
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Add Manual Asset (Optional)</h3>
                <form onSubmit={handleAddAsset} className="flex gap-4 items-center" style={{ marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Asset Name (e.g. prod-db-1)"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: 1 }}
                    />
                    <select
                        value={newAsset.type}
                        onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="AWS_EC2">AWS EC2</option>
                        <option value="AWS_S3">AWS S3</option>
                        <option value="GCP_COMPUTE">GCP Compute</option>
                        <option value="AZURE_VM">Azure VM</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Region"
                        value={newAsset.region}
                        onChange={(e) => setNewAsset({ ...newAsset, region: e.target.value })}
                        required
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100px' }}
                    />
                    <button type="submit">Add Asset</button>
                </form>
            </div>

            <div className="card">
                <h3>Current Assets</h3>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px' }}>Type</th>
                                <th style={{ padding: '8px' }}>Region</th>
                                <th style={{ padding: '8px' }}>Created At</th>
                                <th style={{ padding: '8px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{asset.name}</td>
                                    <td style={{ padding: '8px' }}><span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em' }}>{asset.type}</span></td>
                                    <td style={{ padding: '8px' }}>{asset.region}</td>
                                    <td style={{ padding: '8px' }}>{new Date(asset.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '8px' }}>
                                        <button onClick={() => handleDelete(asset.id)} style={{ backgroundColor: '#ef4444', fontSize: '0.8em', padding: '4px 8px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>No assets found. Upload AWS Credentials in Integrations page to sync.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Inventory;
