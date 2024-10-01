// components/EditProfilePictureDialog.tsx
import React, { useState } from 'react';
import { UserData } from '../types';

interface EditProfilePictureDialogProps {
  isDarkMode: boolean;
  userData: UserData;
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setIsDeleting(true);
  };

  const handleSubmit = () => {
    if (isDeleting) {
      onSave(null);
    } else {
      onSave(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
        }`}
      >
        <h2 className="text-xl mb-4">Редактировать аватар</h2>
        <div className="flex flex-col items-center">
          {selectedFile ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="New avatar"
              className="w-36 h-36 rounded-full mb-4"
            />
          ) : isDeleting ? (
            <p>Аватар будет удален.</p>
          ) : (
            <img
              src={userData.profilePicture}
              alt="Current avatar"
              className="w-36 h-36 rounded-full mb-4"
            />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleDelete} className="mt-2 text-red-500">
            Удалить аватар
          </button>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onCancel} className="mr-2 px-4 py-2 bg-gray-300 rounded">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePictureDialog;
