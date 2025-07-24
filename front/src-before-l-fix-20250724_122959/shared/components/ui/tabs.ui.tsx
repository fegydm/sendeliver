// File: src/components/ui/tabs.ui.ts
// Last change: Complete rewrite to follow React and HTML standards with proper WAI-ARIA support

import * as React from "react";

// Context for sharing state between tab components
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<tabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a <Tabs> component");
  }
  return context;
}

// Base interface for shared props
interface BaseProps {
  children: React.ReactNode;
  className?: string;
}

// Props for the main Tabs component
interface TabsProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  id?: string;
}

// Props for the TabsList component
interface TabsListProps extends BaseProps {}

// Props for the TabsTrigger component
interface TabsTriggerProps extends BaseProps {
  value: string;
  disabled?: boolean;
  role?: "sender" | "hauler"; // Custom prop for role-based styling
}

// Props for the TabsContent component
interface TabsContentProps extends BaseProps {
  value: string;
}

// Main Tabs component
const TabsRoot: React.FC<tabsProps> = ({
  children,
  value,
  defaultValue,
  onChange,
  className,
  id: providedId,
}) => {
  // Generate a stable ID if none is provided
  const generatedId = React.useId();
  const id = providedId || generatedId;

  // Manage the active tab state
  const [activeTab, setActiveTabInternal] = React.useState(
    value || defaultValue || ""
  );
  
  // External controlled state takes precedence
  const currentActiveTab = value !== undefined ? value : activeTab;
  
  // Handler for tab changes
  const setActiveTab = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setActiveTabInternal(newValue);
      }
      onChange?.(newValue);
    },
    [onChange, value]
  );
  
  // Update internal state when controlled value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTabInternal(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={{ activeTab: currentActiveTab, setActiveTab }}>
      <div 
        className={`tabs-container ${className || ""}`}
        id={id}
        data-state={currentActiveTab ? "active" : "inactive"}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component
const TabsList: React.FC<tabsListProps> = ({
  children,
  className,
}) => {
  return (
    <div 
      className={`tabs-list ${className || ""}`} 
      role="tablist"
      aria-orientation="horizontal"
    >
      {children}
    </div>
  );
};

// TabsTrigger component
const TabsTrigger: React.FC<tabsTriggerProps> = ({
  children,
  value,
  className,
  disabled = false,
  role: customRole,
}) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;
  
  // Generate a stable ID for the trigger and its associated panel
  const tabId = React.useId();
  const panelId = `panel-${tabId}`;
  
  const handleClick = React.useCallback(() => {
    if (!disabled) {
      setActiveTab(value);
    }
  }, [disabled, setActiveTab, value]);

  // Build the class names
  const classNames = ["tabs-trigger"];
  if (isActive) classNames.push("tabs-trigger--active");
  if (disabled) classNames.push("tabs-trigger--disabled");
  if (customRole) classNames.push(`tabs-trigger--${customRole}`);
  if (className) classNames.push(className);

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      aria-disabled={disabled}
      disabled={disabled}
      className={classNames.join(" ")}
      onClick={handleClick}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
    >
      {children}
    </button>
  );
};

// TabsContent component
const TabsContent: React.FC<tabsContentProps> = ({
  children,
  value,
  className,
}) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;
  
  // Generate a stable ID for the panel
  const panelId = React.useId();
  const tabId = `tab-${panelId}`;
  
  // Don't render inactive tabs for performance and to avoid issues with forms
  if (!isActive) return null;
  
  return (
    <div 
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={`tabs-content ${className || ""}`}
      tabIndex={0}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
    >
      {children}
    </div>
  );
};

// Compound component structure
const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export { Tabs };

/*
English Comments:
- Complete rewrite using React Context for state management
- Added proper WAI-ARIA attributes for accessibility
- Used HTML standard attributes instead of custom props on DOM elements
- Added data-state attributes for styling based on component state
- Implemented proper controlled/uncontrolled component pattern
- Used React.useId() for stable, unique IDs
- Used compound component pattern for better developer experience
*/