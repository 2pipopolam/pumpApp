import React from 'react';
import { Post } from '../services/api';

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
      {post.photo && <img src={post.photo} alt={post.title} className="mt-4 rounded-lg" />}
      {post.video && (
        <video src={post.video} controls className="mt-4 rounded-lg">
          Your browser does not support the video tag.
        </video>
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
