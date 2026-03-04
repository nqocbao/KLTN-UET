// Recently Viewed - localStorage utility for tracking viewed items
// Stores last 20 recently viewed items

export interface RecentlyViewedItem {
  id: string;
  type: "tour" | "hotel" | "flight" | "destination";
  name: string;
  image?: string;
  location?: string;
  price?: number;
  rating?: number;
  url: string;
  viewedAt: string;
}

const STORAGE_KEY = "vivutravel_recently_viewed";
const MAX_ITEMS = 20;

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const items = getRecentlyViewed();
    // Remove duplicate if exists
    const filtered = items.filter((i) => !(i.id === item.id && i.type === item.type));
    // Add new item at the beginning
    const updated = [
      { ...item, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save recently viewed:", e);
  }
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
