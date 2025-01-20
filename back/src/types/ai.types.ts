// File: src/types/ai.types.ts
// Last change: Enhanced AIRequest and AIResponse types with flexibility for logistics data

export interface AIRequest {
  /**
   * The message or query sent to the AI.
   */
  message: string;

  /**
   * Type of request specifying the purpose or context.
   * - `sender`: Request from a sender of goods.
   * - `hauler`: Request from a hauler looking for transport jobs.
   * - `coordinates`: Request to retrieve GPS coordinates.
   */
  type: "sender" | "hauler" | "chat" | "coordinates";

  /**
   * Language of the AI response (default is English).
   */
  lang1?: string;

  /**
   * Temperature parameter for controlling randomness in AI responses.
   * Lower values make the output more deterministic.
   */
  temperature?: number;
}

export interface Coordinates {
  /**
   * Latitude coordinate.
   */
  lat: number;

  /**
   * Longitude coordinate.
   */
  lng: number;
}

export interface AIResponse {
  /**
   * The raw content returned by AI, typically in string format.
   */
  content: string;

  /**
   * Structured data extracted from the AI response.
   * Optional because some responses may not have structured data.
   */
  data?: {
    /**
     * The city or location where goods are picked up.
     */
    pickupLocation?: string;

    /**
     * The city or location where goods are delivered.
     */
    deliveryLocation?: string;

    /**
     * Date and time for goods pickup.
     */
    pickupTime?: string;

    /**
     * Date and time for goods delivery.
     */
    deliveryTime?: string;

    /**
     * Weight of the cargo in a specific format (e.g., `500kg`).
     */
    weight?: string;

    /**
     * Quantity of items or pallets being transported.
     */
    quantity?: string;

    /**
     * Type of vehicle required for transport (e.g., `truck`, `van`).
     */
    vehicleType?: string;

    /**
     * Type of cargo being transported (e.g., `frozen goods`, `electronics`).
     */
    cargoType?: string;

    /**
     * Coordinates for the pickup or delivery locations.
     */
    coordinates?: Coordinates;
  };
}
