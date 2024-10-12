// src/pages/HomePage.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  ExtendedPost,
  Post,
  ExtendedMediaItem,
  UserData,
} from '../types';
import {
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  getProfile,
  updateProfile,
  linkTelegram,
  checkTelegramLink,
} from '../services/api';
import DarkModeToggle from '../components/DarkModeToggle';
import SearchBar from '../components/SearchBar';
import PostList from '../components/PostList';
import DeleteDialog from '../components/DeleteDialog';
import EditPostDialog from '../components/EditPostDialog';
import EditProfilePictureDialog from '../components/EditProfilePictureDialog';
import Modal from '../components/Modal';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';

// Import the QRCode component from react-qr-code
import QRCode from 'react-qr-code';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const HomePage: React.FC = () => {
  // State variables
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

  // Telegram linking state variables
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [linkingCode, setLinkingCode] = useState<string | null>(null);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState<boolean>(false);

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Fetch Telegram link status on load
  const fetchTelegramLinkStatus = useCallback(async () => {
    try {
      const response = await checkTelegramLink();
      setIsLinked(response.data.linked);
    } catch (err) {
      console.error('Error checking Telegram link status:', err);
    }
  }, []);

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      const avatarPath = response.data.avatar || '';
      const avatarUrl = avatarPath ? `${BASE_URL}${avatarPath}?t=${Date.now()}` : '';

      setUserData({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        profilePicture: avatarUrl,
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile.');
    }
  }, []);

  // Fetch only the authenticated user's posts
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyPosts();
      setPosts(
        response.data.map((post: Post) => ({
          ...post,
          images: post.images.map((image) => ({ ...image, file: undefined })),
          videos: post.videos.map((video) => ({ ...video, file: undefined })),
        }))
      );
    } catch (err) {
      setError('Failed to load your posts. Please try again later.');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUserProfile();
      fetchTelegramLinkStatus();
    } else {
      navigate('/login');
    }
  }, [fetchPosts, fetchUserProfile, fetchTelegramLinkStatus, user, navigate]);

  // Handle post deletion
  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
      setShowDeleteDialog(false);
      setPostToDelete(null);
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    }
  };

  // Handle post editing
  const handleStartEditing = (post: ExtendedPost) => {
    setIsEditing(true);
    setEditingPost({ ...post });
  };

  // Handle adding a new post
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

  // Handle saving a post (both create and update)
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

      // Add new images
      editingPost.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        } else if (image.image_url) {
          formData.append('image_urls', image.image_url);
        }
      });

      // Add new videos
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
        setError('Failed to save post. Please try again.');
        console.error('Error saving post:', err);
      }
    }
  };

  // Handle input changes in the edit/create post form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingPost) {
      setEditingPost({
        ...editingPost,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Handle file input changes in the edit/create post form
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

  // Handle removing media items (images/videos) from the edit/create post form
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

  // Handle adding media URLs (images/videos) to the edit/create post form
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

  // Handle drag over event for file uploads
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop event for file uploads
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

  // Handle saving the profile picture
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
      setError('Failed to update avatar. Please try again.');
      console.error('Error updating avatar:', err);
    }
  };

  // Function to generate the Telegram linking code
  const handleLinkTelegram = async () => {
    try {
      const response = await linkTelegram(); // API call to generate the code
      setLinkingCode(response.data.code); // Assuming the API returns { code: "ABC123" }
      setIsLinkingTelegram(true);
      setLinkingError(null);
    } catch (error) {
      console.error('Error generating Telegram linking code:', error);
      setLinkingError('Failed to generate code. Please try again later.');
    }
  };

  // Button styling class
  const buttonClass =
    'w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xl text-gray-600 hover:bg-gray-400 transition-colors duration-300';

  // Dummy functions for disabling edit and delete in AllPostsPage or similar scenarios
  const dummyStartEditing = () => {};
  const dummyShowDeleteConfirmation = () => {};

  return (
    <div className="flex">
      {/* Navigation Panel */}
      <nav className="w-64 p-4 bg-gray-200 dark:bg-gray-800 fixed top-0 left-0 h-full flex flex-col">
        <Link to="/" className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Home
        </Link>
        <Link to="/calendar" className="mb-4 text-gray-800 dark:text-white">
          Training Calendar
        </Link>

        {/* New Link to All Users' Posts */}
        <Link to="/all-posts" className="mb-4 text-gray-800 dark:text-white">
          All Posts
        </Link>

        {/* "Link with Telegram" Button */}
        {!isLinked && user && (
          <button
            onClick={handleLinkTelegram}
            className="mb-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Link with Telegram
          </button>
        )}

        {/* Indication of linked Telegram */}
        {isLinked && (
          <div className="mb-4 p-2 bg-blue-500 text-white rounded">
            Telegram Linked
          </div>
        )}

        {/* Logout or Login Button */}
        {user ? (
          <button onClick={logout} className="mt-auto p-2 bg-red-500 text-white rounded">
            Logout
          </button>
        ) : (
          <Link to="/login" className="mt-auto">
            <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Login
            </button>
          </Link>
        )}
      </nav>

      {/* Main Content */}
      <div className="ml-64 p-4 flex-grow">
        {user ? (
          <>
            <div className="max-w-4xl w-full p-10">
              {/* User Avatar and Username */}
              <div className="flex items-center mb-6 mt-6 relative">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="User Avatar"
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
                    <span className="text-gray-700">Avatar</span>
                  </div>
                )}
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {userData.username}
                </h2>
                {/* Add New Post Button */}
                <button
                  className={`absolute top-2 right-2 ${buttonClass}`}
                  aria-label="Add new post"
                  onClick={handleAddNewPost}
                >
                  +
                </button>
              </div>

              {/* Dark Mode Toggle and Search Bar */}
              <div className="flex items-center justify-between mb-4">
                <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Posts List */}
              {isLoading ? (
                <p>Loading your posts...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <PostList
                  posts={posts}
                  isDarkMode={isDarkMode}
                  startEditing={handleStartEditing}
                  showDeleteConfirmation={(id: number) => {
                    setShowDeleteDialog(true);
                    setPostToDelete(id);
                  }}
                  canEdit={true}    // Allow editing
                  canDelete={true}  // Allow deleting
                />
              )}
            </div>

            {/* Delete Post Confirmation Dialog */}
            {showDeleteDialog && (
              <DeleteDialog
                isDarkMode={isDarkMode}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={() => postToDelete !== null && handleDeletePost(postToDelete)}
              />
            )}

            {/* Edit or Create Post Dialog */}
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
          // If the user is not authenticated
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">Welcome!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Please log in with Google to continue.
            </p>
            <Link to="/login">
              <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Login
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Modal for Telegram Linking */}
      {isLinkingTelegram && linkingCode && (
        <Modal onClose={() => setIsLinkingTelegram(false)}>
          <h2 className="text-2xl mb-4">Link with Telegram</h2>
          <p>To link your account with Telegram, follow these steps:</p>
          <ol className="list-decimal list-inside mt-2">
            <li>Scan the QR code below with your phone.</li>
            <li>Open the Telegram bot that appears after scanning.</li>
          </ol>
          <div className="mt-4 flex justify-center">
            <QRCode
              value={`https://t.me/reminder_training_bot?start=${linkingCode}`}
              size={256}
            />
          </div>
          <p className="mt-4">
            After scanning the QR code, your account will be linked automatically.
          </p>
          {linkingError && <p className="text-red-500 mt-2">{linkingError}</p>}
          <button
            onClick={() => setIsLinkingTelegram(false)}
            className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};

export default HomePage;
