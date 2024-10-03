// src/pages/LoginPage.tsx

import React, { useState, useContext } from 'react';
import { obtainToken } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api, API_URL } from '../services/api';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginContext } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await obtainToken(formData);
      // Получение пользовательских данных
      const userResponse = await api.get('/user-profile/');
      loginContext(response.data.access, response.data.refresh, userResponse.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка при входе.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Отправьте токен на бэкенд для аутентификации
      const response = await axios.post(`${API_URL}/social-auth/login/google-oauth2/`, {
        access_token: credentialResponse.credential,
      });
      // Предполагается, что бэкенд возвращает JWT токены и данные пользователя
      loginContext(response.data.access, response.data.refresh, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка при аутентификации через Google.');
      console.error(err);
    }
  };

  const handleGoogleFailure = () => {
    setError('Не удалось войти через Google.');
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
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Войти
        </button>
      </form>
      <div className="google-login flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
      </div>
    </div>
  );
};

export default LoginPage;
