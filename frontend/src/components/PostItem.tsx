// PostItem.tsx
import React from 'react';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  isDarkMode: boolean;
  startEditing: () => void;
  showDeleteConfirmation: () => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, isDarkMode, startEditing, showDeleteConfirmation }) => {
  return (
    <div className={`rounded-lg shadow-md p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
      {/* Кнопки редактирования и удаления */}
      <div className="absolute top-2 left-2 flex space-x-2">
        <button onClick={startEditing} className="text-xl" aria-label="Редактировать пост">
          ✏️
        </button>
      </div>
      <div className="absolute top-2 right-2 flex space-x-2">
        <button onClick={showDeleteConfirmation} className="text-xl" aria-label="Удалить пост">
          🗑️
        </button>
      </div>
      {/* Остальное содержимое поста */}
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p className="mb-4">{post.description}</p>
      <p className="text-sm text-gray-500">Тип тренировки: {post.training_type}</p>

      {post.images.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5">
          {post.images.map((image) => (
            <img
              key={image.id}
              src={image.image || image.image_url}
              alt={post.title}
              className="rounded-lg w-full h-full object-cover"
            />
          ))}
        </div>
      )}

      {post.videos.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-5">
          {post.videos.map((video) => (
            <div key={video.id}>
              {video.video_url ? (
                video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeID(video.video_url)}`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={video.video_url} controls className="rounded-lg w-full h-full object-cover">
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <video src={video.video} controls className="rounded-lg w-full h-full object-cover">
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Просмотры: {post.views}</p>
        <p>Создано: {new Date(post.created_at).toLocaleString()}</p>
        <p>Обновлено: {new Date(post.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

// Функция для извлечения ID видео YouTube
function extractYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default PostItem;
