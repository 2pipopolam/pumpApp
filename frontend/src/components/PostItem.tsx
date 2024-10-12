// src/components/PostItem.tsx

import React from 'react';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  isDarkMode: boolean;
  startEditing: () => void;
  showDeleteConfirmation: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  isDarkMode,
  startEditing,
  showDeleteConfirmation,
  canEdit,
  canDelete,
}) => {
  return (
    <div
      className={`rounded-lg shadow-md p-6 mb-8 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      } relative`}
    >
      {/* Conditional Edit Button */}
      {canEdit && (
        <div className="absolute top-2 left-2 flex space-x-2">
          <button
            onClick={startEditing}
            className="text-xl focus:outline-none"
            aria-label="Edit Post"
          >
            ✏️
          </button>
        </div>
      )}

      {/* Conditional Delete Button */}
      {canDelete && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={showDeleteConfirmation}
            className="text-xl focus:outline-none"
            aria-label="Delete Post"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Post Header with Profile Information */}
      {post.profile && (
        <div className="flex items-center mb-4">
          {post.profile.avatar ? (
            <img
              src={`${post.profile.avatar}?t=${Date.now()}`} // Cache busting
              alt={`${post.profile.username}'s avatar`}
              className="w-12 h-12 rounded-full mr-4 object-cover"
              onError={(e) => {
                e.currentTarget.src = '/path/to/default/avatar.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
              <span className="text-gray-700">A</span>
            </div>
          )}
          <span className="font-semibold">{post.profile.username}</span>
        </div>
      )}

      {/* Post Content */}
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p className="mb-4">{post.description}</p>
      <p className="text-sm text-gray-500 mb-4">
        Тип тренировки: {post.training_type}
      </p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {post.images.map((image) => (
            <img
              key={image.id}
              src={image.image || image.image_url}
              alt={post.title}
              className="rounded-lg w-full h-48 object-cover"
            />
          ))}
        </div>
      )}

      {/* Videos */}
      {post.videos.length > 0 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {post.videos.map((video) => (
            <div key={video.id} className="rounded-lg overflow-hidden">
              {video.video_url ? (
                video.video_url.includes('youtube.com') ||
                video.video_url.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeID(
                      video.video_url
                    )}`}
                    className="w-full h-48"
                    allowFullScreen
                    title="YouTube Video"
                  ></iframe>
                ) : (
                  <video
                    src={video.video_url}
                    controls
                    className="w-full h-48 object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <video
                  src={video.video}
                  controls
                  className="w-full h-48 object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Metadata */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Просмотры: {post.views}</p>
        <p>Создано: {new Date(post.created_at).toLocaleString()}</p>
        <p>Обновлено: {new Date(post.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

// Function to extract YouTube Video ID
function extractYouTubeID(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default PostItem;
