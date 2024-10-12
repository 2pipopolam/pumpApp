// src/pages/AllPostsPage.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ExtendedPost } from '../types';
import { getAllPosts } from '../services/api';
import PostList from '../components/PostList';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AllPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchAllPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPosts();
      setPosts(
        response.data.map((post: ExtendedPost) => ({
          ...post,
          images: post.images.map((image) => ({ ...image, file: undefined })),
          videos: post.videos.map((video) => ({ ...video, file: undefined })),
        }))
      );
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllPosts();
    } else {
      navigate('/login');
    }
  }, [fetchAllPosts, user, navigate]);

  return (
    <div className="ml-64 p-4 flex-grow">
      {user ? (
        <div className="max-w-4xl w-full p-10">
          <h2 className="text-3xl font-bold mb-6">All Users' Posts</h2>
          {isLoading ? (
            <p>Loading posts...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <PostList
              posts={posts}
              isDarkMode={false} // Adjust as needed or pass as a prop
              canEdit={false} // Disable edit/delete buttons
              canDelete={false}
              startEditing={() => {}} // Dummy function
              showDeleteConfirmation={() => {}} // Dummy function
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl mb-4 text-gray-800 dark:text-white">Welcome!</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Please log in to view posts.
          </p>
          {/* Add a link to login if necessary */}
        </div>
      )}
    </div>
  );
};

export default AllPostsPage;
