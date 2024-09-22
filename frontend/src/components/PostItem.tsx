import React from 'react';
import { PostData } from '../types';

interface PostItemProps {
  post: PostData;
  isDarkMode: boolean;
  startEditing: (post: PostData) => void;
  showDeleteConfirmation: (id: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, isDarkMode, startEditing, showDeleteConfirmation }) => {
  const buttonClass = "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xl text-gray-600 hover:bg-gray-400 transition-colors duration-300";

  return (
    <div className={`rounded-lg shadow-md p-6 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative`}>
      <div className={`rounded-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} relative`}>
        <button className={`absolute top-2 left-2 ${buttonClass}`} aria-label="Редактировать пост" onClick={() => startEditing(post)}>
          ✍️
        </button>
        <button className={`absolute top-2 right-2 ${buttonClass}`} aria-label="Удалить пост" onClick={() => showDeleteConfirmation(post.id)}>
          🗑️
        </button>
        <h1 className="text-3xl font-bold text-center mb-10 text-indigo-600">{post.title}</h1>
        <p className={`text-xl text-center mb-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{post.type}</p>
        <p className={`text-lg text-center mb-10 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{post.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
          {post.media.map((item, index) => (
            item.type === 'image' ? (
              <img key={index} src={item.url} alt={`Media ${index + 1}`} className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
            ) : item.type === 'video' ? (
              <video key={index} src={item.url} controls className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
            ) : (
              <iframe
                key={index}
                src={item.url}
                title={`YouTube video ${index + 1}`}
                className="w-full h-auto aspect-video rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                allowFullScreen
              ></iframe>
            )
          ))}
        </div>
      </div>

      <div className="text-right">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Просмотры: {post.views}</p>
      </div>
    </div>
  );
};

export default PostItem;
