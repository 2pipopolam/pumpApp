import React, { useState } from 'react';
import { PostData, UserData, MediaItem } from './types';
import DarkModeToggle from './components/DarkModeToggle';
import SearchBar from './components/SearchBar';
import PostList from './components/PostList';
import DeleteDialog from './components/DeleteDialog';
import EditPostDialog from './components/EditPostDialog';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: 1,
      title: 'Название поста',
      type: 'Тип тренировки',
      description: 'Описание тренировки. Здесь может быть довольно длинный текст, описывающий детали тренировки.',
      media: [
        { type: 'image', url: 'https://via.placeholder.com/500' },
        { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
      ],
      views: 1234,
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
    setEditingPost({ ...post });
  };

  const saveEditedPost = () => {
    if (editingPost) {
      setPosts(posts.map(post => post.id === editingPost.id ? editingPost : post));
      setIsEditing(false);
      setEditingPost(null);
    }
  };

  const addNewPost = () => {
    setIsCreating(true);
    setEditingPost({
      id: Date.now(),
      title: '',
      type: '',
      description: '',
      media: [],
      views: 0
    });
  };

  const saveNewPost = () => {
    if (editingPost) {
      setPosts([...posts, editingPost]);
      setIsCreating(false);
      setEditingPost(null);
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

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingPost && e.target.value) {
      const url = e.target.value;
      let newMedia: MediaItem;

      if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
        newMedia = { type: 'image', url };
      } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        newMedia = { type: 'video', url };
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = getYoutubeVideoId(url);
        newMedia = { type: 'youtube', url: `https://www.youtube.com/embed/${videoId}` };
      } else {
        // Попробуем загрузить изображение по ссылке
        const img = new Image();
        img.onload = () => {
          setEditingPost(prevPost => {
            if (prevPost) {
              return { ...prevPost, media: [...prevPost.media, { type: 'image', url }] };
            }
            return prevPost;
          });
        };
        img.onerror = () => {
          alert('Неподдерживаемый формат файла или недействительная ссылка');
        };
        img.src = url;
        return;
      }

      setEditingPost(prevPost => {
        if (prevPost) {
          return { ...prevPost, media: [...prevPost.media, newMedia] };
        }
        return prevPost;
      });
      e.target.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingPost && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        let type: 'image' | 'video';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        } else {
          alert('Неподдерживаемый формат файла');
          return;
        }

        const newMedia: MediaItem = {
          type,
          url: reader.result as string
        };
        setEditingPost(prevPost => {
          if (prevPost) {
            return { ...prevPost, media: [...prevPost.media, newMedia] };
          }
          return prevPost;
        });
      };

      reader.onerror = () => {
        alert('Ошибка при чтении файла');
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (editingPost && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        let type: 'image' | 'video';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        } else {
          alert('Неподдерживаемый формат файла');
          return;
        }

        const newMedia: MediaItem = {
          type,
          url: reader.result as string
        };
        setEditingPost(prevPost => {
          if (prevPost) {
            return { ...prevPost, media: [...prevPost.media, newMedia] };
          }
          return prevPost;
        });
      };

      reader.onerror = () => {
        alert('Ошибка при чтении файла');
      };

      reader.readAsDataURL(file);
    }
  };

  const getYoutubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const updateEditingPostMedia = (newMedia: MediaItem[]) => {
    if (editingPost) {
      setEditingPost({ ...editingPost, media: newMedia });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userData.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex">
        <div className="w-64 p-4 fixed left-10 top-12 h-full flex flex-col">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
        </div>

        <div className="flex-grow flex justify-center">
          <PostList
            posts={filteredPosts}
            userData={userData}
            isDarkMode={isDarkMode}
            startEditing={startEditing}
            showDeleteConfirmation={showDeleteConfirmation}
            addNewPost={addNewPost}
          />
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteDialog
          isDarkMode={isDarkMode}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={() => postToDelete !== null && deletePost(postToDelete)}
        />
      )}

      {(isEditing || isCreating) && editingPost && (
        <EditPostDialog
          isDarkMode={isDarkMode}
          isCreating={isCreating}
          editingPost={editingPost}
          onInputChange={handleInputChange}
          onMediaChange={handleMediaChange}
          onFileUpload={handleFileUpload}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCancel={() => {
            setIsEditing(false);
            setIsCreating(false);
            setEditingPost(null);
          }}
          onSave={isCreating ? saveNewPost : saveEditedPost}
          updateEditingPostMedia={updateEditingPostMedia}
        />
      )}
    </div>
  );
}

export default App;
