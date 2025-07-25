// File: front/src/components/hauler/fleet/modules/FleetMapModule.tsx
import React from "react";

interface FleetMapModuleProps {
  latitude?: number;
  longitude?: number;
}

export const FleetMapModule: React.FC<FleetMapModuleProps> = ({
  latitude,
  longitude,
}) => (
  <div className="fleet-module fleet-module-map">
    {latitude != null && longitude != null ? (
      <iframe
        title="Vehicle Location"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        /* 100 % šírka, rozumná výška 180 px */
        width="100%"
        height="180"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    ) : (
      <div className="map-placeholder">No location</div>
    )}
  </div>
);
