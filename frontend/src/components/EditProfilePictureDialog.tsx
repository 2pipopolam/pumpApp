// src/components/EditProfilePictureDialog.tsx

import React, { useState } from 'react';
import { updateProfile } from '../services/api';

interface EditProfilePictureDialogProps {
  isDarkMode: boolean;
  userData: any;
  onCancel: () => void;
  onSave: (newProfilePicture: File | null) => void;
}

const EditProfilePictureDialog: React.FC<EditProfilePictureDialogProps> = ({
  isDarkMode,
  userData,
  onCancel,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    const formData = new FormData();
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    } else {
      formData.append('avatar', '');
    }

    try {
      await updateProfile(formData);
      onSave(selectedFile);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось обновить аватар.');
      console.error('Ошибка при обновлении аватара:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white dark:bg-gray-800 p-6 rounded shadow-md w-96`}>
        <h2 className="text-xl mb-4">Изменить аватар</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {preview ? (
          <img src={preview} alt="Preview" className="mb-4 w-32 h-32 object-cover rounded-full" />
        ) : (
          <p className="mb-4">Выберите изображение для аватара.</p>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-2 p-2 bg-gray-300 rounded">
            Отмена
          </button>
          <button onClick={handleSubmit} className="p-2 bg-blue-500 text-white rounded">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePictureDialog;
