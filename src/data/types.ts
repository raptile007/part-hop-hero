export type PartCategory =
  | "brakes"
  | "drivetrain"
  | "tires"
  | "wheels"
  | "suspension"
  | "electrical"
  | "lubricants"
  | "accessories";

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  brand: string;
  fitsBikes: string[]; // e.g. ["Royal Enfield Classic 350", "Bajaj Pulsar 150"]
}

export interface InventoryItem {
  partId: string;
  stock: number;          // 0 = out of stock
  price: number;          // INR
  updatedAt: string;      // ISO
}

export interface Shop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;       // 0..5
  reviewCount: number;
  openNow: boolean;
  inventory: InventoryItem[];
}

export type SortMode = "best-deal" | "nearest" | "top-rated";
