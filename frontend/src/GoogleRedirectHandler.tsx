// src/components/GoogleRedirectHandler.tsx

import React, { useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from './contexts/AuthContext';

// const GoogleRedirectHandler: React.FC = () => {
//   const navigate = useNavigate();
//   const { login } = useContext(AuthContext); // Используем функцию login из контекста

//   useEffect(() => {
//     const handleRedirect = async () => {
//       const params = new URLSearchParams(window.location.search);
//       const access = params.get('access');
//       const refresh = params.get('refresh');

//       if (access && refresh) {
//         // Вызовите login с обоими токенами
//         login(access, refresh);
//         navigate('/'); // Перенаправьте пользователя на домашнюю страницу
//       } else {
//         console.error('Не удалось получить токены');
//         navigate('/'); // Можно перенаправить на страницу ошибки или другую страницу
//       }
//     };

//     handleRedirect();
//   }, [navigate, login]);

//   return (
//     <div>
//       <p>Авторизация...</p>
//     </div>
//   );
// };

// export default GoogleRedirectHandler;

