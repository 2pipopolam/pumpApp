// src/pages/OAuth2Callback.tsx

import React, { useEffect, useContext } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';

// const OAuth2Callback: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { login } = useContext(AuthContext); // Используем функцию login из контекста

//   useEffect(() => {
//     const handleCallback = () => {
//       const params = new URLSearchParams(location.search);
//       const access = params.get('access');
//       const refresh = params.get('refresh');

//       if (access && refresh) {
//         // Используем функцию login из контекста
//         login(access, refresh);
//         // Перенаправляем пользователя на домашнюю страницу
//         navigate('/');
//       } else {
//         // Обработка ошибок
//         console.error('Не удалось получить токены');
//         navigate('/'); // Можно перенаправить на другую страницу или показать ошибку
//       }
//     };

//     handleCallback();
//   }, [location, navigate, login]);

//   return (
//     <div>
//       <p>Авторизация...</p>
//     </div>
//   );
// };

// export default OAuth2Callback;
