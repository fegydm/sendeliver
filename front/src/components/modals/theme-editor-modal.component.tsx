// ./front/src/components/modals/theme-editor-modal.component.tsx
import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.ui";
import { Card, CardContent } from "@/components/ui/card.ui";
import { Label } from "@/components/ui/label.ui";
import { Input } from "@/components/ui/input.ui";
import GeneralModal from "./general-modal.component";

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("modal");

  // Load configuration from JSON
  useEffect(() => {
    if (isOpen) {
      fetch("/src/configs/theme-config.json")
        .then((res) => res.json())
        .then((data) => setConfig(data))
        .catch((err) => console.error("Failed to load config:", err));
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (
    section: string,
    key: string,
    value: string | number
  ) => {
    setConfig((prevConfig: any) => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        [key]: value,
      },
    }));
  };

  // Save configuration to JSON
  const saveConfig = async () => {
    try {
      await fetch("/src/configs/theme-config.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config, null, 2),
      });
      alert("Configuration saved!");
      onClose();
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  };

  if (!config) {
    return null; // Render nothing while loading
  }

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        <button
          onClick={saveConfig}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Save Changes
        </button>
      }
    >
      <div className="w-full max-w-4xl">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {Object.keys(config).map((section) => (
              <TabsTrigger key={section} value={section}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(config).map((section) => (
            <TabsContent key={section} value={section}>
              <Card>
                <CardContent className="space-y-4 pt-4">
                  {Object.keys(config[section]).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`${section}-${key}`}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      <Input
                        id={`${section}-${key}`}
                        type={
                          typeof config[section][key] === "number"
                            ? "number"
                            : "text"
                        }
                        value={config[section][key]}
                        onChange={(e) =>
                          handleInputChange(
                            section,
                            key,
                            e.target.value || e.target.valueAsNumber
                          )
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </GeneralModal>
  );
};

export default ThemeEditorModal;
