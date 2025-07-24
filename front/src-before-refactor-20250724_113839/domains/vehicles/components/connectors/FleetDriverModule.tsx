// File: front/src/components/hauler/fleet/modules/FleetDriverModule.tsx
import React from "react";
import { PhotoCard } from "@/components/shared/elements/PhotoCard";
import type { Person } from "@/data/mockPeople";

interface FleetDriverModuleProps {
  driver?: Person;
}

/**
 * FleetDriverModule
 *
 * - Uses the generic PhotoModule with circle mask.
 * - Shows driver's full name under the photo.
 */
export const FleetDriverModule: React.FC<FleetDriverModuleProps> = ({ driver }) => (
  <div className="fleet-module fleet-module-driver">
    {/* Rounded photo */}
    <PhotoCard
      src={driver?.image ?? "/people/placeholder.jpg"}
      alt={driver ? `${driver.firstName} ${driver.lastName}` : "No driver"}
      fallbackSrc="/people/placeholder.jpg"
      size={140}
      uploadable={false}
      className="driver-photo rounded-full"
    />

    {/* Name & surname */}
    <div className="driver-name">
      {driver ? `${driver.firstName} ${driver.lastName}` : "–"}
    </div>
  </div>
);

export default FleetDriverModule;