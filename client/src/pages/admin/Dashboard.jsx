import { useState } from 'react';

function AdminDashboard() {
    const [tenantName, setTenantName] = useState('');
    const [rootEmail, setRootEmail] = useState('');
    const [rootPassword, setRootPassword] = useState('');
    const [result, setResult] = useState(null);

    const createTenant = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('provider_token');

        try {
            const res = await fetch('http://localhost:3000/armor-admin/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: tenantName, rootEmail, rootPassword }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert('Failed to create tenant');
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>

            <div className="bg-white p-6 rounded shadow max-w-lg">
                <h2 className="text-xl font-bold mb-4">Create New Tenant</h2>
                <form onSubmit={createTenant}>
                    <div className="mb-2">
                        <label>Tenant Name</label>
                        <input className="border w-full p-2" value={tenantName} onChange={e => setTenantName(e.target.value)} />
                    </div>
                    <div className="mb-2">
                        <label>Root User Email</label>
                        <input className="border w-full p-2" value={rootEmail} onChange={e => setRootEmail(e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <label>Root Password</label>
                        <input className="border w-full p-2" value={rootPassword} onChange={e => setRootPassword(e.target.value)} />
                    </div>
                    <button className="bg-green-600 text-white p-2 rounded">Create Tenant</button>
                </form>

                {result && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <p><strong>Tenant Created!</strong></p>
                        <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
