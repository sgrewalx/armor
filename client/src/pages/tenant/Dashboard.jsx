import { useState, useEffect } from 'react';

function TenantDashboard() {
    const [assets, setAssets] = useState([]);
    const [identity, setIdentity] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('tenant_token');

        // Fetch Identity
        fetch('http://localhost:3000/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setIdentity(data));

        // Fetch Assets
        fetch('http://localhost:3000/api/assets', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setAssets(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-10 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
                {identity && (
                    <div className="text-right">
                        <p className="font-bold">{identity.user.email}</p>
                        <p className="text-sm text-gray-500">Tenant: {identity.tenantId}</p>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Assets Inventory</h2>
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">Type</th>
                                <th className="py-2 px-4 text-left">Region</th>
                                <th className="py-2 px-4 text-left">Native ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id} className="border-t">
                                    <td className="py-2 px-4">{asset.name || '-'}</td>
                                    <td className="py-2 px-4">{asset.type}</td>
                                    <td className="py-2 px-4">{asset.region}</td>
                                    <td className="py-2 px-4">{asset.native_id}</td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-500">No assets found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TenantDashboard;
