

// src/components/GoogleLoginButton.tsx

import React from 'react';

const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    // Перенаправляем пользователя на эндпоинт аутентификации через Google на бэкенде
    window.location.href = 'http://localhost:8000/auth/google/login/';
  };

  return (
    <button
      onClick={handleLogin}
      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Войти через Google
    </button>
  );
};

export default GoogleLoginButton;

