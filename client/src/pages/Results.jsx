import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Results() {
    const { id } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/scans/${id}/results`)
            .then(res => res.json())
            .then(data => {
                setResults(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    return (
        <div className="container">
            <h2>Scan Results (#{id})</h2>
            <Link to="/scans" style={{ display: 'inline-block', marginBottom: '1rem' }}>&larr; Back to Scans</Link>

            <div className="card">
                {loading ? <p>Loading results...</p> : (
                    results.length === 0 ? <p>No vulnerabilities found.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '8px' }}>Severity</th>
                                    <th style={{ padding: '8px' }}>Asset</th>
                                    <th style={{ padding: '8px' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(result => (
                                    <tr key={result.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em',
                                                backgroundColor: result.severity === 'HIGH' ? '#fecaca' : '#fde68a',
                                                color: result.severity === 'HIGH' ? '#991b1b' : '#92400e'
                                            }}>
                                                {result.severity}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px' }}>{result.asset.name} ({result.asset.type})</td>
                                        <td style={{ padding: '8px' }}>{result.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}

export default Results;
