import Sidebar from './Sidebar';

function Layout({ children, onLogout }) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar onLogout={onLogout} />
            <div style={{
                marginLeft: '240px',
                padding: '40px',
                width: 'calc(100% - 240px)',
                minHeight: '100vh',
                backgroundColor: '#f7fafc'
            }}>
                {children}
            </div>
        </div>
    );
}

export default Layout;
