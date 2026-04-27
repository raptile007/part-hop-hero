import { Crosshair, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { GeoStatus } from "@/hooks/useGeolocation";
import type { SortMode, PartCategory } from "@/data/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: PartCategory; label: string }[] = [
  { id: "brakes", label: "Brakes" },
  { id: "drivetrain", label: "Drivetrain" },
  { id: "tires", label: "Tires" },
  { id: "wheels", label: "Wheels" },
  { id: "suspension", label: "Suspension" },
  { id: "electrical", label: "Electrical" },
  { id: "lubricants", label: "Lubricants" },
  { id: "accessories", label: "Accessories" },
];

const MODES: { id: SortMode; label: string; hint: string }[] = [
  { id: "best-deal", label: "Best Deal", hint: "Cheapest + closest" },
  { id: "nearest", label: "Nearest", hint: "Pure distance" },
  { id: "top-rated", label: "Top Rated", hint: "Highest rating first" },
];

interface Props {
  category: PartCategory | null;
  onCategory: (c: PartCategory | null) => void;
  mode: SortMode;
  onMode: (m: SortMode) => void;
  inStockOnly: boolean;
  onInStockOnly: (v: boolean) => void;
  onLocate: () => void;
  geoStatus: GeoStatus;
  geoIsReal: boolean;
  geoError?: string;
}

export function FilterBar(props: Props) {
  const {
    category, onCategory, mode, onMode,
    inStockOnly, onInStockOnly, onLocate, geoStatus, geoIsReal, geoError,
  } = props;

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ranking Mode
        </div>
        <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onMode(m.id)}
              className={cn(
                "rounded-md px-2 py-2 text-center transition-all duration-300 ease-power3",
                mode === m.id
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-card",
              )}
              title={m.hint}
            >
              <div className="text-xs font-semibold">{m.label}</div>
              <div className="text-[10px] opacity-80">{m.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Locate me + in-stock */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={onLocate}
          disabled={geoStatus === "locating"}
          className="border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary"
        >
          {geoStatus === "locating" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="mr-2 h-4 w-4" />
          )}
          {geoIsReal ? "Location Locked" : "Locate Me"}
        </Button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={inStockOnly} onCheckedChange={onInStockOnly} id="in-stock" />
          <span>In-stock only</span>
        </label>
      </div>

      {(geoStatus === "denied" || geoStatus === "fallback" || geoStatus === "unsupported") && geoError && (
        <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          {geoError}
        </div>
      )}

      {/* Categories */}
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Category
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-all",
              category === null
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategory(category === c.id ? null : c.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-all",
                category === c.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
