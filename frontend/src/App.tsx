import React, { useState } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const userData = {
    nickname: 'UserNickname',
    profilePicture: 'https://via.placeholder.com/100',
  };

  const postData = {
    title: 'Название тренировки',
    type: 'Тип тренировки',
    description: 'Описание тренировки. Здесь может быть довольно длинный текст, описывающий детали тренировки.',
    media: ['https://via.placeholder.com/500', 'https://via.placeholder.com/500', 'https://via.placeholder.com/500', 'https://via.placeholder.com/500'],
    views: 1234,
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto p-10 max-w-4xl relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
        >
          {isDarkMode ? '🌑' : '☀️'}
        </button>
        <div className={`rounded-lg shadow-md p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center mb-6">
            <img src={userData.profilePicture} alt="Profile" className="w-36 h-36 rounded-full mr-8" />
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userData.nickname}</h2>
          </div>
          
          <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h1 className="text-3xl font-bold text-center mb-10 text-indigo-600">{postData.title}</h1>
            <p className={`text-xl text-center mb-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{postData.type}</p>
            <p className={`text-lg text-center mb-10 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{postData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
              {postData.media.map((url, index) => (
                <img key={index} src={url} alt={`Media ${index + 1}`} className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Просмотры: {postData.views}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
