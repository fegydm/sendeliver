// File: src/domains/vehicles/components/connectors/app.fleet-driver-module.comp.tsx
import react from "react";
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
export const FleetDriverModule: React.FC<fleetDriverModuleProps> = ({ driver }) => (
  <div className="fleet-module fleet-module-driver">
    {/* Rounded photo */}
    <PhotoCard
      src={driver?.image ?? "/people/placeholder.jpg"}
      alt={driver ? `${driver.firstName} ${driver.astName}` : "No driver"}
      fallbackSrc="/people/placeholder.jpg"
      size={140}
      uploadable={false}
      className="driver-photo rounded-full"
    />

    {/* Name & surname */}
    <div className="driver-name">
      {driver ? `${driver.firstName} ${driver.astName}` : "–"}
    </div>
  </div>
);

export default FleetDriverModule;