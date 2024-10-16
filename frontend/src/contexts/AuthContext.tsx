// src/contexts/AuthContext.tsx

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { api, refreshToken as refreshTokenAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (access: string, refresh: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);

  const login = (access: string, refresh: string, userData: User) => {
    setAccessToken(access);
    setRefreshTokenState(refresh);
    setUser(userData);
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshTokenState(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Initialize state from localStorage on app load
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshTokenState(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Refresh the access token periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshTokenState) {
        try {
          const response = await refreshTokenAPI(refreshTokenState);
          const newAccess = response.data.access;
          setAccessToken(newAccess);
          localStorage.setItem('accessToken', newAccess);
        } catch (err) {
          console.error('Не удалось обновить токен:', err);
          logout();
        }
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [refreshTokenState]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken: refreshTokenState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
