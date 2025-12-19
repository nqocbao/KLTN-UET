/**
 * Central API Services Export
 * Import all API services from here
 */

export { authApi } from "./auth.service";
export { usersApi } from "./users.service";
export { toursApi } from "./tours.service";
export { destinationsApi } from "./destinations.service";
export { hotelsApi } from "./hotels.service";
export { restaurantsApi } from "./restaurants.service";
export {
  countriesApi,
  provincesApi,
  districtsApi,
  wardsApi,
} from "./locations.service";
export {
  airlinesApi,
  transportsApi,
  partnersApi,
  guidesApi,
  reviewsApi,
  rolesApi,
  permissionsApi,
  conversationsApi,
  addressesApi,
} from "./other.service";

// Export types
export type {
  Airline,
  Transport,
  Partner,
  Guide,
  Review,
  Role,
  Permission,
  Conversation,
  Address,
} from "./other.service";
