import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Part, Shop } from "@/data/types";

export interface CartLine {
  id: string;             // `${shopId}:${partId}`
  shopId: string;
  shopName: string;
  partId: string;
  partName: string;
  brand: string;
  unitPrice: number;
  qty: number;
  maxStock: number;
}

interface CartContextValue {
  lines: CartLine[];
  totalItems: number;
  subtotal: number;
  add: (args: { shop: Shop; part: Part; unitPrice: number; maxStock: number; qty?: number }) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sparepulse:cart:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines]);

  const add: CartContextValue["add"] = useCallback(({ shop, part, unitPrice, maxStock, qty = 1 }) => {
    setLines((prev) => {
      const id = `${shop.id}:${part.id}`;
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) =>
          l.id === id ? { ...l, qty: Math.min(maxStock, l.qty + qty) } : l,
        );
      }
      return [
        ...prev,
        {
          id, shopId: shop.id, shopName: shop.name,
          partId: part.id, partName: part.name, brand: part.brand,
          unitPrice, qty: Math.min(maxStock, qty), maxStock,
        },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((lineId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === lineId ? { ...l, qty: Math.max(0, Math.min(l.maxStock, qty)) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalItems = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0), [lines]);

  const value: CartContextValue = {
    lines, totalItems, subtotal, add, setQty, remove, clear, isOpen, setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
