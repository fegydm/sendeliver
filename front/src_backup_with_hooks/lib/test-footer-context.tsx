// File: ./front/src/lib/test-footer-context.tsx
// Last change: Added render tracking to prevent duplicate rendering

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface TestFooterContextType {
  isTestFooterVisible: boolean;
  setTestFooterVisible: (visible: boolean) => void;
  isRendered: boolean;
  setIsRendered: (rendered: boolean) => void;
}

const TestFooterContext = createContext<TestFooterContextType>({
  isTestFooterVisible: false,
  setTestFooterVisible: () => void 0,
  isRendered: false,
  setIsRendered: () => void 0
});

interface TestFooterProviderProps {
  children: ReactNode;
}

export const TestFooterProvider: React.FC<TestFooterProviderProps> = ({ children }) => {
  const [isTestFooterVisible, setTestFooterVisible] = useState<boolean>(
    process.env.NODE_ENV === "development"
  );
  const [isRendered, setIsRendered] = useState(false);

  return (
    <TestFooterContext.Provider 
      value={{ 
        isTestFooterVisible, 
        setTestFooterVisible,
        isRendered,
        setIsRendered
      }}
    >
      {children}
    </TestFooterContext.Provider>
  );
};

export const useTestFooter = (): TestFooterContextType => {
  const context = useContext(TestFooterContext);
  if (!context) {
    throw new Error('useTestFooter must be used within a TestFooterProvider');
  }
  return context;
};