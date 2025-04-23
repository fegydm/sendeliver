// ./front/src/components/admin/config-editor.tsx
import React from "react";

interface ConfigEditorProps {
  onClose: () => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
        {/* Tu pridáme logiku pre úpravu JSON konfigurácie */}
        <p>Here you can edit configuration settings.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ConfigEditor;
