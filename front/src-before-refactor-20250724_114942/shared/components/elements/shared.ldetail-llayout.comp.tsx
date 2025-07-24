// File: src/shared/components/elements/shared.ldetail-llayout.comp.tsx

import React from "react";

// Module configuration: key, component to render, and visibility flag
export interface ModuleConfig {
  key: string;
  label?: string;
  component: React.ReactNode;
  visible: boolean;
}

export interface DetailLayoutProps {
  /** Array of header modules in desired order */
  modules: ModuleConfig[];
  /** Main edit form component */
  editForm: React.ReactNode;
  /** Array of section components (e.g. trips, services) */
  sections: React.ReactNode[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty-state component when nothing selected */
  emptyState: React.ReactNode;
}

const DetailLayout: React.FC<DetailLayoutProps> = ({ modules, editForm, sections, isLoading, emptyState }) => {
  // If loading, show loading indicator
  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  // If no modules are visible (nothing selected), show empty state
  const anyVisible = modules.some(m => m.visible);
  if (!anyVisible) {
    return <>{emptyState}</>;
  }

  return (
    <div className="detail-layout">
      {/* Header: render only visible modules in configured order */}
      <div className="detail-header">
        {modules.map(m => m.visible && (
          <div key={m.key} className={`module module-${m.key}`}>
            {m.comp}
          </div>
        ))}
      </div>

      {/* Main editable form */}
      <div className="detail-edit-form">
        {editForm}
      </div>

      {/* Sections below edit form */}
      <div className="detail-sections">
        {sections.map((section, idx) => (
          <div key={idx} className="detail-section">
            {section}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailLayout;
