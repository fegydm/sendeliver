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

const Tabs: React.FC<TabsProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
}) => {
  // Internal state for uncontrolled usage
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  // Determine which value to use (controlled vs uncontrolled)
  const selectedValue = value ?? internalValue;
  const handleValueChange = onValueChange ?? setInternalValue;

  return (
    <div className={`tabs-container ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        return React.cloneElement(child, {
          ...child.props,
          selectedValue,
          onValueChange: handleValueChange,
        });
      })}
    </div>
  );
};

const TabsList: React.FC<TabsListProps & InternalTabsProps> = ({
  children,
  className,
  selectedValue,
  onValueChange,
}) => {
  return (
    <div className={`tabs-list ${className || ""}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        return React.cloneElement(child, {
          ...child.props,
          isSelected: child.props.value === selectedValue,
          onSelect: onValueChange,
        });
      })}
    </div>
  );
};

const TabsTrigger: React.FC<
  TabsTriggerProps & {
    isSelected?: boolean;
    onSelect?: (value: string) => void;
  }
> = ({ children, value, className, isSelected, onSelect }) => {
  return (
    <button
      className={`tabs-trigger ${isSelected ? "tabs-trigger--active" : ""} ${className || ""}`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps & InternalTabsProps> = ({
  children,
  value,
  className,
  selectedValue,
}) => {
  if (value !== selectedValue) return null;

  return <div className={`tabs-content ${className || ""}`}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
