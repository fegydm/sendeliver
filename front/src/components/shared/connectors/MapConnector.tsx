// File: front/src/components/shared/connectors/MapConnector.tsx
// Displays an embedded map pinpointing vehicle location.
// BEM block: `connector connector--map`.

import React from "react";

interface MapConnectorProps {
  latitude?: number;
  longitude?: number;
  /** optional class */
  className?: string;
  /** iframe height in px (default 180) */
  height?: number;
}

export const MapConnector: React.FC<MapConnectorProps> = ({
  latitude,
  longitude,
  className = "",
  height = 180,
}) => (
  <div className={`connector connector--map ${className}`.trim()}>
    {latitude != null && longitude != null ? (
      <iframe
        title="Vehicle Location"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    ) : (
      <div className="connector__map-placeholder">No location</div>
    )}
  </div>
);

export default MapConnector;
