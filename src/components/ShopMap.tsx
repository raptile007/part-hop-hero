import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { RankedShop } from "@/hooks/useShopRanking";
import { CITY_CENTER } from "@/data/shops";

interface Props {
  rankedShops: RankedShop[];
  visibleShopIds: Set<string>;
  activeShopId: string | null;
  hoveredShopId: string | null;
  userPos: [number, number];
  isRealUserPos: boolean;
  onShopClick: (id: string) => void;
}

function buildIcon(opts: { active: boolean; hasStock: boolean; dimmed: boolean; label: string }) {
  const cls = [
    "shop-marker",
    opts.hasStock ? "has-stock" : "",
    opts.active ? "active" : "",
    opts.dimmed ? "dimmed" : "",
  ].filter(Boolean).join(" ");
  return L.divIcon({
    className: "",
    html: `<div class="${cls}"><span class="shop-marker-inner">${opts.label}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:hsl(190 90% 50%);box-shadow:0 0 0 6px hsl(190 90% 50% / 0.2),0 0 24px hsl(190 90% 50% / 0.6);"></div>
        <div style="position:absolute;inset:6px;border-radius:50%;background:white;"></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function MapController({
  activeShop,
  userPos,
  isRealUserPos,
  containerRef,
}: {
  activeShop: RankedShop | undefined;
  userPos: [number, number];
  isRealUserPos: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const map = useMap();
  const lastActiveId = useRef<string | null>(null);
  const flewToUser = useRef(false);

  // CRITICAL FIX: Leaflet needs invalidateSize() once the container has its
  // real dimensions (it often mounts inside a flex/grid that resolves later).
  // Without this, only a tiny corner of tiles is rendered.
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [map]);

  // React to container resize (sidebar collapse, window resize, etc.)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    const onWinResize = () => map.invalidateSize();
    window.addEventListener("resize", onWinResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onWinResize); };
  }, [map, containerRef]);

  // Fly to active shop when it changes
  useEffect(() => {
    if (!activeShop) return;
    if (lastActiveId.current === activeShop.shop.id) return;
    lastActiveId.current = activeShop.shop.id;
    map.flyTo([activeShop.shop.lat, activeShop.shop.lng], 15, {
      duration: 0.9,
      easeLinearity: 0.25,
    });
  }, [activeShop, map]);

  // Fly to real user pos the first time we get it
  useEffect(() => {
    if (isRealUserPos && !flewToUser.current && !activeShop) {
      flewToUser.current = true;
      map.flyTo(userPos, 14, { duration: 0.9 });
    }
  }, [isRealUserPos, userPos, activeShop, map]);

  return null;
}

export function ShopMap(props: Props) {
  const {
    rankedShops, visibleShopIds, activeShopId, hoveredShopId,
    userPos, isRealUserPos, onShopClick,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const activeShop = useMemo(
    () => rankedShops.find((r) => r.shop.id === activeShopId),
    [rankedShops, activeShopId],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[420px] w-full overflow-hidden rounded-xl border border-border glass-panel"
    >
      <MapContainer
        center={CITY_CENTER}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isRealUserPos && (
          <Marker position={userPos} icon={userIcon()} />
        )}
        {rankedShops.map((r, idx) => {
          const visible = visibleShopIds.has(r.shop.id);
          const active = r.shop.id === activeShopId || r.shop.id === hoveredShopId;
          return (
            <Marker
              key={r.shop.id}
              position={[r.shop.lat, r.shop.lng]}
              icon={buildIcon({
                active,
                hasStock: r.partInStock || (!activeShopId && r.shop.inventory.some(i => i.stock > 0)),
                dimmed: !visible,
                label: String(idx + 1),
              })}
              eventHandlers={{
                click: () => onShopClick(r.shop.id),
              }}
            />
          );
        })}
        <MapController
          activeShop={activeShop}
          userPos={userPos}
          isRealUserPos={isRealUserPos}
          containerRef={containerRef}
        />
      </MapContainer>
      {/* Top gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/80 to-transparent" />
    </div>
  );
}

