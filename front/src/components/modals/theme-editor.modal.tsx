import React, { useState } from "react";
import { updateTheme } from "@/api/themes.api"; // Import API function

const ThemeEditorModal: React.FC<{ theme: any; onClose: () => void }> = ({
  theme,
  onClose,
}) => {
  const [formData, setFormData] = useState(theme);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTheme(formData); // Call API to update theme
      alert("Theme updated successfully!");
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error("Failed to update theme:", error);
      alert("Error updating theme");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <label>
          None Value:
          <input
            type="text"
            name="none_value"
            value={formData.none_value || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Default Value:
          <input
            type="text"
            name="default_value"
            value={formData.default_value || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Test Value:
          <input
            type="text"
            name="test_value"
            value={formData.test_value || ""}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Custom Value:
          <input
            type="text"
            name="custom_value"
            value={formData.custom_value || ""}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ThemeEditorModal;
