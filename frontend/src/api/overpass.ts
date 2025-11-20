import L from "leaflet";
import type { Place } from "../types";
import { reverseGeocode } from "./geocode";

const DEFAULT_LOCATION: L.LatLngTuple = [18.4549376, -69.9400192];
const RADIUS = 3000; // metros
const MAX_RESULTS = 10;

export async function searchNearbyCourts(
  searchQuery: string,
  sportTranslations: Map<string, string>
): Promise<Place[]> {
  // Obtener ubicación del usuario o usar la default
  const getUserLocation = (): Promise<L.LatLngTuple> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(DEFAULT_LOCATION);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => resolve(DEFAULT_LOCATION),
        { timeout: 5000 }
      );
    });

  const userLoc = await getUserLocation();

  // Determinar filtro de deporte
  let sportFilter = "";
  for (const [key, value] of sportTranslations.entries()) {
    if (value.toLowerCase() === searchQuery.toLowerCase()) {
      sportFilter = key;
      break;
    }
  }

  // Construir filtro de Overpass QL
  const filter = sportFilter
    ? `["leisure"="pitch"]["sport"="${sportFilter}"]`
    : `["leisure"="pitch"]`;

  // Query de Overpass válido y simple
  const query = `
[out:json][timeout:25];
(
  node${filter}(around:${RADIUS},${userLoc[0]},${userLoc[1]});
  way${filter}(around:${RADIUS},${userLoc[0]},${userLoc[1]});
  relation${filter}(around:${RADIUS},${userLoc[0]},${userLoc[1]});
);
out center ${MAX_RESULTS};
`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    if (!response.ok) throw new Error(`Overpass API error ${response.status}`);
    const data = await response.json();

    if (!data.elements || data.elements.length === 0) return [];

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const results: Place[] = [];

    for (const element of data.elements) {
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;
      if (!lat || !lng) continue;

      let name = element.tags?.name || (element.tags?.sport ? `Cancha de ${element.tags.sport}` : "Cancha");
      let address = "Sin dirección";
      let distanceMeters = L.latLng(userLoc[0], userLoc[1]).distanceTo(L.latLng(lat, lng));

      try {
        const placeData = await reverseGeocode(lat, lng);
        if (placeData.name) name = placeData.name;
        if (placeData.address) {
          const a = placeData.address;
          address = `${a.road || ""}, ${a.neighbourhood || a.quarter || ""}, ${a.county || ""}, ${a.state || ""}`;
        }
        await delay(1100); // para no saturar Nominatim
      } catch (err) {
        console.error("Reverse geocode failed", err);
      }

      results.push({
        id: element.id,
        displayName: name,
        location: { lat, lng },
        formattedAddress: address,
        sport: element.tags?.sport || "",
        distanceMeters,
      });
    }

    return results;
  } catch (err) {
    console.error("Search failed", err);
    throw err;
  }
}
