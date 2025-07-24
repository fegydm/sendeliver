// File: src/shared/components/connectors/shared.lvehicle-lconnector.comp.tsx
import React from "react";
import PhotoCard from "@/components/shared/elements/PhotoCard";
import type { Vehicle } from "@/data/mockFleet";

interface VehicleConnectorProps {
  vehicle?: Vehicle;
  editable?: boolean;
  onUpload?: (file: File) => void;
  size?: number;
  className?: string;
}

const placeholders: Record<string, string> = {
  van:     "/vehicles/types/hght200-van.webp",
  lorry:   "/vehicles/types/hght200-lorry.webp",
  rigid:   "/vehicles/types/hght200-rigid.webp",
  truck:   "/vehicles/types/hght200-truck.webp",
  tractor: "/vehicles/types/hght200-truck.webp",
  trailer: "/vehicles/types/hght200-truck.webp",
};

const ghost = "/vehicles/placeholder.jpg";

const VehicleConnector: React.FC<VehicleConnectorProps> = ({
  vehicle,
  editable = false,
  onUpload,
  size = 140,
  className = "",
}) => {
  if (!vehicle) return null;

  // vyber finálny zdroj obrázka (foto → typ → ghost)
  const typePlaceholder = placeholders[vehicle.type] ?? ghost;
  const imageSrc = vehicle.image || typePlaceholder;

  return (
    <div className={`connector connector--vehicle ${className}`}>
      <PhotoCard
        src={imageSrc}
        alt={vehicle.name}
        shape="square"
        size={size}
        fallbackSrc={ghost}        /* keď sa nepodarí načítať ani placeholder, padne na ghost */
        uploadable={editable}
        onUpload={onUpload}
        className="connector__photo-card"
      />
      <span className="connector__label">{vehicle.plateNumber}</span>
    </div>
  );
};

export default VehicleConnector;
