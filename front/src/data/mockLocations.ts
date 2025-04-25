// File: ./front/src/data/mockLocations.ts
// Last change: Initial mock locations data for logbook component

export interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    type: "pickup" | "delivery" | "depot" | "rest";
  }
  
  export const mockLocations: Location[] = [
    {
      id: "location1",
      name: "Hlavný sklad Bratislava",
      address: "Skladová 123",
      city: "Bratislava",
      country: "SK",
      type: "pickup"
    },
    {
      id: "location2",
      name: "Distribučné centrum Trnava",
      address: "Priemyselná 45",
      city: "Trnava",
      country: "SK",
      type: "delivery"
    },
    {
      id: "location3",
      name: "Obchodné centrum Košice",
      address: "Obchodná 78",
      city: "Košice",
      country: "SK",
      type: "delivery"
    },
    {
      id: "location4",
      name: "Výrobný závod Žilina",
      address: "Továrenská 15",
      city: "Žilina",
      country: "SK",
      type: "pickup"
    },
    {
      id: "location5",
      name: "Centrálny sklad Wien",
      address: "Lagerstraße 56",
      city: "Wien",
      country: "AT",
      type: "delivery"
    },
    {
      id: "location6",
      name: "Showroom Praha",
      address: "Showroomová 89",
      city: "Praha",
      country: "CZ",
      type: "delivery"
    },
    {
      id: "location7",
      name: "Odpočívadlo Trstín",
      address: "Diaľnica D1, km 67",
      city: "Trstín",
      country: "SK",
      type: "rest"
    },
    {
      id: "location8",
      name: "Centrála SenDeliver",
      address: "Logistická 1",
      city: "Bratislava",
      country: "SK",
      type: "depot"
    }
  ];
  
  export default mockLocations;