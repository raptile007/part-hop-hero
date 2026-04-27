import { useEffect, useRef } from "react";
import type { MechanicPlace } from "../types";

interface GoogleMapProps {
  places: MechanicPlace[];
  center: { lat: number; lng: number };
}

const loadGoogleMapScript = (apiKey: string) => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed to load."));
    document.head.appendChild(script);
  });
};

const GoogleMap = ({ places, center }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey || !mapRef.current) return;

    let map: google.maps.Map;
    let markers: google.maps.Marker[] = [];

    loadGoogleMapScript(apiKey)
      .then(() => {
        const google = (window as any).google;
        map = new google.maps.Map(mapRef.current as HTMLDivElement, {
          center,
          zoom: 13,
        });

        markers = places.map((place) => {
          const position = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          };
          const marker = new google.maps.Marker({
            position,
            map,
            title: place.name,
          });
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${place.name}</strong><br/>${place.vicinity}</div>`,
          });
          marker.addListener("click", () => infoWindow.open(map, marker));
          return marker;
        });

        if (places.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach((marker) => bounds.extend(marker.getPosition()!));
          map.fitBounds(bounds);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [places, center]);

  return <div ref={mapRef} className="h-[420px] w-full rounded-3xl border border-slate-700 bg-slate-950" />;
};

export default GoogleMap;
