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
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshTokenState(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Инициализация состояния из localStorage при загрузке приложения
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshTokenState(storedRefreshToken);
      // Получение данных пользователя
      api.get('/user-profile/')
        .then((response) => {
          setUser(response.data.user);
        })
        .catch((err) => {
          console.error('Ошибка при получении профиля пользователя:', err);
          logout();
        });
    }
  }, []);

  // Обновление токенов при истечении access токена
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
    }, 15 * 60 * 1000); // Обновление каждые 15 минут

    return () => clearInterval(interval);
  }, [refreshTokenState]);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken: refreshTokenState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};





//import React, { createContext, useState, useEffect, ReactNode } from 'react';
//import { useNavigate } from 'react-router-dom';

// interface AuthContextType {
//   user: any;
//   login: (accessToken: string, refreshToken: string, user: any) => void;
//   logout: () => void;
// }





// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<any>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Проверка существующих токенов в localStorage
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = (accessToken: string, refreshToken: string, user: any) => {
//     localStorage.setItem('accessToken', accessToken);
//     localStorage.setItem('refreshToken', refreshToken);
//     localStorage.setItem('user', JSON.stringify(user));
//     setUser(user);
//     navigate('/');
//   };

//   const logout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     setUser(null);
//     navigate('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
