import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle dark mode"
  >
    {isDarkMode ? (
      <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />
    ) : (
      <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
    )}
  </button>
);

export default DarkModeToggle;
