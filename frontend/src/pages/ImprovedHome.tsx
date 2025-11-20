import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./ImprovedHome.module.css";
import { IoSearch, IoIosPin, IoFilter } from "react-icons/io5";
import { fetchSavedCanchas, saveCanchas } from "../api/firestore";
import { reverseGeocode } from "../api/geocode";
import type { Place } from "../types";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import Cancha from "../components/Cancha";

type ViewMode = "list" | "map";

export default function ImprovedHome() {
  const [results, setResults] = useState<Place[]>([]);
  const [savedCanchas, setSavedCanchas] = useState<Place[]>([]);
  const [originalSavedCanchas, setOriginalSavedCanchas] = useState<Place[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const sportTranslations = new Map([
    ["soccer", "Fútbol"],
    ["basketball", "Baloncesto"],
    ["volleyball", "Voleibol"],
    ["tennis", "Tenis"],
    ["padel", "Pádel"],
  ]);

  useEffect(() => {
    loadSavedCanchas();
  }, []);

  const loadSavedCanchas = async () => {
    try {
      setLoading(true);
      const saved = await fetchSavedCanchas();
      setSavedCanchas(saved);
      setOriginalSavedCanchas(saved);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al cargar canchas guardadas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCanchasChange = async (newCanchas: Place[]) => {
    setSavedCanchas(newCanchas);
    try {
      await saveCanchas(newCanchas, originalSavedCanchas);
      toast.success("Cambios guardados");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setOriginalSavedCanchas(newCanchas);
  };

  const handleCanchaSave = (canchaToSave: Place) => {
    const isSaved = savedCanchas.some((c) => c.id === canchaToSave.id);
    if (!isSaved) {
      handleCanchasChange([...savedCanchas, canchaToSave]);
    } else {
      toast.info("Ya está en favoritos");
    }
  };

  const handleCanchaRemove = (canchaToRemove: Place) => {
    const newSaved = savedCanchas.filter((c) => c.id !== canchaToRemove.id);
    handleCanchasChange(newSaved);
  };

  const searchNearbyCourts = async () => {
    const defaultLoc: L.LatLngTuple = [18.4549376, -69.9400192];

    const getUserLocation = () => {
      return new Promise<L.LatLngTuple>((resolve) => {
        if (!navigator.geolocation) {
          toast.warn("Tu navegador no soporta geolocalización.");
          resolve(defaultLoc);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            toast.warn("Activa los servicios de localización");
            console.error("Error getting location", error);
            resolve(defaultLoc);
          },
          { timeout: 5000 }
        );
      });
    };

    setSearching(true);
    const userLoc: L.LatLngTuple = await getUserLocation();

    let sportFilter = "";
    for (const [key, value] of sportTranslations.entries()) {
      if (value.toLowerCase() === searchQuery.toLowerCase()) {
        sportFilter = key;
        break;
      }
    }

    try {
      const radius = 3000;
      const maxResults = 10;

      const query = sportFilter
        ? `[out:json];(nwr["leisure"="pitch"]["sport"="${sportFilter}"](around:${radius},${userLoc[0]},${userLoc[1]}));out center qt ${maxResults};`
        : `[out:json];(nwr["leisure"="pitch"](around:${radius},${userLoc[0]},${userLoc[1]}));out center qt ${maxResults};`;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });

      const data = await response.json();

      if (data?.elements?.length > 0) {
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
        const searchResults: Place[] = [];

        for (const element of data.elements) {
          const tags = element.tags || {};
          const sport = tags.sport || "";
          const lat = element.lat || element.center?.lat;
          const lng = element.lon || element.center?.lon;

          let address = "Sin dirección";
          let name = sport ? `Cancha de ${sport}` : "Cancha";
          let distanceMeters = 0;

          if (lat && lng) {
            distanceMeters = L.latLng(userLoc[0], userLoc[1]).distanceTo(
              L.latLng(lat, lng)
            );
            try {
              const placeData = await reverseGeocode(lat, lng);
              if (placeData.name) name = placeData.name;
              if (placeData.address) {
                address = `${placeData.address.road || ""}, ${
                  placeData.address.neighbourhood || placeData.address.quarter || ""
                }, ${placeData.address.county || ""}, ${placeData.address.state || ""}`;
              }
              await delay(1100);
            } catch (err) {
              console.error("Reverse geocode failed", err);
            }
          }

          searchResults.push({
            id: element.id,
            displayName: name,
            location: { lat, lng },
            formattedAddress: address,
            sport: sport,
            distanceMeters: distanceMeters,
          });
        }
        setResults(searchResults);
        toast.success(`${searchResults.length} canchas encontradas`);
      } else {
        toast.info("No se encontraron canchas cercanas");
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed", error);
      toast.error("Error al buscar canchas");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const displayedCanchas = showSavedOnly ? savedCanchas : results;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoBar}>
          <img src="/zero-lio/icons/zero_icon.png" alt="0lio" />
          <h1>LÍO</h1>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por deporte..."
            value={searchQuery}
            list="sport-options"
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Buscar canchas por deporte"
          />
          <datalist id="sport-options">
            {Array.from(sportTranslations.values()).map((sport) => (
              <option key={sport} value={sport} />
            ))}
          </datalist>
          <Button
            onClick={searchNearbyCourts}
            isLoading={isSearching}
            icon={<IoSearch />}
            ariaLabel="Buscar canchas"
            variant="primary"
          >
            Buscar
          </Button>
        </div>

        <div className={styles.controls}>
          <button
            className={`${styles.toggleBtn} ${showSavedOnly ? styles.active : ""}`}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            aria-pressed={showSavedOnly}
          >
            {showSavedOnly ? "Ver Búsqueda" : "Ver Favoritos"}
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "map" ? styles.active : ""}`}
            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            aria-pressed={viewMode === "map"}
          >
            {viewMode === "list" ? "Ver Mapa" : "Ver Lista"}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loadingState}>Cargando...</div>
        ) : displayedCanchas.length === 0 ? (
          <EmptyState
            icon={<IoIosPin />}
            title={showSavedOnly ? "Sin favoritos" : "Sin resultados"}
            description={
              showSavedOnly
                ? "Agrega canchas a favoritos para acceder rápidamente"
                : "Busca canchas cercanas para comenzar"
            }
            actionLabel={showSavedOnly ? "Ver Búsqueda" : "Buscar Ahora"}
            onAction={() =>
              showSavedOnly ? setShowSavedOnly(false) : searchNearbyCourts()
            }
          />
        ) : viewMode === "list" ? (
          <div className={styles.listView}>
            {displayedCanchas.map((place) => {
              const isSaved = savedCanchas.some((c) => c.id === place.id);
              return (
                <Cancha
                  key={place.id}
                  place={place}
                  isSaved={isSaved}
                  onSave={handleCanchaSave}
                  onRemove={handleCanchaRemove}
                />
              );
            })}
          </div>
        ) : (
          <MapView results={displayedCanchas} />
        )}
      </main>

      <BottomNav />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

function MapView({ results }: { results: Place[] }) {
  const mapCenter: L.LatLngTuple =
    results.length > 0
      ? [results[0].location.lat, results[0].location.lng]
      : [18.4549376, -69.9400192];

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <MapSetter results={results} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {results.map((place) => (
          <Marker
            key={place.id}
            position={[place.location.lat, place.location.lng]}
          >
            <Popup>
              <strong>{place.displayName}</strong>
              <br />
              {place.formattedAddress}
              <br />
              {(place.distanceMeters / 1000).toFixed(2)} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapSetter({ results }: { results: Place[] }) {
  const map = useMap();
  if (results.length > 0) {
    map.setView([results[0].location.lat, results[0].location.lng], 13);
  }
  return null;
}
