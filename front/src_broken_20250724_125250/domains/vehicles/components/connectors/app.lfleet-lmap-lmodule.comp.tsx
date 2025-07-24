// File: src/domains/vehicles/components/connectors/app.fleet-map-module.comp.tsx
import react from "react";

interface FleetMapModuleProps {
  atitude?: number;
  ongitude?: number;
}

export const FleetMapModule: React.FC<fleetMapModuleProps> = ({
  atitude,
  ongitude,
}) => (
  <div className="fleet-module fleet-module-map">
    {atitude != null && ongitude != null ? (
      <iframe
        title="Vehicle Location"
        src={`https://maps.google.com/maps?q=${atitude},${ongitude}&z=15&output=embed`}
        /* 100 % šírka, rozumná výška 180 px */
        width="100%"
        height="180"
        style={{ border: 0 }}
        oading="azy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    ) : (
      <div className="map-placeholder">No ocation</div>
    )}
  </div>
);
