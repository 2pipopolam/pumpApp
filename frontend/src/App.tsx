// App.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
    profilePicture: '',
  });
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      setUserData({
        id: response.data.id,
        username: response.data.username,
        profilePicture: response.data.avatar,
      });
    } catch (err) {
      console.error('Ошибка при получении профиля пользователя:', err);
      setError('Не удалось получить профиль пользователя. Используется аватар по умолчанию.');
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
        avatar: userData.profilePicture,
        username: userData.username,
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
              images: response.data.images.map((image: MediaItem) => ({ ...image, file: undefined })),
              videos: response.data.videos.map((video: MediaItem) => ({ ...video, file: undefined })),
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
                    images: response.data.images.map((image: MediaItem) => ({ ...image, file: undefined })),
                    videos: response.data.videos.map((video: MediaItem) => ({ ...video, file: undefined })),
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
        profilePicture: response.data.avatar,
      });
    } catch (err) {
      setError('Не удалось обновить аватар. Пожалуйста, попробуйте снова.');
      console.error('Ошибка при обновлении аватара:', err);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.training_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Router>
      <div
        className={`min-h-screen ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <nav className="p-4">
          <Link to="/" className="mr-4">
            Главная
          </Link>
          <Link to="/calendar">Календарь тренировок</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex">
                <div className="w-64 p-4 fixed left-10 top-12 h-full flex flex-col">
                  <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="flex-grow flex justify-center">
                  {isLoading ? (
                    <p>Загрузка постов...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    <PostList
                      posts={filteredPosts}
                      userData={userData}
                      isDarkMode={isDarkMode}
                      startEditing={(post: ExtendedPost) => handleStartEditing(post)}
                      showDeleteConfirmation={(id: number) => {
                        setShowDeleteDialog(true);
                        setPostToDelete(id);
                      }}
                      addNewPost={handleAddNewPost}
                      onEditProfilePicture={() => setIsEditingProfilePicture(true)}
                    />
                  )}
                </div>

                {showDeleteDialog && (
                  <DeleteDialog
                    isDarkMode={isDarkMode}
                    onCancel={() => setShowDeleteDialog(false)}
                    onConfirm={() => postToDelete !== null && handleDeletePost(postToDelete)}
                  />
                )}

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
            }
          />
          <Route
            path="/calendar"
            element={<TrainingCalendar isDarkMode={isDarkMode} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
