// .front/src/components/ui/tabs.ui.ts

import * as React from "react";
import "./tabs.ui.css";

// Base interface for shared props
interface BaseProps {
  children: React.ReactNode;
  className?: string;
}

// Props for the main Tabs component
interface TabsProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

// Props for the TabsList component
interface TabsListProps extends BaseProps {}

// Props for the TabsTrigger component
interface TabsTriggerProps extends BaseProps {
  value: string;
  isSelected?: boolean;
  onSelect?: (value: string) => void;
}

// Props for the TabsContent component
interface TabsContentProps extends BaseProps {
  value: string;
}

// Internal props for handling state
interface InternalTabsProps {
  selectedValue?: string;
  onValueChange?: (value: string) => void;
}

// Main Tabs component
const Tabs: React.FC<TabsProps> & {
  List: React.FC<TabsListProps & InternalTabsProps>;
  Trigger: React.FC<TabsTriggerProps & { isSelected?: boolean; onSelect?: (value: string) => void }>;
  Content: React.FC<TabsContentProps & InternalTabsProps>;
} = ({ children, value, defaultValue, onValueChange, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <div className={`tabs-container ${className || ""}`}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              ...child.props,
              selectedValue,
              onValueChange: handleValueChange,
            })
          : null
      )}
    </div>
  );
};

// TabsList component
const TabsList: React.FC<TabsListProps & InternalTabsProps> = ({
  children,
  className,
  selectedValue,
  onValueChange,
}) => (
  <div className={`tabs-list ${className || ""}`}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            ...child.props,
            isSelected: child.props.value === selectedValue,
            onSelect: onValueChange,
          })
        : null
    )}
  </div>
);

// TabsTrigger component
const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  value,
  className,
  isSelected,
  onSelect,
}) => (
  <button
    className={`tabs-trigger ${isSelected ? "tabs-trigger--active" : ""} ${className || ""}`}
    onClick={() => onSelect?.(value)}
  >
    {children}
  </button>
);

// TabsContent component
const TabsContent: React.FC<TabsContentProps & InternalTabsProps> = ({
  children,
  value,
  className,
  selectedValue,
}) => (value !== selectedValue ? null : <div className={`tabs-content ${className || ""}`}>{children}</div>);

// Attach subcomponents to the main Tabs component
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs };
