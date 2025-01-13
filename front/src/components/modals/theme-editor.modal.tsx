// File: front/src/components/modals/theme-editor.modal.tsx
// Last change: Display only browser defaults without storing them

import React, { useState, useEffect } from "react";
import { Input, Button, Tabs } from "@/components/ui";
import GeneralModal from "@/components/modals/general.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";

type ThemeField =
    | 'color-page-bg'
    | 'color-navbar-bg'
    | 'color-footer-bg'
    | 'color-modal-bg'
    | 'color-text-primary'
    | 'color-text-secondary'
    | 'height-header'
    | 'height-footer'
    | 'height-banner'
    | 'modal-offset-top'
    | 'font-size-base'
    | 'font-size-lg'
    | 'font-size-sm'
    | 'spacing-xs'
    | 'spacing-sm'
    | 'spacing-md'
    | 'spacing-lg';

interface ThemeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Record<ThemeField, string>) => void;
    editorData: Record<ThemeField, string>;
}

/**
 * Fetch the current browser default for a CSS variable
 * @param property CSS variable name (e.g., '--color-page-bg')
 */
const getBrowserDefault = (property: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(property).trim() || "N/A";

const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editorData
}) => {
    const [localData, setLocalData] = useState<Record<ThemeField, string>>(editorData);
    const [activeTab, setActiveTab] = useState("colors");
    const [colorPicker, setColorPicker] = useState({ isOpen: false, targetField: "" });

    useEffect(() => {
        if (isOpen) {
            setLocalData(editorData);
        }
    }, [isOpen, editorData]);

    /**
     * Update a CSS variable directly in the DOM
     */
    const updateCSSVariable = (field: ThemeField, value: string, mode: "default" | "testing") => {
        document.documentElement.style.setProperty(`--${field}`, value);
    };

    /**
     * Renders a row with three columns: BASIC, DEFAULT, TESTING
     */
    const renderVariableRow = (field: ThemeField) => (
        <div key={field} className="variable-row">
            <label className="variable-label">{field.replace(/-/g, " ")}</label>
            <div className="grid grid-cols-3 gap-4">
                {/* BASIC - Readonly with current browser default */}
                <Input
                    type="text"
                    value={getBrowserDefault(`--${field}`)}
                    readOnly
                />

                {/* DEFAULT - Editable and applies directly */}
                <Input
                    type="text"
                    value={localData[field]}
                    onChange={(e) => {
                        const value = e.target.value;
                        setLocalData((prev) => ({ ...prev, [field]: value }));
                        updateCSSVariable(field, value, "default");
                    }}
                />

                {/* TESTING - Editable and applies directly */}
                <Input
                    type="text"
                    value={localData[field]}
                    onChange={(e) => {
                        const value = e.target.value;
                        setLocalData((prev) => ({ ...prev, [field]: value }));
                        updateCSSVariable(field, value, "testing");
                    }}
                />
            </div>
        </div>
    );

    return (
        <>
            {/* Main Theme Editor Modal */}
            <GeneralModal
                isOpen={isOpen}
                onClose={onClose}
                title="Theme Editor"
                actions={
                    <>
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={() => onSave(localData)}>Save</Button>
                    </>
                }
            >
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Trigger value="colors">Colors</Tabs.Trigger>
                        <Tabs.Trigger value="spacing">Spacing</Tabs.Trigger>
                        <Tabs.Trigger value="typography">Typography</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="colors">
                        {renderVariableRow("color-page-bg")}
                        {renderVariableRow("color-navbar-bg")}
                        {renderVariableRow("color-footer-bg")}
                        {renderVariableRow("color-modal-bg")}
                    </Tabs.Content>

                    <Tabs.Content value="spacing">
                        {renderVariableRow("spacing-xs")}
                        {renderVariableRow("spacing-sm")}
                        {renderVariableRow("spacing-md")}
                        {renderVariableRow("spacing-lg")}
                    </Tabs.Content>

                    <Tabs.Content value="typography">
                        {renderVariableRow("font-size-base")}
                        {renderVariableRow("font-size-lg")}
                        {renderVariableRow("font-size-sm")}
                    </Tabs.Content>
                </Tabs>
            </GeneralModal>

            {/* Color Palette Modal */}
            <ColorPaletteModal
                isOpen={colorPicker.isOpen}
                onClose={() => setColorPicker({ isOpen: false, targetField: "" })}
                onColorSelect={(color) =>
                    updateCSSVariable(colorPicker.targetField as ThemeField, color, "default")
                }
            />
        </>
    );
};

export default ThemeEditorModal;
