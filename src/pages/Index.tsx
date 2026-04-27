import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Bike, Wrench } from "lucide-react";
import { CursorGlow } from "@/components/CursorGlow";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { ShopCard, ShopDetailPanel } from "@/components/ShopCards";
import { ShopMap } from "@/components/ShopMap";
import { CartButton } from "@/components/CartButton";
import { PARTS } from "@/data/parts";
import { SHOPS } from "@/data/shops";
import { HERO_IMAGE } from "@/data/partImages";
import type { PartCategory, SortMode } from "@/data/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useShopRanking } from "@/hooks/useShopRanking";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);
  const [category, setCategory] = useState<PartCategory | null>(null);
  const [mode, setMode] = useState<SortMode>("best-deal");
  const [inStockOnly, setInStockOnly] = useState(true);

  const geo = useGeolocation();
  const debouncedSearch = useDebouncedValue(searchTerm, 180);

  // Filter shops by category at the part level (so filter is meaningful)
  const partsInCategory = useMemo(
    () => (category ? PARTS.filter((p) => p.category === category) : PARTS),
    [category],
  );
  const partIdsInCategory = useMemo(
    () => new Set(partsInCategory.map((p) => p.id)),
    [partsInCategory],
  );

  // If active part is filtered out by category, clear it
  useEffect(() => {
    if (activePartId && !partIdsInCategory.has(activePartId)) {
      setActivePartId(null);
    }
  }, [activePartId, partIdsInCategory]);

  // Pre-filter shops: when a category is selected, only keep shops carrying
  // any in-stock part of that category. This is the source of truth for both
  // the map and the list (so they stay in sync).
  const shopsInScope = useMemo(() => {
    if (!category) return SHOPS;
    return SHOPS.filter((s) =>
      s.inventory.some((inv) => inv.stock > 0 && partIdsInCategory.has(inv.partId)),
    );
  }, [category, partIdsInCategory]);

  const ranked = useShopRanking({
    shops: shopsInScope,
    userPos: geo.position,
    activePartId,
    mode,
    inStockOnly,
    category: null, // category already enforced upstream
    searchTerm: debouncedSearch,
  });

  const visibleShopIds = useMemo(
    () => new Set(ranked.map((r) => r.shop.id)),
    [ranked],
  );

  const activeRanked = useMemo(
    () => ranked.find((r) => r.shop.id === activeShopId) ?? null,
    [ranked, activeShopId],
  );
  const activePart = useMemo(
    () => PARTS.find((p) => p.id === activePartId) ?? null,
    [activePartId],
  );

  // Best alternative when out of stock at active shop
  const alternative = useMemo(() => {
    if (!activePart || !activeRanked) return null;
    if (activeRanked.partInStock) return null;
    return ranked.find((r) => r.partInStock) ?? null;
  }, [ranked, activePart, activeRanked]);

  // Auto-select nearest shop with stock when picking a part
  const lastAutoPart = useRef<string | null>(null);
  useEffect(() => {
    if (!activePartId) return;
    if (lastAutoPart.current === activePartId) return;
    lastAutoPart.current = activePartId;
    const best = ranked.find((r) => r.partInStock);
    if (best) setActiveShopId(best.shop.id);
  }, [activePartId, ranked]);

  // Auto-select first shop when filters change & nothing selected
  useEffect(() => {
    if (activeShopId && visibleShopIds.has(activeShopId)) return;
    setActiveShopId(ranked[0]?.shop.id ?? null);
  }, [ranked, activeShopId, visibleShopIds]);

  // Hero entrance animation
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const inStockCount = ranked.filter((r) => !activePartId || r.partInStock).length;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CursorGlow />

      {/* Header */}
      <header
        ref={heroRef}
        className="relative z-10 border-b border-border/60 bg-background/60 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-8">
          <div className="hero-anim flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-foreground">
                SparePulse
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Bike Parts · Live Inventory
              </div>
            </div>
          </div>
          <div className="hero-anim flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary" />
              {SHOPS.length} shops · {PARTS.length} parts indexed
            </span>
            <CartButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
        {/* Hero / Search */}
        <section className="hero-anim mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-tech p-6 lg:p-8">
            <div className="tech-grid pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative">
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Find any bike part. <span className="text-primary glow-text">In stock. Nearby.</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Real-time inventory across {SHOPS.length} workshops. Search a part — we route you to
                the nearest shop that actually has it.
              </p>
              <div className="mt-5 max-w-2xl">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  parts={partsInCategory}
                  activePartId={activePartId}
                  onPickPart={(id) => {
                    setActivePartId(id);
                    setSearchTerm("");
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3-column workspace */}
        <section className="grid gap-4 lg:grid-cols-[340px_1fr_360px]">
          {/* LEFT — filters + list */}
          <aside className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-4">
              <FilterBar
                category={category}
                onCategory={setCategory}
                mode={mode}
                onMode={setMode}
                inStockOnly={inStockOnly}
                onInStockOnly={setInStockOnly}
                onLocate={geo.locate}
                geoStatus={geo.status}
                geoIsReal={geo.isReal}
                geoError={geo.error}
              />
            </div>

            <div className="glass-panel flex min-h-[400px] flex-1 flex-col rounded-xl">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Results
                  </div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {ranked.length}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      shops · {inStockCount} matching
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {mode.replace("-", " ")}
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {ranked.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <Bike className="h-10 w-10 text-muted-foreground/50" />
                    <div className="text-sm font-medium text-muted-foreground">No shops match</div>
                    <div className="text-xs text-muted-foreground/70">
                      Try removing filters or widening your search.
                    </div>
                  </div>
                ) : (
                  ranked.map((r, idx) => (
                    <ShopCard
                      key={r.shop.id}
                      rank={idx + 1}
                      ranked={r}
                      active={r.shop.id === activeShopId}
                      activePart={activePart}
                      onSelect={() => setActiveShopId(r.shop.id)}
                      onHoverChange={(h) => setHoveredShopId(h ? r.shop.id : null)}
                    />
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* CENTER — map */}
          <div className="min-h-[520px] lg:min-h-[720px]">
            <ShopMap
              rankedShops={ranked}
              visibleShopIds={visibleShopIds}
              activeShopId={activeShopId}
              hoveredShopId={hoveredShopId}
              userPos={geo.position}
              isRealUserPos={geo.isReal}
              onShopClick={setActiveShopId}
            />
          </div>

          {/* RIGHT — detail */}
          <aside>
            {activeRanked ? (
              <ShopDetailPanel
                ranked={activeRanked}
                activePart={activePart}
                alternative={alternative}
                onPickAlternative={() => alternative && setActiveShopId(alternative.shop.id)}
                onClose={() => setActiveShopId(null)}
              />
            ) : (
              <div className="glass-panel flex h-full min-h-[400px] flex-col items-center justify-center gap-2 rounded-xl p-6 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground/40" />
                <div className="text-sm font-medium text-muted-foreground">
                  Select a shop to see details
                </div>
              </div>
            )}
          </aside>
        </section>

        <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          SparePulse · Live workshop inventory · Built for riders who can't wait.
        </footer>
      </main>
    </div>
  );
};

export default Index;
