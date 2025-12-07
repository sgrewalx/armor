import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/armor-admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('provider_token', data.token);
                navigate('/admin/dashboard');
            } else {
                alert('Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error logging in');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Provider Admin</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-2">Email</label>
                        <input
                            className="border w-full p-2 rounded"
                            value={email} onChange={e => setEmail(e.target.value)}
                            type="email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Password</label>
                        <input
                            className="border w-full p-2 rounded"
                            value={password} onChange={e => setPassword(e.target.value)}
                            type="password"
                        />
                    </div>
                    <button className="bg-blue-600 text-white w-full p-2 rounded">Login</button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
