import React from 'react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 text-2xl"
      aria-label={isDarkMode ? 'Включить светлый режим' : 'Включить темный режим'}
    >
      {isDarkMode ? '☀️ ' : '🌑'}
    </button>
  );
};

export default DarkModeToggle;
