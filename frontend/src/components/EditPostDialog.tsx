// EditPostDialog.tsx

import React, { useState } from 'react';
import { ExtendedPost, ExtendedMediaItem } from '../types';

interface EditPostDialogProps {
  isDarkMode: boolean;
  isCreating: boolean;
  editingPost: ExtendedPost;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMedia: (type: 'image' | 'video', mediaItem: ExtendedMediaItem) => void;
  onAddMediaUrl: (type: 'image' | 'video', url: string) => void;
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
  onAddMediaUrl,
  onDragOver,
  onDrop,
  onCancel,
  onSave,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleAddImageUrl = () => {
    if (imageUrl) {
      onAddMediaUrl('image', imageUrl);
      setImageUrl('');
    }
  };

  const handleAddVideoUrl = () => {
    if (videoUrl) {
      onAddMediaUrl('video', videoUrl);
      setVideoUrl('');
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isDarkMode ? 'bg-gray-900 bg-opacity-50' : 'bg-gray-200 bg-opacity-50'
      }`}
    >
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

        {/* Поля для ввода URL изображений */}
        <div className="mb-4">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL изображения"
            className={`w-full p-2 mb-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          />
          <button
            onClick={handleAddImageUrl}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Добавить изображение по URL
          </button>
        </div>

        {/* Поля для ввода URL видео */}
        <div className="mb-4">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="URL видео"
            className={`w-full p-2 mb-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          />
          <button
            onClick={handleAddVideoUrl}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Добавить видео по URL
          </button>
        </div>

        {/* Отображение существующих изображений */}
        {editingPost.images.length > 0 && (
          <div className="mb-4">
            <p className="font-bold mb-2">Изображения:</p>
            <div className="grid grid-cols-4 gap-4">
              {editingPost.images.map((image) => (
                <div
                  key={image.id || image.image_url || (image.file ? image.file.name : Math.random())}
                  className="relative"
                >
                  {image.file ? (
                    <img
                      src={URL.createObjectURL(image.file)}
                      alt="Изображение"
                      className="w-full h-20 object-cover rounded"
                    />
                  ) : image.image_url ? (
                    <img src={image.image_url} alt="Изображение" className="w-full h-20 object-cover rounded" />
                  ) : image.image ? (
                    <img src={image.image} alt="Изображение" className="w-full h-20 object-cover rounded" />
                  ) : null}
                  <button onClick={() => onRemoveMedia('image', image)} className="absolute top-1 right-1 text-red-500">
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
                <div
                  key={video.id || video.video_url || (video.file ? video.file.name : Math.random())}
                  className="relative"
                >
                  {video.file ? (
                    <video src={URL.createObjectURL(video.file)} className="w-full h-20 object-cover rounded" controls />
                  ) : video.video_url ? (
                    // Если это ссылка на YouTube, используем iframe
                    video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeID(video.video_url)}`}
                        title="YouTube video"
                        className="w-full h-20 object-cover rounded"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video src={video.video_url} className="w-full h-20 object-cover rounded" controls />
                    )
                  ) : video.video ? (
                    <video src={video.video} className="w-full h-20 object-cover rounded" controls />
                  ) : null}
                  <button onClick={() => onRemoveMedia('video', video)} className="absolute top-1 right-1 text-red-500">
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

// Функция для извлечения ID видео YouTube
function extractYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default EditPostDialog;
