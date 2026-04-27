import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Star, MapPin, Phone, Package, CheckCircle2, XCircle, Navigation, ShoppingCart } from "lucide-react";
import type { RankedShop } from "@/hooks/useShopRanking";
import type { Part } from "@/data/types";
import { PARTS } from "@/data/parts";
import { CATEGORY_IMAGES } from "@/data/partImages";
import { formatKm } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ShopCardProps {
  rank: number;
  ranked: RankedShop;
  active: boolean;
  activePart: Part | null;
  onSelect: () => void;
  onHoverChange: (hover: boolean) => void;
}

export function ShopCard({ rank, ranked, active, activePart, onSelect, onHoverChange }: ShopCardProps) {
  const { shop, distanceKm, partInStock, partPrice, partStock } = ranked;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all duration-300 ease-power3",
        active
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border bg-card hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold",
            active
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
        >
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{shop.name}</h3>
            <span className="shrink-0 font-display text-xs font-semibold text-secondary">
              {formatKm(distanceKm)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {shop.rating.toFixed(1)}
              <span className="opacity-60">({shop.reviewCount})</span>
            </span>
            <span className={cn("flex items-center gap-1", shop.openNow ? "text-success" : "text-destructive")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", shop.openNow ? "bg-success" : "bg-destructive")} />
              {shop.openNow ? "Open" : "Closed"}
            </span>
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">{shop.address}</div>

          {activePart && (
            <div
              className={cn(
                "mt-3 flex items-center justify-between rounded-md border px-3 py-2",
                partInStock
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center gap-2 text-xs">
                {partInStock ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={partInStock ? "text-success" : "text-destructive"}>
                  {partInStock ? `${partStock} in stock` : "Out of stock"}
                </span>
              </div>
              {partInStock && partPrice !== null && (
                <span className="font-display text-sm font-semibold text-foreground">
                  ₹{partPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

interface DetailProps {
  ranked: RankedShop | null;
  activePart: Part | null;
  alternative: RankedShop | null;
  onPickAlternative: () => void;
  onClose: () => void;
}

export function ShopDetailPanel({ ranked, activePart, alternative, onPickAlternative, onClose }: DetailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastShopId = useRef<string | null>(null);

  useEffect(() => {
    if (!ranked || !ref.current) return;
    if (lastShopId.current === ranked.shop.id) return;
    lastShopId.current = ranked.shop.id;
    gsap.fromTo(
      ref.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "expo.out" },
    );
  }, [ranked]);

  if (!ranked) return null;
  const { shop, distanceKm, partInStock, partPrice, partStock } = ranked;

  // Other in-stock parts the shop carries (limit 6)
  const otherStock = shop.inventory
    .filter((i) => i.stock > 0 && i.partId !== activePart?.id)
    .slice(0, 6)
    .map((i) => ({ inv: i, part: PARTS.find((p) => p.id === i.partId)! }))
    .filter((x) => x.part);

  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;

  return (
    <div
      ref={ref}
      className="glass-panel relative overflow-hidden rounded-xl p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
            Shop Detail
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">{shop.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {shop.rating.toFixed(1)} ({shop.reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {formatKm(distanceKm)} away
            </span>
            <span className={cn(shop.openNow ? "text-success" : "text-destructive")}>
              {shop.openNow ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <a
          href={`tel:${shop.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Phone className="h-3.5 w-3.5" /> {shop.phone}
        </a>
        <a
          href={directionsHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md border border-secondary/40 bg-secondary/10 px-3 py-2 text-secondary transition-colors hover:bg-secondary/20"
        >
          <MapPin className="h-3.5 w-3.5" /> Get Directions
        </a>
      </div>

      {activePart && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected Part
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">{activePart.name}</div>
              <div className="text-xs text-muted-foreground">{activePart.brand}</div>
            </div>
            <div className="text-right">
              {partInStock ? (
                <>
                  <div className="font-display text-2xl font-bold text-foreground">
                    ₹{partPrice?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-success">{partStock} in stock</div>
                </>
              ) : (
                <div className="text-sm font-semibold text-destructive">Out of Stock</div>
              )}
            </div>
          </div>
          {!partInStock && alternative && (
            <button
              type="button"
              onClick={onPickAlternative}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-left text-xs transition-all hover:bg-primary/20"
            >
              <div>
                <div className="font-semibold text-primary">Best alternative</div>
                <div className="text-muted-foreground">
                  {alternative.shop.name} · {formatKm(alternative.distanceKm)} · ₹
                  {alternative.partPrice?.toLocaleString("en-IN")}
                </div>
              </div>
              <span className="text-primary">→</span>
            </button>
          )}
        </div>
      )}

      {otherStock.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Package className="h-3 w-3" /> Also in stock
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {otherStock.map(({ inv, part }) => (
              <div
                key={part.id}
                className="flex items-center justify-between rounded-md border border-border/60 bg-card/60 px-3 py-2 text-xs"
              >
                <span className="truncate text-foreground">{part.name}</span>
                <span className="ml-2 shrink-0 font-display font-semibold text-primary">
                  ₹{inv.price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
