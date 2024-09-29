import React, { useState, useEffect } from 'react';
import { Post, UserData, MediaItem } from './types';
import { getPosts, createPost, updatePost, deletePost, getProfile } from './services/api';
import DarkModeToggle from './components/DarkModeToggle';
import SearchBar from './components/SearchBar';
import PostList from './components/PostList';
import DeleteDialog from './components/DeleteDialog';
import EditPostDialog from './components/EditPostDialog';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<UserData>({
    id: 1,
    nickname: 'UserNickname',
    profilePicture: '',
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
  }, []);


    const fetchUserProfile = async () => {
    try {
      const response = await getProfile(1); // Предполагаем, что ID пользователя равен 1
      setUserData({
        id: response.data.id,
        nickname: userData.nickname, 
        //String(response.data.user), // Преобразуем числовое значение в строку
        profilePicture: response.data.avatar,
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile. Using default avatar.');
    }
  };






  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPosts();
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await deletePost(id);
      setPosts(posts.filter(post => post.id !== id));
      setShowDeleteDialog(false);
      setPostToDelete(null);
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    }
  };

  const handleStartEditing = (post: Post) => {
    setIsEditing(true);
    setEditingPost({ ...post });
  };

  const handleSaveEditedPost = async () => {
    if (editingPost) {
      try {
        const response = await updatePost(editingPost.id, editingPost);
        setPosts(posts.map(post => post.id === editingPost.id ? response.data : post));
        setIsEditing(false);
        setEditingPost(null);
      } catch (err) {
        setError('Failed to update post. Please try again.');
        console.error('Error updating post:', err);
      }
    }
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
        avatar: userData.profilePicture
      }
    });
  };

  const handleSaveNewPost = async () => {
    if (editingPost) {
      try {
        const response = await createPost(editingPost);
        setPosts([...posts, response.data]);
        setIsCreating(false);
        setEditingPost(null);
      } catch (err) {
        setError('Failed to create post. Please try again.');
        console.error('Error creating post:', err);
      }
    }
  };

  const showDeleteConfirmation = (id: number) => {
    setPostToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingPost) {
      setEditingPost({ ...editingPost, [e.target.name]: e.target.value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && editingPost) {
      const files = Array.from(e.target.files);
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      try {
        // TODO: Implement actual file upload to server
        // const response = await api.post('/upload', formData);
        // const uploadedFiles = response.data;

        // Simulating server response
        const uploadedFiles: MediaItem[] = files.map((file, index) => ({
          id: Math.random(),
          [file.type.startsWith('image') ? 'image' : 'video']: URL.createObjectURL(file)
        }));

        setEditingPost({
          ...editingPost,
          images: [...editingPost.images, ...uploadedFiles.filter(f => 'image' in f) as MediaItem[]],
          videos: [...editingPost.videos, ...uploadedFiles.filter(f => 'video' in f) as MediaItem[]]
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        setError('Failed to upload files. Please try again.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.training_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
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
              showDeleteConfirmation={showDeleteConfirmation}
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
          onFileUpload={handleFileUpload}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCancel={() => {
            setIsEditing(false);
            setIsCreating(false);
            setEditingPost(null);
          }}
          onSave={isCreating ? handleSaveNewPost : handleSaveEditedPost}
        />
      )}
    </div>
  );
}

export default App;
