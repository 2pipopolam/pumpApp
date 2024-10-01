// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { UserData, ExtendedPost, Post } from './types';
import { getPosts, createPost, updatePost, deletePost, getProfile } from './services/api';
import DarkModeToggle from './components/DarkModeToggle';
import SearchBar from './components/SearchBar';
import PostList from './components/PostList';
import DeleteDialog from './components/DeleteDialog';
import EditPostDialog from './components/EditPostDialog';

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
    nickname: 'UserNickname',
    profilePicture: '',
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await getProfile(1); // Assuming user ID is 1
      setUserData({
        id: response.data.id,
        nickname: userData.nickname,
        profilePicture: response.data.avatar,
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile. Using default avatar.');
    }
  }, [userData.nickname]);

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
      setError('Failed to fetch posts. Please try again later.');
      console.error('Error fetching posts:', err);
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
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
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
      },
    });
  };

  const handleSavePost = async () => {
    if (editingPost) {
      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('training_type', editingPost.training_type);
      formData.append('description', editingPost.description);

      // Include existing image IDs to retain on the server
      const existingImageIds = editingPost.images
        .filter((image) => !image.file && image.id)
        .map((image) => image.id);

      // Include existing video IDs to retain on the server
      const existingVideoIds = editingPost.videos
        .filter((video) => !video.file && video.id)
        .map((video) => video.id);

      existingImageIds.forEach((id) => formData.append('existing_images', id.toString()));
      existingVideoIds.forEach((id) => formData.append('existing_videos', id.toString()));

      // Add new images
      editingPost.images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });

      // Add new videos
      editingPost.videos.forEach((video) => {
        if (video.file) {
          formData.append('videos', video.file);
        }
      });

      try {
        if (isCreating) {
          const response = await createPost(formData);
          setPosts([...posts, response.data]);
          setIsCreating(false);
        } else {
          const response = await updatePost(editingPost.id, formData);
          setPosts(posts.map((post) => (post.id === editingPost.id ? response.data : post)));
          setIsEditing(false);
        }
        setEditingPost(null);
      } catch (err) {
        setError('Failed to save post. Please try again.');
        console.error('Error saving post:', err);
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
          ...imageFiles.map((file) => ({ id: Date.now() + Math.random(), file })),
        ],
        videos: [
          ...editingPost.videos,
          ...videoFiles.map((file) => ({ id: Date.now() + Math.random(), file })),
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
            ...imageFiles.map((file) => ({ id: Date.now() + Math.random(), file })),
          ],
          videos: [
            ...editingPost.videos,
            ...videoFiles.map((file) => ({ id: Date.now() + Math.random(), file })),
          ],
        });
      }
    }
  };

  const handleRemoveMedia = (type: 'image' | 'video', id: number) => {
    if (editingPost) {
      if (type === 'image') {
        setEditingPost({
          ...editingPost,
          images: editingPost.images.filter((image) => image.id !== id),
        });
      } else if (type === 'video') {
        setEditingPost({
          ...editingPost,
          videos: editingPost.videos.filter((video) => video.id !== id),
        });
      }
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.training_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
      }`}
    >
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex">
        <div className="w-64 p-4 fixed left-10 top-12 h-full flex flex-col">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
        </div>

        <div className="flex-grow flex justify-center">
          {isLoading ? (
            <p>Loading posts...</p>
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
            />
          )}
        </div>
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
    </div>
  );
}

export default App;
