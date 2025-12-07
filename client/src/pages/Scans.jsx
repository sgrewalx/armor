import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Scans() {
    const [scans, setScans] = useState([]);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        fetchScans();
        // Poll for updates every 5s if there is a running scan
        const interval = setInterval(() => {
            fetchScans();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchScans = () => {
        fetch('/api/scans')
            .then(res => res.json())
            .then(data => {
                setScans(data);
                if (data.some(s => s.status === 'RUNNING')) {
                    setScanning(true);
                } else {
                    setScanning(false);
                }
            })
            .catch(err => console.error(err));
    };

    const handleStartScan = async () => {
        setScanning(true);
        try {
            await fetch('/api/scans', { method: 'POST' });
            fetchScans();
        } catch (err) {
            console.error(err);
            setScanning(false);
        }
    };

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-4">
                <h2>Vulnerability Scans</h2>
            </div>

            <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <button
                    onClick={handleStartScan}
                    disabled={scanning}
                    style={{ fontSize: '1.2em', padding: '1rem 2rem', opacity: scanning ? 0.7 : 1 }}
                >
                    {scanning ? 'Scanning in progress...' : 'Start New Scan'}
                </button>
                {scanning && <p style={{ marginTop: '1rem', color: '#666' }}>This will take about 5 seconds...</p>}
            </div>

            <div className="card">
                <h3>Recent Scans</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px' }}>ID</th>
                            <th style={{ padding: '8px' }}>Status</th>
                            <th style={{ padding: '8px' }}>Started At</th>
                            <th style={{ padding: '8px' }}>Findings</th>
                            <th style={{ padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scans.map(scan => (
                            <tr key={scan.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>#{scan.id}</td>
                                <td style={{ padding: '8px' }}>
                                    <span style={{
                                        padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em',
                                        backgroundColor: scan.status === 'COMPLETED' ? '#d1fae5' : (scan.status === 'RUNNING' ? '#bfdbfe' : '#f3f4f6'),
                                        color: scan.status === 'COMPLETED' ? '#065f46' : (scan.status === 'RUNNING' ? '#1e40af' : '#374151')
                                    }}>
                                        {scan.status}
                                    </span>
                                </td>
                                <td style={{ padding: '8px' }}>{new Date(scan.startedAt).toLocaleString()}</td>
                                <td style={{ padding: '8px' }}>{scan.status === 'COMPLETED' ? scan._count.results : '-'}</td>
                                <td style={{ padding: '8px' }}>
                                    {scan.status === 'COMPLETED' && (
                                        <Link to={`/scans/${scan.id}`} style={{ fontSize: '0.9em' }}>View Results</Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Scans;
