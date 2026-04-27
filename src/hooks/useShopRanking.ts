import { useMemo } from "react";
import type { Shop, SortMode } from "@/data/types";
import { PARTS } from "@/data/parts";
import { haversineKm } from "@/lib/geo";

export interface RankedShop {
  shop: Shop;
  distanceKm: number;
  partInStock: boolean;
  partPrice: number | null;
  partStock: number;
  score: number;
}

interface Args {
  shops: Shop[];
  userPos: [number, number];
  activePartId: string | null;
  mode: SortMode;
  inStockOnly: boolean;
  category: string | null;
  searchTerm: string;
}

export function useShopRanking({
  shops, userPos, activePartId, mode, inStockOnly, category, searchTerm,
}: Args): RankedShop[] {
  return useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const enriched: RankedShop[] = shops.map((shop) => {
      const distanceKm = haversineKm(userPos, [shop.lat, shop.lng]);
      let partInStock = false;
      let partPrice: number | null = null;
      let partStock = 0;
      if (activePartId) {
        const inv = shop.inventory.find((i) => i.partId === activePartId);
        if (inv) {
          partInStock = inv.stock > 0;
          partPrice = inv.price;
          partStock = inv.stock;
        }
      }
      
      let score = distanceKm;
      if (mode === "nearest") {
        score = distanceKm;
      } else if (mode === "top-rated") {
        score = (5 - shop.rating) * 10 + distanceKm * 0.1;
      } else if (mode === "best-deal") {
        const priceComponent = partPrice ? partPrice / 1000 : 0;
        score = priceComponent * 0.6 + distanceKm * 0.4 + (5 - shop.rating) * 0.3;
      }
      
      if (activePartId && !partInStock) score += 1000;

      return { shop, distanceKm, partInStock, partPrice, partStock, score };
    });

    return enriched.filter((r) => {
      if (inStockOnly && activePartId && !r.partInStock) return false;
      
      if (category) {
        const carriesCategory = r.shop.inventory.some((inv) => {
          if (inv.stock <= 0) return false;
          const part = PARTS.find((p) => p.id === inv.partId);
          return part?.category === category;
        });
        if (!carriesCategory) return false;
      }
      
      if (!activePartId && term) {
        const hay = `${r.shop.name} ${r.shop.address}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    }).sort((a, b) => a.score - b.score);
  }, [shops, userPos, activePartId, mode, inStockOnly, category, searchTerm]);
}
