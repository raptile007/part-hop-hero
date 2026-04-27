import type { Shop } from "./types";
import { PARTS } from "./parts";

// City center: Coimbatore (matching the original CSV/iframe coords ~ 11.019, 76.848)
export const CITY_CENTER: [number, number] = [11.0168, 76.9558];

// Deterministic pseudo-random for stable inventory across reloads
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const SHOP_DEFS: Omit<Shop, "inventory">[] = [
  { id: "s-01", name: "RPM Motor Works",          lat: 11.0195661, lng: 76.8483614, address: "Saibaba Colony, Coimbatore", phone: "+91 98765 11001", rating: 4.7, reviewCount: 312, openNow: true },
  { id: "s-02", name: "Speedline Spares",         lat: 11.0197305, lng: 76.8481896, address: "Saibaba Colony, Coimbatore", phone: "+91 98765 11002", rating: 4.3, reviewCount: 184, openNow: true },
  { id: "s-03", name: "Krishna Auto Parts",       lat: 11.0094000, lng: 76.9550000, address: "Race Course Road, Coimbatore", phone: "+91 98765 11003", rating: 4.5, reviewCount: 421, openNow: true },
  { id: "s-04", name: "Two-Wheeler Hub",          lat: 11.0250000, lng: 76.9700000, address: "RS Puram, Coimbatore", phone: "+91 98765 11004", rating: 4.1, reviewCount: 96, openNow: false },
  { id: "s-05", name: "Pitstop Garage Store",     lat: 11.0420000, lng: 76.9360000, address: "Peelamedu, Coimbatore", phone: "+91 98765 11005", rating: 4.8, reviewCount: 540, openNow: true },
  { id: "s-06", name: "Bullet Bro Spares",        lat: 11.0050000, lng: 76.9650000, address: "Town Hall, Coimbatore", phone: "+91 98765 11006", rating: 4.6, reviewCount: 277, openNow: true },
  { id: "s-07", name: "Velocity Motors",          lat: 10.9930000, lng: 76.9420000, address: "Singanallur, Coimbatore", phone: "+91 98765 11007", rating: 3.9, reviewCount: 58, openNow: true },
  { id: "s-08", name: "Apex Bike Parts",          lat: 11.0610000, lng: 76.9300000, address: "Saravanampatti, Coimbatore", phone: "+91 98765 11008", rating: 4.4, reviewCount: 203, openNow: true },
  { id: "s-09", name: "Torque & Trail",           lat: 11.0130000, lng: 76.9870000, address: "Ondipudur, Coimbatore", phone: "+91 98765 11009", rating: 4.2, reviewCount: 142, openNow: false },
  { id: "s-10", name: "Roadster Spare Center",    lat: 11.0345000, lng: 76.9100000, address: "Vadavalli, Coimbatore", phone: "+91 98765 11010", rating: 4.0, reviewCount: 78, openNow: true },
  { id: "s-11", name: "Octane Garage Mart",       lat: 11.0760000, lng: 77.0060000, address: "Karamadai Road, Coimbatore", phone: "+91 98765 11011", rating: 4.6, reviewCount: 311, openNow: true },
  { id: "s-12", name: "Gearhead Workshop",        lat: 10.9810000, lng: 76.9150000, address: "Kovaipudur, Coimbatore", phone: "+91 98765 11012", rating: 4.3, reviewCount: 165, openNow: true },
];

const BASE_PRICES: Record<string, number> = {
  "p-brake-pad-front": 1200, "p-brake-disc-300": 4500, "p-brake-fluid-dot4": 380,
  "p-chain-525": 3200, "p-sprocket-rear": 1800, "p-clutch-cable": 320,
  "p-tire-mrf-100": 2200, "p-tire-mich-150": 5800, "p-tube-17": 280,
  "p-spoke-set": 950, "p-bearing-6203": 220, "p-fork-oil": 690,
  "p-rear-shock": 4200, "p-spark-plug": 480, "p-battery-12v": 2900,
  "p-led-headlight": 850, "p-engine-oil-10w40": 720, "p-chain-lube": 450,
  "p-mirror-set": 3800, "p-grip-set": 620,
};

export const SHOPS: Shop[] = SHOP_DEFS.map((s, idx) => {
  const rand = rng(idx + 1);
  const inventory = PARTS.map((p) => {
    const inStock = rand() > 0.28; // ~72% chance the shop carries it
    const stock = inStock ? Math.floor(rand() * 12) + 1 : 0;
    const variance = 0.85 + rand() * 0.35; // ±15-20% pricing variance per shop
    const base = BASE_PRICES[p.id] ?? 500;
    const price = Math.round(base * variance);
    return {
      partId: p.id,
      stock,
      price,
      updatedAt: new Date(Date.now() - Math.floor(rand() * 86400000)).toISOString(),
    };
  });
  return { ...s, inventory };
});
