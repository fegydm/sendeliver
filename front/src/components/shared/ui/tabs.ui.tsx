// File: src/components/ui/tabs.ui.ts
// Last change: Fixed tab highlighting when changing active tab

import * as React from "react";

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
  role?: "sender" | "hauler"; // Custom prop for role-based styling
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
  Trigger: React.FC<TabsTriggerProps>;
  Content: React.FC<TabsContentProps & InternalTabsProps>;
} = ({ children, value, defaultValue, onValueChange, className }) => {
  // Manage the selected tab state if no external value is provided.
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    // Update internal state if no external handler
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [onValueChange]);

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

// TabsList component casts each child to a React element with TabsTriggerProps,
// so that we can add custom properties like isSelected and onSelect.
const TabsList: React.FC<TabsListProps & InternalTabsProps> = ({
  children,
  className,
  selectedValue,
  onValueChange,
}) => {
  return (
    <div className={`tabs-list ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const trigger = child as React.ReactElement<TabsTriggerProps>;
          return React.cloneElement(trigger, {
            ...trigger.props,
            isSelected: trigger.props.value === selectedValue,
            onSelect: onValueChange,
          });
        }
        return null;
      })}
    </div>
  );
};

// TabsTrigger component with role support.
const TabsTrigger: React.FC<TabsTriggerProps> = ({
  children,
  value,
  className,
  isSelected,
  onSelect,
  role,
}) => {
  const classes = ["tabs-trigger"];
  if (isSelected) {
    classes.push("tabs-trigger--active");
  }
  if (role) {
    classes.push(`tabs-trigger--${role}`);
  }
  if (className) {
    classes.push(className);
  }
  
  const handleClick = React.useCallback(() => {
    if (onSelect) {
      onSelect(value);
    }
  }, [onSelect, value]);

  return (
    <button
      className={classes.join(" ")}
      onClick={handleClick}
      type="button"
      aria-selected={isSelected}
    >
      {children}
    </button>
  );
};

// TabsContent component renders content only if its value matches the selected value.
const TabsContent: React.FC<TabsContentProps & InternalTabsProps> = ({
  children,
  value,
  className,
  selectedValue,
}) =>
  value === selectedValue ? (
    <div className={`tabs-content ${className || ""}`}>{children}</div>
  ) : null;

// Attach subcomponents to the main Tabs component.
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs };

/*
English Comments:
- Fixed tab selection by ensuring internal state updates correctly
- Added useCallback to prevent unnecessary re-renders
- Added aria-selected attribute for accessibility
- Made sure value comparison uses strict equality
- Made handler logic more robust when state is controlled or uncontrolled
*/