// src/components/PostList.tsx

import React from 'react';
import { Post, UserData } from '../types';
import PostItem from './PostItem';

interface PostListProps {
  posts: Post[];
  userData?: UserData; // Made optional
  isDarkMode: boolean;
  startEditing?: (post: Post) => void; // Made optional
  showDeleteConfirmation?: (id: number) => void; // Made optional
  canEdit?: boolean;    // Optional prop to control edit button visibility globally
  canDelete?: boolean;  // Optional prop to control delete button visibility globally
}

const PostList: React.FC<PostListProps> = ({
  posts,
  userData,
  isDarkMode,
  startEditing,
  showDeleteConfirmation,
  canEdit = true,     // Defaults to true if not provided
  canDelete = true,   // Defaults to true if not provided
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          isDarkMode={isDarkMode}
          startEditing={startEditing ? () => startEditing(post) : () => {}}
          showDeleteConfirmation={showDeleteConfirmation ? () => showDeleteConfirmation(post.id) : () => {}}
          canEdit={canEdit && userData?.id === post.profile.id}    // Ensure correct comparison
          canDelete={canDelete && userData?.id === post.profile.id}
        />
      ))}
    </div>
  );
};

export default PostList;
