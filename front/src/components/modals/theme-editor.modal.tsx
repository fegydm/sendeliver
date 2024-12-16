import React, { useState, useEffect } from "react";
import { Input, Button, Tabs } from "@/components/ui";
import GeneralModal from "@/components/modals/general.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";

type ThemeField = 
  | 'page_bg_none' | 'page_bg_default' | 'page_bg_testing' | 'page_bg_custom'
  | 'navbar_bg_none' | 'navbar_bg_default' | 'navbar_bg_testing' | 'navbar_bg_custom'
  | 'modal_bg_none' | 'modal_bg_default' | 'modal_bg_testing' | 'modal_bg_custom';

interface ThemeEditorModalProps {
  isOpen: boolean;
  editorData: Record<string, string>;
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
}

interface ColorPickerState {
  isOpen: boolean;
  targetField: ThemeField | "";
}

const initialState: Record<ThemeField, string> = {
  page_bg_none: "",
  page_bg_default: "",
  page_bg_testing: "",
  page_bg_custom: "#ffffff",
  navbar_bg_none: "",
  navbar_bg_default: "",
  navbar_bg_testing: "",
  navbar_bg_custom: "#ffffff",
  modal_bg_none: "",
  modal_bg_default: "",
  modal_bg_testing: "",
  modal_bg_custom: "#ffffff",
};

const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  editorData,
  onSave,
  onClose,
}) => {
  const [localData, setLocalData] = useState<Record<ThemeField, string>>({ ...initialState, ...editorData });
  const [activeTab, setActiveTab] = useState("background");
  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    isOpen: false,
    targetField: "",
  });

  useEffect(() => {
    if (isOpen) {
      setLocalData({ ...initialState, ...editorData });
    }
  }, [isOpen, editorData]);

  const handleColorSelect = (color: string) => {
    if (colorPicker.targetField) {
      setLocalData(prev => ({
        ...prev,
        [colorPicker.targetField]: color,
      }));
    }
    setColorPicker({ isOpen: false, targetField: "" });
  };

  const renderColorRow = (label: string, baseKey: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-4 gap-4">
        {["none", "default", "testing", "custom"].map((type) => {
          const fieldKey = `${baseKey}_${type}` as ThemeField;
          return (
            <div key={fieldKey} className="flex items-center gap-2">
              <Input
                type="text"
                value={localData[fieldKey]}
                onChange={(e) => {
                  setLocalData(prev => ({
                    ...prev,
                    [fieldKey]: e.target.value,
                  }));
                }}
                className="flex-1"
                readOnly
              />
              <Button
                variant="secondary"
                onClick={() => setColorPicker({
                  isOpen: true,
                  targetField: fieldKey,
                })}
                className="w-10 h-10 p-0"
              >
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: localData[fieldKey] || '#ffffff' }}
                />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <GeneralModal
        isOpen={isOpen}
        onClose={onClose}
        title="Theme Editor"
        actions={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => onSave(localData)}>
              Save
            </Button>
          </>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="background">Background</Tabs.Trigger>
            <Tabs.Trigger value="modal">Modal</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="background" className="space-y-6 py-4">
            {renderColorRow("Page Background Color", "page_bg")}
            {renderColorRow("Navbar Background Color", "navbar_bg")}
          </Tabs.Content>

          <Tabs.Content value="modal" className="space-y-6 py-4">
            {renderColorRow("Modal Background Color", "modal_bg")}
          </Tabs.Content>
        </Tabs>
      </GeneralModal>

      <ColorPaletteModal
        isOpen={colorPicker.isOpen}
        onClose={() => setColorPicker({ isOpen: false, targetField: "" })}
        onColorSelect={handleColorSelect}
      />
    </>
  );
};

export default ThemeEditorModal;