// ./front/src/components/sections/footers/test-footer.component.tsx
import React from "react";

interface TestFooterProps {
  onOpenAdminPanel: () => void;
}

const TestFooter: React.FC<TestFooterProps> = ({ onOpenAdminPanel }) => {
  // Podmienka na nezobrazenie v produkčnom režime
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4">
      <div className="max-w-content mx-auto px-container">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Development Footer</span>
          <button
            onClick={onOpenAdminPanel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Open Admin Panel
          </button>
        </div>
      </div>
    </footer>
  );
};

export default TestFooter;
