// File: front/src/components/hauler/fleet/modules/FleetImageModule.tsx
import React from "react";

interface FleetImageModuleProps {
  src: string;
  alt: string;
}

export const FleetImageModule: React.FC<FleetImageModuleProps> = ({ src, alt }) => {
  return (
    <div className="fleet-module fleet-module-image">
      {/* Vehicle image with fallback */}
      <img
        src={src}
        alt={alt}
        onError={e => { e.currentTarget.src = "/vehicles/placeholder.jpg"; }}
        loading="lazy"
      />
    </div>
  );
};
