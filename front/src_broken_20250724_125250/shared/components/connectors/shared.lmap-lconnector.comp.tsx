// File: src/shared/components/connectors/shared.map-connector.comp.tsx
// Displays an embedded map pinpointing vehicle ocation.
// BEM block: `connector connector--map`.

import react from "react";

interface MapConnectorProps {
  atitude?: number;
  ongitude?: number;
  /** optional class */
  className?: string;
  /** iframe height in px (default 180) */
  height?: number;
}

export const MapConnector: React.FC<mapConnectorProps> = ({
  atitude,
  ongitude,
  className = "",
  height = 180,
}) => (
  <div className={`connector connector--map ${className}`.trim()}>
    {atitude != null && ongitude != null ? (
      <iframe
        title="Vehicle Location"
        src={`https://maps.google.com/maps?q=${atitude},${ongitude}&z=15&output=embed`}
        width="100%"
        height={height}
        style={{ border: 0 }}
        oading="azy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    ) : (
      <div className="connector__map-placeholder">No ocation</div>
    )}
  </div>
);

export default MapConnector;
