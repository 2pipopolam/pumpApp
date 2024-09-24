import React, { useRef } from 'react';
import { Post } from '../types';

interface EditPostDialogProps {
  isDarkMode: boolean;
  isCreating: boolean;
  editingPost: Post;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onMediaChange,
  onFileUpload,
  onDragOver,
  onDrop,
  onCancel,
  onSave
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white p-6 rounded-lg ${isDarkMode ? 'text-black' : ''} w-full max-w-md max-h-screen overflow-y-auto`}>
        <h2 className="text-xl font-bold mb-4">{isCreating ? 'Создание нового поста' : 'Редактирование поста'}</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Название поста</label>
            <input
              type="text"
              id="title"
              name="title"
              value={editingPost.title}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="training_type" className="block text-sm font-medium text-gray-700">Тип тренировки</label>
            <input
              type="text"
              id="training_type"
              name="training_type"
              value={editingPost.training_type}
              onChange={onInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Описание тренировки</label>
            <textarea
              id="description"
              name="description"
              value={editingPost.description}
              onChange={onInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="media" className="block text-sm font-medium text-gray-700">Добавить медиа (URL)</label>
            <input
              type="text"
              id="media"
              name="media"
              onChange={onMediaChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div
            className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-md"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <p className="text-center text-gray-500 mb-2">Перетащите файлы сюда или</p>
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Выберите файлы
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
          </div>
          {editingPost.photo && (
            <div className="mb-4">
              <img src={editingPost.photo} alt="Post" className="w-full h-auto rounded-lg" />
            </div>
          )}
          {editingPost.video && (
            <div className="mb-4">
              <video src={editingPost.video} controls className="w-full h-auto rounded-lg">
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </form>
        <div className="flex justify-end mt-4">
          <button
            className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={onSave}
          >
            {isCreating ? 'Создать' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostDialog;
