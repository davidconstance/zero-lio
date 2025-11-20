import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import styles from "./ImprovedHome.module.css";
import { IoSearch, IoPin } from "react-icons/io5";
import type { Place } from "../types";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import Cancha from "../components/Cancha";
import { fetchSavedCanchas, saveCanchas } from "../api/firestore";
import { searchNearbyCourts } from "../api/overpass"; // <-- importamos la nueva API

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
    } catch {
      toast.error("Error al cargar canchas guardadas");
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
      if (error instanceof Error) toast.error(error.message);
    }
    setOriginalSavedCanchas(newCanchas);
  };

  const handleCanchaSave = (canchaToSave: Place) => {
    const isSaved = savedCanchas.some((c) => c.id === canchaToSave.id);
    if (!isSaved) handleCanchasChange([...savedCanchas, canchaToSave]);
    else toast.info("Ya está en favoritos");
  };

  const handleCanchaRemove = (canchaToRemove: Place) => {
    const newSaved = savedCanchas.filter((c) => c.id !== canchaToRemove.id);
    handleCanchasChange(newSaved);
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const searchResults = await searchNearbyCourts(searchQuery, sportTranslations);
      setResults(searchResults);
      if (searchResults.length === 0) toast.info("No se encontraron canchas cercanas");
      else toast.success(`${searchResults.length} canchas encontradas`);
    } catch (err) {
      console.error(err);
      toast.error("Error al buscar canchas");
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
            onClick={handleSearch}
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
            icon={<IoPin />}
            title={showSavedOnly ? "Sin favoritos" : "Sin resultados"}
            description={
              showSavedOnly
                ? "Agrega canchas a favoritos para acceder rápidamente"
                : "Busca canchas cercanas para comenzar"
            }
            actionLabel={showSavedOnly ? "Ver Búsqueda" : "Buscar Ahora"}
            onAction={() =>
              showSavedOnly ? setShowSavedOnly(false) : handleSearch()
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
          <div className={styles.mapContainer}>
            {/* Aquí podrías agregar un componente MapView si quieres mapa */}
          </div>
        )}
      </main>

      <BottomNav />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
