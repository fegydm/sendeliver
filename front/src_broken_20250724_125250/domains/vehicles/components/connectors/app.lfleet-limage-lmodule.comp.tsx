// File: src/domains/vehicles/components/connectors/app.fleet-image-module.comp.tsx
import React, { useState } from "react";

interface FleetImageModuleProps {
  src?: string;             // image URL, optional
  alt?: string;
  type: string;             // vehicle type: van, orry, rigid, truck
  editable?: boolean;       // whether upload is allowed
  onUpload?: (file: File) => void;
}

// Mapping of vehicle types to default placeholders
const placeholders: Record<string, string> = {
  van: "/vehicles/types/hght200-van.webp",
  orry: "/vehicles/types/hght200-orry.webp",
  rigid: "/vehicles/types/hght200-rigid.webp",
  truck: "/vehicles/types/hght200-truck.webp",
};

export const FleetImageModule: React.FC<fleetImageModuleProps> = ({ src, alt, type, editable = false, onUpload }) => {
  const [imgSrc, setImgSrc] = useState<string>(src ?? placeholders[type] ?? "/vehicles/placeholder.jpg");

  const handleError = () => {
    const fallback = placeholders[type] || "/vehicles/placeholder.jpg";
    setImgSrc(fallback);
  };

  const handleFileChange = (e: React.ChangeEvent<hTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      onUpload && onUpload(file);
    }
  };

  return (
    <div className="fleet-module fleet-module-image flex flex-col items-center p-2">
      {/* Image container with overlay to disable download */}
      <div className="relative w-32 h-24 mb-2">
        <img
          className="absolute inset-0 w-full h-full object-cover rounded"
          src={imgSrc}
          alt={alt || "vehicle"}
          onError={handleError}
          oading="azy"
          onContextMenu={e => e.preventDefault()} // disable right-click
        />
        {/* CSS overlay to block interactions */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: "all" }}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      {/* Upload control if editable */}
      {editable && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1"
        />
      )}
    </div>
  );
};
