export interface RoomConfiguration {
  typeA: number; // 2 Single beds (2 adults, 2 children)
  typeB: number; // 1 Single + 1 Double (3 adults, 3 children)
}

export interface HotelPricing {
  priceTwoSingleBed: number;
  priceOneSingleOneDoubleBed: number;
}

/**
 * Calculates the optimal room configuration based on number of adults.
 * Rules:
 * - Room Type A (2 Single): Capacity 2 Adults.
 * - Room Type B (1 Single + 1 Double): Capacity 3 Adults.
 * - Strategy: Minimize number of rooms, then minimize capacity waste (fit tightest).
 */
export function calculateRoomConfiguration(adults: number): RoomConfiguration {
  if (adults <= 0) return { typeA: 0, typeB: 0 };

  // Min rooms needed (assuming max capacity 3 per room)
  const numRooms = Math.ceil(adults / 3);

  // We need to find x (TypeA) + y (TypeB) = numRooms
  // Such that 2x + 3y >= adults
  // And minimize capacity (2x + 3y) - adults
  
  // We iterate y (number of Type B rooms) from 0 to numRooms
  // x = numRooms - y
  // Check if valid.
  // Pick the one with smallest capacity.
  
  let bestConfig: RoomConfiguration | null = null;
  let minWaste = Infinity;

  // Prefer fewer Type B rooms if possible to save cost? 
  // User example: 4 pax -> 2 rooms 2 single beds (2 Type A).
  // 4 pax: 2 rooms.
  // Try y=0 (0 B, 2 A) -> Cap 4. Fits. Waste 0. -> Winner.
  
  for (let y = 0; y <= numRooms; y++) {
    const x = numRooms - y;
    const capacity = x * 2 + y * 3;
    if (capacity >= adults) {
      const waste = capacity - adults;
      if (waste < minWaste) {
        minWaste = waste;
        bestConfig = { typeA: x, typeB: y };
      }
    }
  }

  return bestConfig || { typeA: numRooms, typeB: 0 }; // Fallback
}

export function calculateTotalRooms(adults: number, children: number = 0): number {
  // Config based on adults
  const config = calculateRoomConfiguration(adults);
  let totalRooms = config.typeA + config.typeB;
  
  // Check children
  // Capacity: A=2, B=3.
  const capacityChildren = config.typeA * 2 + config.typeB * 3;
  
  if (children > capacityChildren) {
    // If children exceed capacity, we need more rooms.
    // This is edge case not fully defined by user.
    // Simple heuristic: Add rooms until children fit.
    // Assuming we add Type A rooms for extra children? 
    // Or just increase count.
    const extraChildren = children - capacityChildren;
    const extraRooms = Math.ceil(extraChildren / 2); // Assume 2 children per extra room
    totalRooms += extraRooms;
  }
  
  return totalRooms;
}

export function calculateTotalPrice(adults: number, prices: HotelPricing): number {
  const config = calculateRoomConfiguration(adults);
  return (config.typeA * prices.priceTwoSingleBed) + (config.typeB * prices.priceOneSingleOneDoubleBed);
}
