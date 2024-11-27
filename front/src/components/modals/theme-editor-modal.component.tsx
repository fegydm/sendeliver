// ./components/modals/theme-editor-modal.component.tsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GeneralModal from "./general-modal.component";

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTheme, setActiveTheme] = useState("default");

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        <button
          onClick={() => {
            // Tu uložíme zmeny
            onClose();
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Save Changes
        </button>
      }
    >
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="modal" className="w-full">
          <TabsList>
            <TabsTrigger value="modal">Modal Windows</TabsTrigger>
            <TabsTrigger value="navbar">Navigation</TabsTrigger>
            {/* Ďalšie karty podľa potreby */}
          </TabsList>

          <TabsContent value="modal">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-bg-light">Background (Light)</Label>
                    <Input
                      id="modal-bg-light"
                      type="color"
                      defaultValue="#FFFFFF"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modal-bg-dark">Background (Dark)</Label>
                    <Input
                      id="modal-bg-dark"
                      type="color"
                      defaultValue="#1F2937"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modal-backdrop">Backdrop Opacity</Label>
                    <Input
                      id="modal-backdrop"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navbar">
            {/* Podobná štruktúra pre navbar nastavenia */}
          </TabsContent>
        </Tabs>
      </div>
    </GeneralModal>
  );
};

export default ThemeEditorModal;
