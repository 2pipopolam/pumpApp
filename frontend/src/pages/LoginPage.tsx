// LoginPage.tsx
import React, { useState, useContext } from 'react';
import { obtainToken } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios, { AxiosError } from 'axios';

interface ErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: any;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginContext } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await obtainToken(formData);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      const userResponse = await axios.get('/user-profile/');
      
      loginContext(response.data.access, response.data.refresh, userResponse.data.user);
      
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.detail || error.response?.data?.message || 'Произошла ошибка при входе.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/google/login/', {
        id_token: credentialResponse.credential,
      });

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      loginContext(access_token, refresh_token, user);

      navigate('/');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.detail || error.response?.data?.message || 'An error occurred during Google authentication.');
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-page">
      <h2>Вход</h2>
      {error && <p className="error text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto">
        <input 
          type="text" 
          name="username" 
          placeholder="Имя пользователя" 
          value={formData.username} 
          onChange={handleChange} 
          required 
          className="mb-2 p-2 border rounded"
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Пароль" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          className="mb-4 p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Войти
        </button>
      </form>
      <div className="google-login flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Не удалось войти через Google.')}
        />
      </div>
    </div>
  );
};

export default LoginPage;
