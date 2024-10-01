// PostList.tsx

import React from 'react';
import { Post } from '../types';
import PostItem from './PostItem';
import { UserData } from '../types';

interface PostListProps {
  posts: Post[];
  userData: UserData;
  isDarkMode: boolean;
  startEditing: (post: Post) => void;
  showDeleteConfirmation: (id: number) => void;
  addNewPost: () => void;
  onEditProfilePicture: () => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  userData,
  isDarkMode,
  startEditing,
  showDeleteConfirmation,
  addNewPost,
  onEditProfilePicture,
}) => {
  const buttonClass =
    'w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xl text-gray-600 hover:bg-gray-400 transition-colors duration-300';

  return (
    <div className="max-w-4xl w-full p-10">
      <div className="flex items-center mb-6 mt-6 relative">
        <img
          src={userData.profilePicture}
          alt="Profile"
          className="w-36 h-36 rounded-full mr-8"
          onClick={onEditProfilePicture}
          style={{ cursor: 'pointer' }}
        />
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {userData.username}
        </h2>
        <button
          className={`absolute top-2 right-2 ${buttonClass}`}
          aria-label="Добавить новый пост"
          onClick={addNewPost}
        >
          +
        </button>
      </div>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          isDarkMode={isDarkMode}
          startEditing={() => startEditing(post)}
          showDeleteConfirmation={() => showDeleteConfirmation(post.id)}
        />
      ))}
    </div>
  );
};

export default PostList;
