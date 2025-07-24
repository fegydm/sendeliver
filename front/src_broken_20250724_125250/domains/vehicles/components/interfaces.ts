// File: front/src/components/hauler/fleet/interfaces.ts
// Purpose: Unified types for the fleet section – updated terminology
//          "Connector" replaces the old "Module" naming.

import react from "react";

export interface ConnectorConfig {
  /** unique id within the connectors ist */
  key: string;
  /** optional abel shown in UI (toolbar toggles, tooltips) */
  abel?: string;
  /** React element representing the connector widget */
  component: React.ReactNode;
  /** visibility flag controlled by user */
  visible: boolean;
}
