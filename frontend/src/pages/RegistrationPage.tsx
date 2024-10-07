// src/pages/RegistrationPage.tsx

// import React, { useState, useContext } from 'react';
// import { register } from '../services/api';
// //import { AuthContext } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const RegistrationPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { login } = useContext(AuthContext);
//   
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     password2: '',
//   });
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     if (formData.password !== formData.password2) {
//       setError('Пароли не совпадают.');
//       return;
//     }
//     try {
//       const response = await register(formData);
//       login(response.data.access, response.data.refresh, response.data.user);
//       navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Произошла ошибка при регистрации.');
//     }
//   };

//   return (
//     <div className="registration-page">
//       <h2>Регистрация</h2>
//       {error && <p className="error text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit} className="flex flex-col max-w-md mx-auto">
//         <input 
//           type="text" 
//           name="username" 
//           placeholder="Имя пользователя" 
//           value={formData.username} 
//           onChange={handleChange} 
//           required 
//           className="mb-2 p-2 border rounded"
//         />
//         <input 
//           type="email" 
//           name="email" 
//           placeholder="Email" 
//           value={formData.email} 
//           onChange={handleChange} 
//           required 
//           className="mb-2 p-2 border rounded"
//         />
//         <input 
//           type="password" 
//           name="password" 
//           placeholder="Пароль" 
//           value={formData.password} 
//           onChange={handleChange} 
//           required 
//           className="mb-2 p-2 border rounded"
//         />
//         <input 
//           type="password" 
//           name="password2" 
//           placeholder="Подтвердите пароль" 
//           value={formData.password2} 
//           onChange={handleChange} 
//           required 
//           className="mb-4 p-2 border rounded"
//         />
//         <button type="submit" className="p-2 bg-blue-500 text-white rounded">
//           Зарегистрироваться
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RegistrationPage;










import React, { useState, useContext } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают.');
      return;
    }
    try {
      const response = await register(formData);
      login(response.data.access, response.data.refresh, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка при регистрации.');
    }
  };

  return (
    <div className="registration-page">
      <h2>Регистрация</h2>
      {error && <p className="error text-red-500">{error}</p>}
      {/* Registration form */}
    </div>
  );
};

export default RegistrationPage;
