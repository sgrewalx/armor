import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onLogout }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: 'block',
        padding: '12px 20px',
        color: isActive(path) ? '#fff' : '#a0aec0',
        backgroundColor: isActive(path) ? '#2d3748' : 'transparent',
        textDecoration: 'none',
        borderRadius: '6px',
        marginBottom: '4px',
        transition: 'all 0.2s'
    });

    return (
        <div style={{
            width: '240px',
            height: '100vh',
            backgroundColor: '#1a202c',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
        }}>
            <div style={{ marginBottom: '40px', paddingLeft: '20px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Armor <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>MVP</span></h1>
            </div>

            <nav style={{ flex: 1 }}>
                <Link to="/" style={linkStyle('/')}>Dashboard</Link>
                <Link to="/inventory" style={linkStyle('/inventory')}>Inventory</Link>
                <Link to="/scans" style={linkStyle('/scans')}>Scans</Link>
                <Link to="/settings" style={linkStyle('/settings')}>Settings</Link>
            </nav>

            <div style={{ borderTop: '1px solid #2d3748', paddingTop: '20px' }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: '1px solid #4a5568',
                        color: '#a0aec0',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
