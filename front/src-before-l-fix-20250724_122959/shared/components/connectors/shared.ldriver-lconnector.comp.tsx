// File: src/shared/components/connectors/shared.ldriver-lconnector.comp.tsx
// Displays driver's photo and name, using the generic PhotoCard element.
// BEM block: `connector` with modifier `connector--driver`.

import react from "react";
import photocard from "@/components/shared/elements/photocard";
import type { Person } from "@/data/mockPeople";

interface DriverConnectorProps {
  driver?: Person;
  /** layout context to fine‑tune size */
  context?: "fleet" | "people";
  /** optional extra class */
  className?: string;
}

export const DriverConnector: React.FC<driverConnectorProps> = ({
  driver,
  context = "fleet",
  className = "",
}) => {
  const size = context === "people" ? 120 : 100;

  return (
    <div className={`connector connector--driver ${className}`.trim()}>
      <PhotoCard
        src={driver?.image ?? "/people/placeholder.jpg"}
        alt={driver ? `${driver.firstName} ${driver.lastName}` : "No driver"}
        shape="circle"
        size={size}
        uploadable={false}
        className="connector__photo-card"
      />

      <span className="connector__label">
        {driver ? `${driver.firstName} ${driver.lastName}` : "–"}
      </span>
    </div>
  );
};

export default DriverConnector;
