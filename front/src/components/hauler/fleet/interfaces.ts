// File: front/src/components/hauler/fleet/interfaces.ts
import React from "react";

export interface FleetModuleConfig {
  key: string;
  label?: string;
  component: React.ReactNode;
  visible: boolean;
}
