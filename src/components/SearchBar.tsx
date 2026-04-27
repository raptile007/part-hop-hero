import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Part } from "@/data/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
  parts: Part[];
  activePartId: string | null;
  onPickPart: (id: string | null) => void;
}

export function SearchBar({ value, onChange, parts, activePartId, onPickPart }: Props) {
  const term = value.trim().toLowerCase();
  const suggestions = term
    ? parts
        .filter((p) =>
          (p.name + " " + p.brand + " " + p.fitsBikes.join(" "))
            .toLowerCase()
            .includes(term),
        )
        .slice(0, 6)
    : [];

  const activePart = parts.find((p) => p.id === activePartId);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={activePart ? activePart.name : value}
          onChange={(e) => {
            if (activePart) onPickPart(null);
            onChange(e.target.value);
          }}
          placeholder="Search part, brand or bike model…"
          className="h-12 pl-10 pr-10 text-base bg-input/60 border-border focus-visible:ring-primary"
        />
        {(activePart || value) && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
            onClick={() => {
              onPickPart(null);
              onChange("");
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {suggestions.length > 0 && !activePart && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-border glass-panel shadow-panel animate-fade-in">
          {suggestions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPickPart(p.id)}
              className="flex w-full items-center justify-between gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary/10"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.brand} · fits {p.fitsBikes.slice(0, 2).join(", ")}
                </div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {p.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
