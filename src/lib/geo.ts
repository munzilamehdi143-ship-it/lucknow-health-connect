export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function directionsUrl(lat: number, lng: number, name?: string) {
  const destination = name
    ? encodeURIComponent(`${name} ${lat},${lng}`)
    : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;
}

export function mapsUrl(lat: number, lng: number, name?: string) {
  const query = name ? encodeURIComponent(`${name} ${lat},${lng}`) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Opens Google Maps in a new tab, escaping the preview iframe when needed. */
export function openExternal(url: string) {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) window.top?.location.assign(url);
}

export function formatINR(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}