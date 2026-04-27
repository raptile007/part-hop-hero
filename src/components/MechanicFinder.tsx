import { useEffect, useState } from "react";
import GoogleMap from "./GoogleMap";
import type { MechanicPlace } from "../types";
import { apiFetch } from "../lib/api";

interface MechanicFinderProps {
  onStatusChange?: (status: string) => void;
}

const MechanicFinder = ({ onStatusChange }: MechanicFinderProps) => {
  const [places, setPlaces] = useState<MechanicPlace[]>([]);
  const [status, setStatus] = useState("Click the button to find nearby mechanics.");
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  const findMechanics = () => {
    setStatus("Requesting your location...");

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter({ lat, lng });
        setStatus("Searching for nearby bike mechanics...");

        try {
          const data = await apiFetch<{ results: MechanicPlace[] }>(
            `/api/mechanics?lat=${lat}&lng=${lng}`,
          );
          setPlaces(data.results || []);
          setStatus(data.results?.length ? "Mechanics found near you." : "No nearby mechanics found.");
          onStatusChange?.(data.results?.length ? "Mechanics loaded." : "No nearby mechanics found.");
        } catch (error) {
          setStatus((error as Error).message || "Unable to find nearby mechanics.");
        }
      },
      (error) => {
        setStatus(error.message || "Unable to read your location.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Mechanic Finder</h2>
          <p className="mt-1 text-sm text-slate-400">Use your browser GPS and Google Places to locate nearby bike mechanics.</p>
        </div>
        <button
          type="button"
          onClick={findMechanics}
          className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Find Mechanic
        </button>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
        {status}
      </div>

      {places.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {places.map((place) => (
              <div key={place.place_id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                <h3 className="font-semibold text-white">{place.name}</h3>
                <p className="text-sm text-slate-400">{place.vicinity}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Rating: {place.rating ?? "N/A"} · Reviews: {place.user_ratings_total ?? "N/A"}
                </p>
              </div>
            ))}
          </div>
          <GoogleMap places={places} center={center} />
        </div>
      ) : null}
    </section>
  );
};

export default MechanicFinder;
