import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('armor_token') : null,
  );
  const [user, setUser] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setTenantInfo(null);
      return;
    }

    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tenant');
        return res.json();
      })
      .then((data) => {
        setTenantInfo(data);
        setUser((prev) => prev || data.user || null);
      })
      .catch(() => {
        setTenantInfo({ tenantId: 'Unknown', user: { email: 'user@tenant.com' } });
      });
  }, [token]);

  const login = (authToken, authUser) => {
    setToken(authToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('armor_token', authToken);
    }
    setUser(authUser || null);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('armor_token');
    }
    setToken(null);
    setUser(null);
    setTenantInfo(null);
  };

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      tenantInfo,
      setTenantInfo,
      login,
      logout,
      authHeaders,
      isAuthenticated: Boolean(token),
    }),
    [token, user, tenantInfo, authHeaders],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
