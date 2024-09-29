import React from 'react';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  isDarkMode: boolean;
  startEditing: () => void;
  showDeleteConfirmation: () => void;
  children?: React.ReactNode;
}

const PostItem: React.FC<PostItemProps> = ({ post, isDarkMode, startEditing, showDeleteConfirmation, children }) => {
  return (
    <div className={`rounded-lg shadow-md p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p className="mb-4">{post.description}</p>
      <p className="text-sm text-gray-500">Тип тренировки: {post.training_type}</p>
      
      {post.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {post.images.map((image) => (
            <img key={image.id} src={image.image} alt={post.title} className="rounded-lg w-full h-48 object-cover" />
          ))}
        </div>
      )}
      
      {post.videos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {post.videos.map((video) => (
            <video key={video.id} src={video.video} controls className="rounded-lg w-full h-48 object-cover">
              Your browser does not support the video tag.
            </video>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Просмотры: {post.views}</p>
        <p>Создано: {new Date(post.created_at).toLocaleString()}</p>
        <p>Обновлено: {new Date(post.updated_at).toLocaleString()}</p>
      </div>
      {children}
    </div>
  );
};

export default PostItem;
