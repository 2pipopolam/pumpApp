import React, { useState } from 'react';

interface UserData {
  nickname: string;
  profilePicture: string;
}

interface PostData {
  id: number;
  title: string;
  type: string;
  description: string;
  media: string[];
  views: number;
}

const buttonClass = "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xl text-gray-600 hover:bg-gray-400 transition-colors duration-300";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: 1,
      title: 'Название поста',
      type: 'Тип тренировки',
      description: 'Описание тренировки. Здесь может быть довольно длинный текст, описывающий детали тренировки.',
      media: ['https://via.placeholder.com/500', 'https://via.placeholder.com/500', 'https://via.placeholder.com/500', 'https://via.placeholder.com/500'],
      views: 1234,
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const userData: UserData = {
    nickname: 'UserNickname',
    profilePicture: 'https://via.placeholder.com/500',
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));
    setShowDeleteDialog(false);
    setPostToDelete(null);
  };

  const startEditing = (post: PostData) => {
    setIsEditing(true);
    setEditingPost(post);
  };

  const saveEditedPost = (editedPost: PostData) => {
    setPosts(posts.map(post => post.id === editedPost.id ? editedPost : post));
    setIsEditing(false);
    setEditingPost(null);
  };

  const addNewPost = () => {
    const newPost: PostData = {
      id: Date.now(),
      title: 'Новый пост',
      type: 'Тип тренировки',
      description: 'Описание новой тренировки',
      media: [],
      views: 0
    };
    setPosts([...posts, newPost]);
    startEditing(newPost);
  };

  const showDeleteConfirmation = (id: number) => {
    setPostToDelete(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 text-2xl"
        aria-label={isDarkMode ? 'Включить светлый режим' : 'Включить темный режим'}
      >
        {isDarkMode ? '☀️ ' : '🌑'}
      </button>
      <div className="flex">
        <div className="w-64 p-4 fixed left-10 top-12 h-full flex flex-col">
          <div className="flex items-center mb-4 space-x-4 space-y-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Введите название поста либо тип тренеровки или имя пользователя"
                className={`w-full py-2 pl-10 pr-4 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <svg
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-25 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 30 30"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-grow flex justify-center">
          <div className="max-w-4xl w-full p-10">
            <div className="flex items-center mb-6 mt-6 relative">
              <img src={userData.profilePicture} alt="Profile" className="w-36 h-36 rounded-full mr-8" />
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userData.nickname}</h2>
              <button className={`absolute top-2 right-2 ${buttonClass}`} aria-label="Добавить новый пост" onClick={addNewPost}>
                +
              </button>
            </div>
            
            {posts.map(post => (
              <div key={post.id} className={`rounded-lg shadow-md p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
                <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} relative`}>
                  <button className={`absolute top-2 left-2 ${buttonClass}`} aria-label="Редактировать пост" onClick={() => startEditing(post)}>
                    ✍️
                  </button>
                  <button className={`absolute top-2 right-2 ${buttonClass}`} aria-label="Удалить пост" onClick={() => showDeleteConfirmation(post.id)}>
                    🗑️
                  </button>
                  <h1 className="text-3xl font-bold text-center mb-10 text-indigo-600">{post.title}</h1>
                  <p className={`text-xl text-center mb-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.type}</p>
                  <p className={`text-lg text-center mb-10 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
                    {post.media.map((url, index) => (
                      <img key={index} src={url} alt={`Media ${index + 1}`} className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Просмотры: {post.views}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`bg-white p-6 rounded-lg ${isDarkMode ? 'text-black' : ''}`}>
            <h2 className="text-xl font-bold mb-4">Удаление поста</h2>
            <p className="mb-4">Пост будет удален, вы уверены?</p>
            <div className="flex justify-end">
              <button
                className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDeleteDialog(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => postToDelete !== null && deletePost(postToDelete)}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`bg-white p-6 rounded-lg ${isDarkMode ? 'text-black' : ''}`}>
            <h2 className="text-xl font-bold mb-4">Редактирование поста</h2>
            {/* Add form fields for editing here */}
            <div className="flex justify-end mt-4">
              <button
                className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setIsEditing(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => saveEditedPost(editingPost)}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
