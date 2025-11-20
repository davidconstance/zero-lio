import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import styles from "./ImprovedMakeReview.module.css";
import {
  fetchSavedCanchas,
  fetchUserInfo,
  postComment,
} from "../api/firestore";
import type { Place } from "../types";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { IoStar, IoStarOutline, IoLocationOutline, IoChatboxEllipses } from "react-icons/io5";

export default function ImprovedMakeReview() {
  const [savedCanchas, setSavedCanchas] = useState<Place[]>([]);
  const [selectedCancha, setSelectedCancha] = useState<Place | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedCanchas();
  }, []);

  const loadSavedCanchas = async () => {
    try {
      setLoading(true);
      const canchas = await fetchSavedCanchas();
      setSavedCanchas(canchas);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al cargar canchas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCancha) {
      toast.warning("Selecciona una cancha");
      return;
    }

    if (rating === 0) {
      toast.warning("Selecciona una calificación");
      return;
    }

    if (!reviewText.trim()) {
      toast.warning("Escribe tu comentario");
      return;
    }

    try {
      setLoading(true);
      const userProfile = await fetchUserInfo();
      const now = new Date();
      const formattedDate = now.toISOString().split(".")[0];
      const id = `${userProfile.name}-${formattedDate}`;

      await postComment({
        id,
        displayName: `${userProfile.name} ${userProfile.lastName}`,
        pfpSrc: userProfile.pfpSrc || "",
        date: now,
        stars: rating,
        text: reviewText,
        cancha: selectedCancha,
      });

      toast.success("Comentario publicado");
      navigate("/comunidad");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al publicar comentario");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          className={styles.starButton}
          aria-label={`Calificar con ${i} estrellas`}
        >
          {i <= displayRating ? (
            <IoStar className={styles.starFilled} />
          ) : (
            <IoStarOutline className={styles.starOutline} />
          )}
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          onClick={() => navigate("/canchas")}
          className={styles.backBtn}
          aria-label="Volver"
        >
          ←
        </button>
        <h1>Escribe una Reseña</h1>
      </header>

      <main className={styles.main}>
        {savedCanchas.length === 0 ? (
          <EmptyState
            icon={<IoChatboxEllipses />}
            title="Sin canchas guardadas"
            description="Primero guarda canchas en favoritos para poder comentar"
            actionLabel="Buscar Canchas"
            onAction={() => navigate("/canchas")}
          />
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <label htmlFor="cancha-select" className={styles.label}>
                <IoLocationOutline /> Selecciona la cancha
              </label>
              <select
                id="cancha-select"
                value={selectedCancha?.id || ""}
                onChange={(e) => {
                  const cancha = savedCanchas.find(
                    (c) => c.id === Number(e.target.value)
                  );
                  setSelectedCancha(cancha || null);
                }}
                className={styles.select}
                required
              >
                <option value="">Elige una cancha...</option>
                {savedCanchas.map((cancha) => (
                  <option key={cancha.id} value={cancha.id}>
                    {cancha.displayName}
                  </option>
                ))}
              </select>
            </div>

            {selectedCancha && (
              <div className={styles.canchaPreview}>
                <IoLocationOutline />
                <div>
                  <strong>{selectedCancha.displayName}</strong>
                  <p>{selectedCancha.formattedAddress}</p>
                </div>
              </div>
            )}

            <div className={styles.section}>
              <label className={styles.label}>Calificación</label>
              <div className={styles.starsContainer}>
                {renderStars()}
                {rating > 0 && (
                  <span className={styles.ratingText}>
                    {rating} de 5 estrellas
                  </span>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <label htmlFor="review-text" className={styles.label}>
                Tu experiencia
              </label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className={styles.textarea}
                placeholder="Cuéntanos sobre tu experiencia en esta cancha..."
                rows={6}
                maxLength={500}
                required
              />
              <span className={styles.charCount}>
                {reviewText.length} / 500 caracteres
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={isLoading}
              disabled={!selectedCancha || rating === 0 || !reviewText.trim()}
            >
              Publicar Reseña
            </Button>
          </form>
        )}
      </main>

      <BottomNav />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
