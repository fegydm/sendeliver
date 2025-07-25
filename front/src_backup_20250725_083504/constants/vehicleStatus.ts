// File: front/src/constants/vehicleStatus.ts
// Single source of truth for Fleet vehicle status values, labels and colors.

/* ------------------------------------------------------------------
   Allowed status codes (keep in sync with DB enum when introduced)
-------------------------------------------------------------------*/
/** Dostupné statusy vozidiel – poradie použijeme aj v grafoch a tabuľke. */
export const STATUS_ORDER = [
    "outbound",
    "transit",
    "inbound",
    "standby",
    "depot",
    "maintenance",
  ] as const;
  
  /** Typ – odvodený priamo z poľa, nehrozí preklep. */
  export type VehicleStatus = (typeof STATUS_ORDER)[number];
  
  /** Krátke UI lably (môžeš neskôr lokalizovať). */
  export const statusLabels: Record<VehicleStatus, string> = {
    outbound:    "Outbound",
    transit:     "Transit",
    inbound:     "Inbound",
    standby:     "Stand-by",
    depot:       "Depot",
    maintenance: "Maintenance",
  };
  
  /** HEX farby (napojené aj v CSS, ale hodí sa pre grafy, PDF a pod.). */
  export const statusHex: Record<VehicleStatus, string> = {
    outbound:    "#2389ff", // azure
    transit:     "#7a63ff", // indigo
    inbound:     "#1fbac7", // turquoise
    standby:     "#b5bd00", // khaki
    depot:       "#6b7684", // steel grey
    maintenance: "#d726ff", // magenta
  };
  