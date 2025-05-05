// File: front/src/components/hauler/fleet/modules/FleetDriverModule.tsx
import React from "react";
import { PhotoModule } from "@/components/shared/modules/PhotoModule";
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
    <PhotoModule
      src={driver?.image ?? "/people/placeholder.jpg"}
      alt={driver ? `${driver.firstName} ${driver.lastName}` : "No driver"}
      mask="circle"
      fallbackSrc="/people/placeholder.jpg"
    />

    {/* Name & surname */}
    <div className="driver-name">
      {driver ? `${driver.firstName} ${driver.lastName}` : "–"}
    </div>
  </div>
);
