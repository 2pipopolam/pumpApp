// src/pages/HomePage.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  ExtendedPost,
  Post,
  ExtendedMediaItem,
  UserData,
} from '../types';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getProfile,
  updateProfile,
  linkTelegram, // Функция API для генерации кода связывания
  checkTelegramLink, // Функция API для проверки статуса связывания
} from '../services/api';
import DarkModeToggle from '../components/DarkModeToggle';
import SearchBar from '../components/SearchBar';
import PostList from '../components/PostList';
import DeleteDialog from '../components/DeleteDialog';
import EditPostDialog from '../components/EditPostDialog';
import EditProfilePictureDialog from '../components/EditProfilePictureDialog';
import Modal from '../components/Modal'; // Компонент модального окна
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const HomePage: React.FC = () => {
  // Существующие состояния
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<ExtendedPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<UserData>({
    id: 1,
    username: '',
    email: '',
    profilePicture: '',
  });
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);

  // Новые состояния для связывания Telegram
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState<boolean>(false);

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Функция для проверки статуса связывания Telegram при загрузке
  const fetchTelegramLinkStatus = useCallback(async () => {
    try {
      const response = await checkTelegramLink();
      setIsLinked(response.data.linked);
    } catch (err) {
      console.error('Ошибка при проверке статуса связывания Telegram:', err);
      // Можно установить состояние ошибки, если необходимо
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      const avatarPath = response.data.avatar || '';
      // Добавляем временную метку для предотвращения кэширования
      const avatarUrl = avatarPath ? `${BASE_URL}${avatarPath}?t=${Date.now()}` : '';

      setUserData({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        profilePicture: avatarUrl,
      });
    } catch (err) {
      console.error('Ошибка при получении профиля пользователя:', err);
      setError('Не удалось получить профиль пользователя.');
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPosts();
      setPosts(
        response.data.map((post: Post) => ({
          ...post,
          images: post.images.map((image) => ({ ...image, file: undefined })),
          videos: post.videos.map((video) => ({ ...video, file: undefined })),
        }))
      );
    } catch (err) {
      setError('Не удалось загрузить посты. Пожалуйста, попробуйте позже.');
      console.error('Ошибка при загрузке постов:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUserProfile();
      fetchTelegramLinkStatus();
    } else {
      navigate('/login');
    }
  }, [fetchPosts, fetchUserProfile, fetchTelegramLinkStatus, user, navigate]);

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
      setShowDeleteDialog(false);
      setPostToDelete(null);
    } catch (err) {
      setError('Не удалось удалить пост. Пожалуйста, попробуйте снова.');
      console.error('Ошибка при удалении поста:', err);
    }
  };

  const handleStartEditing = (post: ExtendedPost) => {
    setIsEditing(true);
    setEditingPost({ ...post });
  };

  const handleAddNewPost = () => {
    setIsCreating(true);
    setEditingPost({
      id: 0,
      title: '',
      training_type: '',
      description: '',
      images: [],
      videos: [],
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: userData.id,
        user: userData.id,
        avatar: userData.profilePicture || '',
        username: userData.username,
        email: userData.email,
      },
    });
  };

  const handleSavePost = async () => {
    if (editingPost) {
      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('training_type', editingPost.training_type);
      formData.append('description', editingPost.description);

      const existingImageIds = editingPost.images
        .filter((image) => !image.isNew && image.id !== null)
        .map((image) => image.id!) as number[];

      const existingVideoIds = editingPost.videos
        .filter((video) => !video.isNew && video.id !== null)
        .map((video) => video.id!) as number[];

      existingImageIds.forEach((id) => formData.append('existing_images', id.toString()));
      existingVideoIds.forEach((id) => formData.append('existing_videos', id.toString()));

      // Добавляем новые изображения
      editingPost.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        } else if (image.image_url) {
          formData.append('image_urls', image.image_url);
        }
      });

      // Добавляем новые видео
      editingPost.videos.forEach((video) => {
        if (video.file) {
          formData.append('videos', video.file);
        } else if (video.video_url) {
          formData.append('video_urls', video.video_url);
        }
      });

      try {
        let response: AxiosResponse<Post>;
        if (isCreating) {
          response = await createPost(formData);
          setPosts([
            ...posts,
            {
              ...response.data,
              images: response.data.images.map((image: ExtendedMediaItem) => ({
                ...image,
                file: undefined,
              })),
              videos: response.data.videos.map((video: ExtendedMediaItem) => ({
                ...video,
                file: undefined,
              })),
            },
          ]);
          setIsCreating(false);
        } else {
          response = await updatePost(editingPost.id, formData);
          setPosts(
            posts.map((post) =>
              post.id === editingPost.id
                ? {
                    ...response.data,
                    images: response.data.images.map((image: ExtendedMediaItem) => ({
                      ...image,
                      file: undefined,
                    })),
                    videos: response.data.videos.map((video: ExtendedMediaItem) => ({
                      ...video,
                      file: undefined,
                    })),
                  }
                : post
            )
          );
          setIsEditing(false);
        }
        setEditingPost(null);
      } catch (err) {
        setError('Не удалось сохранить пост. Пожалуйста, попробуйте снова.');
        console.error('Ошибка при сохранении поста:', err);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingPost) {
      setEditingPost({
        ...editingPost,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && editingPost) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      const videoFiles = files.filter((file) => file.type.startsWith('video/'));

      setEditingPost({
        ...editingPost,
        images: [
          ...editingPost.images,
          ...imageFiles.map((file) => ({
            id: null,
            file,
            isNew: true,
          })),
        ],
        videos: [
          ...editingPost.videos,
          ...videoFiles.map((file) => ({
            id: null,
            file,
            isNew: true,
          })),
        ],
      });
    }
  };

  const handleRemoveMedia = (type: 'image' | 'video', mediaItem: ExtendedMediaItem) => {
    if (editingPost) {
      if (type === 'image') {
        setEditingPost({
          ...editingPost,
          images: editingPost.images.filter((image) => image !== mediaItem),
        });
      } else if (type === 'video') {
        setEditingPost({
          ...editingPost,
          videos: editingPost.videos.filter((video) => video !== mediaItem),
        });
      }
    }
  };

  const handleAddMediaUrl = (type: 'image' | 'video', url: string) => {
    if (editingPost) {
      if (type === 'image') {
        setEditingPost({
          ...editingPost,
          images: [
            ...editingPost.images,
            {
              id: null,
              image_url: url,
              isNew: true,
            },
          ],
        });
      } else if (type === 'video') {
        setEditingPost({
          ...editingPost,
          videos: [
            ...editingPost.videos,
            {
              id: null,
              video_url: url,
              isNew: true,
            },
          ],
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && editingPost) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      const videoFiles = files.filter((file) => file.type.startsWith('video/'));

      setEditingPost({
        ...editingPost,
        images: [
          ...editingPost.images,
          ...imageFiles.map((file) => ({
            id: null,
            file,
            isNew: true,
          })),
        ],
        videos: [
          ...editingPost.videos,
          ...videoFiles.map((file) => ({
            id: null,
            file,
            isNew: true,
          })),
        ],
      });
    }
  };

  const handleSaveProfilePicture = async (newProfilePicture: File | null) => {
    const formData = new FormData();
    if (newProfilePicture) {
      formData.append('avatar', newProfilePicture);
    } else {
      formData.append('avatar', '');
    }

    try {
      await updateProfile(formData);
      await fetchUserProfile();
      setIsEditingProfilePicture(false);
    } catch (err) {
      setError('Не удалось обновить аватар. Пожалуйста, попробуйте снова.');
      console.error('Ошибка при обновлении аватара:', err);
    }
  };

  // Новая функция для генерации кода связывания с Telegram
  const handleLinkTelegram = async () => {
    try {
      const response = await linkTelegram(); // Вызов функции API для генерации кода
      setLinkingCode(response.data.code); // Предполагается, что API возвращает { code: "ABC123" }
      setIsLinkingTelegram(true);
      setLinkingError(null);
    } catch (error) {
      console.error('Ошибка при генерации кода для связывания с Telegram:', error);
      setLinkingError('Не удалось сгенерировать код. Пожалуйста, попробуйте позже.');
    }
  };

  // Класс для кнопок
  const buttonClass =
    'w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xl text-gray-600 hover:bg-gray-400 transition-colors duration-300';

  return (
    <div className="flex">
      {/* Navigation Panel */}
      <nav className="w-64 p-4 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 h-full flex flex-col">
        <Link to="/" className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Главная
        </Link>
        <Link to="/calendar" className="mb-4 text-gray-800 dark:text-white">
          Календарь тренировок
        </Link>

        {/* Кнопка "Связать с Telegram" */}
        {!isLinked && user && (
          <button
            onClick={handleLinkTelegram}
            className="mb-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Связать с Telegram
          </button>
        )}

        {/* Индикация связанного Telegram */}
        {isLinked && (
          <div className="mb-4 p-2 bg-blue-500 text-white rounded">
            Telegram связан
          </div>
        )}

        {user ? (
          <button onClick={logout} className="mt-auto p-2 bg-red-500 text-white rounded">
            Выйти
          </button>
        ) : (
          <Link to="/login" className="mt-auto">
            <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Войти
            </button>
          </Link>
        )}
      </nav>

      {/* Main Content */}
      <div className="ml-64 p-4 flex-grow">
        {user ? (
          <>
            <div className="max-w-4xl w-full p-10">
              {/* Avatar and Username above posts */}
              <div className="flex items-center mb-6 mt-6 relative">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Аватар пользователя"
                    className="w-36 h-36 rounded-full mr-8 cursor-pointer"
                    onClick={() => setIsEditingProfilePicture(true)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      e.currentTarget.src = '/path/to/default/avatar.png';
                    }}
                  />
                ) : (
                  <div
                    className="w-36 h-36 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer mr-8"
                    onClick={() => setIsEditingProfilePicture(true)}
                  >
                    <span className="text-gray-700">Аватар</span>
                  </div>
                )}
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {userData.username}
                </h2>
                <button
                  className={`absolute top-2 right-2 ${buttonClass}`}
                  aria-label="Добавить новый пост"
                  onClick={handleAddNewPost}
                >
                  +
                </button>
              </div>

              {/* Rest of the content */}
              <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isDarkMode={isDarkMode}
              />
              {isLoading ? (
                <p>Загрузка постов...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <PostList
                  posts={posts}
                  userData={userData}
                  isDarkMode={isDarkMode}
                  startEditing={handleStartEditing}
                  showDeleteConfirmation={(id: number) => {
                    setShowDeleteDialog(true);
                    setPostToDelete(id);
                  }}
                />
              )}
            </div>

            {/* Delete Post Dialog */}
            {showDeleteDialog && (
              <DeleteDialog
                isDarkMode={isDarkMode}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={() => postToDelete !== null && handleDeletePost(postToDelete)}
              />
            )}

            {/* Edit/Create Post Dialog */}
            {(isEditing || isCreating) && editingPost && (
              <EditPostDialog
                isDarkMode={isDarkMode}
                isCreating={isCreating}
                editingPost={editingPost}
                onInputChange={handleInputChange}
                onFileInputChange={handleFileInputChange}
                onRemoveMedia={handleRemoveMedia}
                onAddMediaUrl={handleAddMediaUrl}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onCancel={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setEditingPost(null);
                }}
                onSave={handleSavePost}
              />
            )}

            {/* Edit Profile Picture Dialog */}
            {isEditingProfilePicture && (
              <EditProfilePictureDialog
                isDarkMode={isDarkMode}
                userData={userData}
                onCancel={() => setIsEditingProfilePicture(false)}
                onSave={handleSaveProfilePicture}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">Добро пожаловать!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Пожалуйста, войдите через Google, чтобы продолжить.
            </p>
            <Link to="/login">
              <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Войти
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Модальное окно для связывания с Telegram */}
      {isLinkingTelegram && linkingCode && (
        <Modal onClose={() => setIsLinkingTelegram(false)}>
          <h2 className="text-2xl mb-4">Связать с Telegram</h2>
          <p>Чтобы связать ваш аккаунт с Telegram, выполните следующие шаги:</p>
          <ol className="list-decimal list-inside mt-2">
            <li>Откройте Telegram и найдите нашего бота.</li>
            <li>Отправьте боту следующий код:</li>
          </ol>
          <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-center text-xl font-mono">
            {linkingCode}
          </div>
          <p className="mt-4">После отправки кода, ваш аккаунт будет успешно связан.</p>
          {linkingError && <p className="text-red-500 mt-2">{linkingError}</p>}
          <button
            onClick={() => setIsLinkingTelegram(false)}
            className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Закрыть
          </button>
        </Modal>
      )}
    </div>
  );
};

export default HomePage;
