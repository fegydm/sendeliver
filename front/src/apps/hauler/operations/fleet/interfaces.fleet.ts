// File: front/src/apps/hauler/operations/fleet/interfaces.fleet.ts
// Purpose: Unified types for the fleet section – updated terminology
//          "Connector" replaces the old "Module" naming.

import React from "react";

export interface ConnectorConfig {
  /** unique id within the connectors list */
  key: string;
  /** optional label shown in UI (toolbar toggles, tooltips) */
  label?: string;
  /** React element representing the connector widget */
  component: React.ReactNode;
  /** visibility flag controlled by user */
  visible: boolean;
}
