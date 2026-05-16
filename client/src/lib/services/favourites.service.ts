import { apiClient } from "@/lib/api-client";

export type FavouriteType =
  | "hotel"
  | "tour"
  | "restaurant"
  | "destination"
  | "transport"
  | "airline";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

export const isMongoObjectId = (id: unknown): id is string =>
  typeof id === "string" && OBJECT_ID_RE.test(id);

export interface FavouriteItem {
  _id: string;
  user_id: string;
  hotel_id?: any;
  restaurant_id?: any;
  transport_id?: any;
  airline_id?: any;
  destination_id?: any;
  tour_id?: any;
  createdAt: string;
  updatedAt: string;
}

interface ApiOk<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const favouritesApi = {
  list: () => apiClient.get<ApiOk<FavouriteItem[]>>("/client/favourites"),

  check: (type: FavouriteType, item_id: string) =>
    apiClient.get<ApiOk<{ favourited: boolean; id: string | null }>>(
      `/client/favourites/check?type=${encodeURIComponent(type)}&item_id=${encodeURIComponent(item_id)}`
    ),

  add: (type: FavouriteType, item_id: string) =>
    apiClient.post<ApiOk<FavouriteItem>>("/client/favourites", { type, item_id }),

  remove: (type: FavouriteType, item_id: string) =>
    apiClient.delete<ApiOk<null>>(
      `/client/favourites?type=${encodeURIComponent(type)}&item_id=${encodeURIComponent(item_id)}`
    ),
};
