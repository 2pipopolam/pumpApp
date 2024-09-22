import React from 'react';

interface DeleteDialogProps {
  isDarkMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ isDarkMode, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white p-6 rounded-lg ${isDarkMode ? 'text-black' : ''}`}>
        <h2 className="text-xl font-bold mb-4">Удаление поста</h2>
        <p className="mb-4">Пост будет удален, вы уверены?</p>
        <div className="flex justify-end">
          <button
            className="mr-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
