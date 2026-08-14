import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __initLucknowMaps?: () => void;
    __lucknowMapsReady?: boolean;
  }
}

let loaderPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__lucknowMapsReady) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
  if (!key) return Promise.reject(new Error("Google Maps key unavailable"));

  loaderPromise = new Promise<void>((resolve, reject) => {
    window.__initLucknowMaps = () => {
      window.__lucknowMapsReady = true;
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initLucknowMaps&channel=${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export function HospitalMap({
  lat,
  lng,
  name,
  className = "h-72 w-full",
}: {
  lat: number;
  lng: number;
  name: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        const position = { lat, lng };
        const map = new window.google.maps.Map(ref.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
        });
        const marker = new window.google.maps.Marker({ position, map, title: name });
        const info = new window.google.maps.InfoWindow({
          content: `<strong style="font-size:13px">${name}</strong>`,
        });
        marker.addListener("click", () => info.open({ anchor: marker, map }));
      })
      .catch(() => {
        if (!cancelled) setError("Map could not be loaded right now.");
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, name]);

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground`}
      >
        {error}
      </div>
    );
  }

  return <div ref={ref} className={`${className} rounded-lg border border-border bg-muted`} />;
}