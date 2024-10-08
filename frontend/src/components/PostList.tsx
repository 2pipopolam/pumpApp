// src/components/PostList.tsx

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
  // Removed addNewPost prop
}

const PostList: React.FC<PostListProps> = ({
  posts,
  userData,
  isDarkMode,
  startEditing,
  showDeleteConfirmation,
}) => {
  return (
    <div className="max-w-4xl w-full p-10">
      {/* Removed avatar, username, and addNewPost button */}
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
