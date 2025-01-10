// File: front/src/components/elements/theme-switcher.element.tsx
// Last change: Added 'None' button for disabling all styles

import React from "react";

// Theme paths for dynamic loading
const themes = {
    none: "/src/styles/themes/none.css",
    basic: "/src/styles/themes/basic.css",
    default: "/src/styles/themes/default.css",
    testing: "/src/styles/themes/testing.css",
    custom: "/src/styles/themes/custom.css",
};

// Function to update the theme dynamically
const updateTheme = (theme: keyof typeof themes) => {
    const linkElement = document.getElementById("theme-link") as HTMLLinkElement;
    if (linkElement) {
        linkElement.href = themes[theme];
    }
};

const ThemeSwitcher: React.FC = () => {
    return (
        <div className="theme-switcher">
            <button onClick={() => updateTheme("none")}>None</button>
            <button onClick={() => updateTheme("basic")}>Basic</button>
            <button onClick={() => updateTheme("default")}>Default</button>
            <button onClick={() => updateTheme("testing")}>Testing</button>
            <button onClick={() => updateTheme("custom")}>Custom</button>
        </div>
    );
};

export default ThemeSwitcher;
