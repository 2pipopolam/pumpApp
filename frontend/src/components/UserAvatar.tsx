// UserAvatar.tsx

import React, { useState } from 'react';
// import { UserData } from '../types';

// interface UserAvatarProps {
//   userData: UserData;
//   onDeleteAvatar: () => void;
//   onUploadAvatar: (file: File) => void;
//   isDarkMode: boolean;
//   size?: 'small' | 'medium' | 'large'; // Добавляем пропс size
// }

// const UserAvatar: React.FC<UserAvatarProps> = ({
//   userData,
//   onDeleteAvatar,
//   onUploadAvatar,
//   isDarkMode,
//   size = 'medium', // Значение по умолчанию
// }) => {
//   const [isMenuVisible, setIsMenuVisible] = useState(false);

//   const handleAvatarMouseEnter = () => {
//     setIsMenuVisible(true);
//   };

//   const handleAvatarMouseLeave = () => {
//     setIsMenuVisible(false);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       onUploadAvatar(e.target.files[0]);
//     }
//   };

//   // Определяем классы размера аватара
//   const sizeClasses = {
//     small: 'w-16 h-16',
//     medium: 'w-24 h-24',
//     large: 'w-48 h-48',
//   };

//   return (
//     <div
//       className="relative inline-block"
//       onMouseEnter={handleAvatarMouseEnter}
//       onMouseLeave={handleAvatarMouseLeave}
//     >
//       <img
//         src={userData.profilePicture || '/default-avatar.png'}
//         alt="Аватар пользователя"
//         className={`${sizeClasses[size]} rounded-full object-cover cursor-pointer`}
//       />
//       {isMenuVisible && (
//         <div
//           className={`absolute top-0 left-0 mt-${size === 'large' ? '48' : size === 'medium' ? '24' : '16'} w-32 rounded shadow-lg z-10 ${
//             isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
//           }`}
//         >
//           <button
//             onClick={onDeleteAvatar}
//             className="w-full px-4 py-2 text-left hover:bg-gray-200"
//           >
//             Удалить аватар
//           </button>
//           <label className="w-full block px-4 py-2 text-left hover:bg-gray-200 cursor-pointer">
//             Загрузить аватар
//             <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
//           </label>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserAvatar;
