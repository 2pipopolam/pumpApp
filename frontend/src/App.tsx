// src/App.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  UserData,
  ExtendedPost,
  Post,
  ExtendedMediaItem,
  MediaItem,
} from './types';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getProfile,
  updateProfile,
} from './services/api';
import DarkModeToggle from './components/DarkModeToggle';
import SearchBar from './components/SearchBar';
import PostList from './components/PostList';
import DeleteDialog from './components/DeleteDialog';
import EditPostDialog from './components/EditPostDialog';
import EditProfilePictureDialog from './components/EditProfilePictureDialog';
import TrainingCalendar from './components/TrainingCalendar';
import { AxiosResponse } from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Получаем GOOGLE_CLIENT_ID из переменных окружения
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH2_KEY || '';

function App() {
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
    profilePicture: '', // Обязательно строка
  });
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const { login, logout, user } = useContext(AuthContext); // Используем контекст аутентификации

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      setUserData({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        profilePicture: response.data.avatar || '', // Обеспечиваем, что всегда строка
      });
    } catch (err) {
      console.error('Ошибка при получении профиля пользователя:', err);
      setError(
        err.response?.data?.detail ||
          'Не удалось получить профиль пользователя. Используется аватар по умолчанию.'
      );
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
      setError(
        err.response?.data?.detail ||
          'Не удалось загрузить посты. Пожалуйста, попробуйте позже.'
      );
      console.error('Ошибка при загрузке постов:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
  }, [fetchPosts, fetchUserProfile]);

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
      setShowDeleteDialog(false);
      setPostToDelete(null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Не удалось удалить пост. Пожалуйста, попробуйте снова.'
      );
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
        avatar: userData.profilePicture || '', // Обеспечиваем, что всегда строка
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

      // IDs существующих изображений и видео для сохранения на сервере
      const existingImageIds = editingPost.images
        .filter((image) => !image.isNew && image.id !== null)
        .map((image) => image.id!) as number[];

      const existingVideoIds = editingPost.videos
        .filter((video) => !video.isNew && video.id !== null)
        .map((video) => video.id!) as number[];

      existingImageIds.forEach((id) => formData.append('existing_images', id.toString()));
      existingVideoIds.forEach((id) => formData.append('existing_videos', id.toString()));

      // Добавляем новые файлы изображений
      editingPost.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });

      // Добавляем URL изображений
      editingPost.images.forEach((image) => {
        if (image.image_url && image.isNew) {
          formData.append('image_urls', image.image_url);
        }
      });

      // Добавляем новые файлы видео
      editingPost.videos.forEach((video) => {
        if (video.file) {
          formData.append('videos', video.file);
        }
      });

      // Добавляем URL видео
      editingPost.videos.forEach((video) => {
        if (video.video_url && video.isNew) {
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
              images: response.data.images.map((image: MediaItem) => ({
                ...image,
                file: undefined,
              })),
              videos: response.data.videos.map((video: MediaItem) => ({
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
                    images: response.data.images.map((image: MediaItem) => ({
                      ...image,
                      file: undefined,
                    })),
                    videos: response.data.videos.map((video: MediaItem) => ({
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
        setError(
          err.response?.data?.detail ||
            'Не удалось сохранить пост. Пожалуйста, попробуйте снова.'
        );
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (editingPost) {
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

  const handleSaveProfilePicture = async (newProfilePicture: File | null) => {
    const formData = new FormData();
    if (newProfilePicture) {
      formData.append('avatar', newProfilePicture);
    } else {
      formData.append('avatar', '');
    }

    try {
      const response = await updateProfile(formData);
      setUserData({
        ...userData,
        profilePicture: response.data.avatar || '', // Обеспечиваем, что всегда строка
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Не удалось обновить аватар. Пожалуйста, попробуйте снова.'
      );
      console.error('Ошибка при обновлении аватара:', err);
    }
  };

  // Определяем filteredPosts внутри компонента, перед возвратом JSX
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.training_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <div
            className={`min-h-screen ${
              isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
            }`}
          >
            <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <Routes>
              {/* Маршрут для регистрации */}
              <Route path="/register" element={<RegistrationPage />} />
              {/* Маршрут для входа */}
              <Route path="/login" element={<LoginPage />} />
              {/* Главная страница, защищённая авторизацией */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <div className="flex">
                      {/* Навигационная панель, отображается только для защищённых маршрутов */}
                      <nav className="w-64 p-4 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 h-full flex flex-col">
                        <Link to="/" className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
                          Главная
                        </Link>
                        <Link to="/calendar" className="mb-4 text-gray-800 dark:text-white">
                          Календарь тренировок
                        </Link>
                        <button
                          onClick={logout}
                          className="mt-auto p-2 bg-red-500 text-white rounded"
                        >
                          Выйти
                        </button>
                      </nav>

                      {/* Основной контент */}
                      <div className="ml-64 p-4 flex-grow">
                        <SearchBar
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          isDarkMode={isDarkMode}
                        />
                        <button
                          onClick={handleAddNewPost}
                          className="mt-4 p-2 bg-green-500 text-white rounded"
                        >
                          Добавить новый пост
                        </button>
                        <button
                          onClick={() => setIsEditingProfilePicture(true)}
                          className="mt-2 p-2 bg-yellow-500 text-white rounded"
                        >
                          Изменить аватар
                        </button>

                        {isLoading ? (
                          <p>Загрузка постов...</p>
                        ) : error ? (
                          <p className="text-red-500">{error}</p>
                        ) : (
                          <PostList
                            posts={filteredPosts}
                            userData={userData}
                            isDarkMode={isDarkMode}
                            startEditing={handleStartEditing}
                            showDeleteConfirmation={(id: number) => {
                              setShowDeleteDialog(true);
                              setPostToDelete(id);
                            }}
                            addNewPost={handleAddNewPost}
                            onEditProfilePicture={() => setIsEditingProfilePicture(true)}
                          />
                        )}
                      </div>

                      {/* Диалог удаления поста */}
                      {showDeleteDialog && (
                        <DeleteDialog
                          isDarkMode={isDarkMode}
                          onCancel={() => setShowDeleteDialog(false)}
                          onConfirm={() => postToDelete !== null && handleDeletePost(postToDelete)}
                        />
                      )}

                      {/* Диалог редактирования/создания поста */}
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

                      {/* Диалог редактирования аватара */}
                      {isEditingProfilePicture && (
                        <EditProfilePictureDialog
                          isDarkMode={isDarkMode}
                          userData={userData}
                          onCancel={() => setIsEditingProfilePicture(false)}
                          onSave={(newProfilePicture) => {
                            handleSaveProfilePicture(newProfilePicture);
                            setIsEditingProfilePicture(false);
                          }}
                        />
                      )}
                    </div>
                  </PrivateRoute>
                }
              />
              {/* Маршрут для календаря тренировок */}
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <TrainingCalendar isDarkMode={isDarkMode} />
                  </PrivateRoute>
                }
              />
            </Routes>

            {/* Сообщение об ошибке */}
            {error && (
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
