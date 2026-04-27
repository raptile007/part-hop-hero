import { useCallback, useState } from "react";
import { CITY_CENTER } from "@/data/shops";

export type GeoStatus = "idle" | "locating" | "ok" | "denied" | "unsupported" | "fallback";

export interface GeoState {
  position: [number, number];   // always usable — falls back to CITY_CENTER
  isReal: boolean;              // true only when from browser geolocation
  status: GeoStatus;
  error?: string;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    position: CITY_CENTER,
    isReal: false,
    status: "idle",
  });

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({
        position: CITY_CENTER,
        isReal: false,
        status: "unsupported",
        error: "Geolocation not supported. Using city center.",
      });
      return;
    }
    setState((s) => ({ ...s, status: "locating" }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          isReal: true,
          status: "ok",
        });
      },
      (err) => {
        setState({
          position: CITY_CENTER,
          isReal: false,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "fallback",
          error:
            err.code === err.PERMISSION_DENIED
              ? "Location permission denied. Showing results from city center."
              : "Couldn't get your location. Showing results from city center.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  return { ...state, locate };
}
