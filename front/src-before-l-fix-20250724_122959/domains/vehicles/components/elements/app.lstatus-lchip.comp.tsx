// File: src/domains/vehicles/components/elements/app.lstatus-lchip.comp.tsx
// Last change: Created reusable status chip component 

import react from "react";

interface StatusChipProps {
  status: string;
}

/**
 * Komponent pre zobrazenie stavového indikátora
 */
const StatusChip: React.FC<statusChipProps> = ({ status }) => {
  const getStatusClass = () => {
    switch(status?.toLowerCase() || '') {
      case "dostupné":
      case "available":
      case "aktívny":
      case "active":
        return "available";
      
      case "na trase":
      case "on route":
      case "route":
        return "route";
      
      case "servis":
      case "údržba":
      case "service":
        return "service";
      
      case "parkovisko":
      case "neaktívny":
      case "inactive":
      case "parking":
        return "inactive";
        
      default:
        return "";
    }
  };

  return (
    <span className={`status-chip ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default StatusChip;