// EditPostDialog.tsx
import React from 'react';
import { ExtendedPost, ExtendedMediaItem } from '../types';

interface EditPostDialogProps {
  isDarkMode: boolean;
  isCreating: boolean;
  editingPost: ExtendedPost;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (type: 'image' | 'video', id: number) => void;
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
  onRemoveMedia,
  onDragOver,
  onDrop,
  onCancel,
  onSave
}) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDarkMode ? 'bg-gray-900 bg-opacity-50' : 'bg-gray-200 bg-opacity-50'}`}>
      <div className={`bg-white rounded-lg p-8 max-w-2xl w-full ${isDarkMode ? 'text-white bg-gray-800' : ''}`}>
        <h2 className="text-2xl font-bold mb-4">{isCreating ? 'Создать новый пост' : 'Редактировать пост'}</h2>
        <input
          type="text"
          name="title"
          value={editingPost.title}
          onChange={onInputChange}
          placeholder="Заголовок"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
        />
        <input
          type="text"
          name="training_type"
          value={editingPost.training_type}
          onChange={onInputChange}
          placeholder="Тип тренировки"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
        />
        <textarea
          name="description"
          value={editingPost.description}
          onChange={onInputChange}
          placeholder="Описание"
          className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          rows={4}
        />
        {/* Отображение существующих изображений */}
        {editingPost.images.length > 0 && (
          <div className="mb-4">
            <p className="font-bold mb-2">Изображения:</p>
            <div className="grid grid-cols-4 gap-4">
              {editingPost.images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.file ? URL.createObjectURL(image.file) : image.image}
                    alt="Изображение"
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => onRemoveMedia('image', image.id)}
                    className="absolute top-1 right-1 text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Отображение существующих видео */}
        {editingPost.videos.length > 0 && (
          <div className="mb-4">
            <p className="font-bold mb-2">Видео:</p>
            <div className="grid grid-cols-4 gap-4">
              {editingPost.videos.map((video) => (
                <div key={video.id} className="relative">
                  <video
                    src={video.file ? URL.createObjectURL(video.file) : video.video}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => onRemoveMedia('video', video.id)}
                    className="absolute top-1 right-1 text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`border-2 border-dashed p-4 mb-4 text-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
        >
          <p>Перетащите файлы сюда или</p>
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
            Отмена
          </button>
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostDialog;

