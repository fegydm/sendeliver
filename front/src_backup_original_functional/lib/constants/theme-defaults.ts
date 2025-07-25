// File: front/src/constants/theme-defaults.ts
// Last change: Fixed export for themeDefaults and added safer initialization

export type ThemeField =
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

/**
 * Automatically fetch CSS variables from the browser's computed styles.
 * This ensures that the variables match the live styles applied in the DOM.
 */
export const themeDefaults: Record<ThemeField, string> = (() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const variables: Record<ThemeField, string> = {
        "color-page-bg": rootStyles.getPropertyValue('--color-page-bg').trim() || "#ffffff",
        "color-navbar-bg": rootStyles.getPropertyValue('--color-navbar-bg').trim() || "#f8f8f8",
        "color-footer-bg": rootStyles.getPropertyValue('--color-footer-bg').trim() || "#eeeeee",
        "color-modal-bg": rootStyles.getPropertyValue('--color-modal-bg').trim() || "#ffffff",
        "color-text-primary": rootStyles.getPropertyValue('--color-text-primary').trim() || "#000000",
        "color-text-secondary": rootStyles.getPropertyValue('--color-text-secondary').trim() || "#333333",
        "height-header": rootStyles.getPropertyValue('--height-header').trim() || "100px",
        "height-footer": rootStyles.getPropertyValue('--height-footer').trim() || "200px",
        "height-banner": rootStyles.getPropertyValue('--height-banner').trim() || "300px",
        "modal-offset-top": rootStyles.getPropertyValue('--modal-offset-top').trim() || "10vh",
        "font-size-base": rootStyles.getPropertyValue('--font-size-base').trim() || "16px",
        "font-size-lg": rootStyles.getPropertyValue('--font-size-lg').trim() || "20px",
        "font-size-sm": rootStyles.getPropertyValue('--font-size-sm').trim() || "14px",
        "spacing-xs": rootStyles.getPropertyValue('--spacing-xs').trim() || "4px",
        "spacing-sm": rootStyles.getPropertyValue('--spacing-sm').trim() || "8px",
        "spacing-md": rootStyles.getPropertyValue('--spacing-md').trim() || "16px",
        "spacing-lg": rootStyles.getPropertyValue('--spacing-lg').trim() || "24px"
    };
    return variables;
})();
