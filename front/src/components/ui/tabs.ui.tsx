// ./front/src/components/ui/tabs.ui.tsx
import * as React from "react";

// Simple utility function to combine class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Tabs component to manage the state of active tab
const Tabs = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child, {
            activeTab,
            setActiveTab,
          });
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return React.cloneElement(child, {
            activeTab,
            index,
          });
        }
        return child;
      })}
    </div>
  );
};

// TabsList component to render the list of tabs
const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: number, setActiveTab: (index: number) => void }) => {
  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: activeTab === index,
            onClick: () => setActiveTab(index),
          });
        }
        return child;
      })}
    </div>
  );
};

// TabsTrigger component to render individual tab triggers
const TabsTrigger = ({ children, isActive, onClick }: { children: React.ReactNode, isActive: boolean, onClick: () => void }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow" : ""
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// TabsContent component to render the content of the active tab
const TabsContent = ({ children, activeTab, index }: { children: React.ReactNode, activeTab: number, index: number }) => {
  if (activeTab !== index) {
    return null;
  }
  return (
    <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
