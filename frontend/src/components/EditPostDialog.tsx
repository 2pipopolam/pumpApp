// src/components/EditPostDialog.tsx
import React from 'react';
import { ExtendedPost } from '../types';

interface EditPostDialogProps {
  isDarkMode: boolean;
  isCreating: boolean;
  editingPost: ExtendedPost;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({
  isDarkMode,
  isCreating,
  editingPost,
  onInputChange,
  onFileInputChange,
  onDragOver,
  onDrop,
  onCancel,
  onSave
}) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDarkMode ? 'bg-gray-900 bg-opacity-50' : 'bg-gray-200 bg-opacity-50'}`}>
      <div className={`bg-white rounded-lg p-8 max-w-2xl w-full ${isDarkMode ? 'text-white bg-gray-800' : ''}`}>
        <h2 className="text-2xl font-bold mb-4">{isCreating ? 'Create New Post' : 'Edit Post'}</h2>
        <input
          type="text"
          name="title"
          value={editingPost.title}
          onChange={onInputChange}
          placeholder="Title"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
        />
        <input
          type="text"
          name="training_type"
          value={editingPost.training_type}
          onChange={onInputChange}
          placeholder="Training Type"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
        />
        <textarea
          name="description"
          value={editingPost.description}
          onChange={onInputChange}
          placeholder="Description"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          rows={4}
        />
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`border-2 border-dashed p-4 mb-4 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
        >
          <p>Drag and drop files here or</p>
          <input
            type="file"
            onChange={onFileInputChange}
            multiple
            accept="image/*,video/*"
            className="mt-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded mr-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostDialog;
