import { useState, useEffect } from "react";
import styles from "./ImprovedCancha.module.css";
import type { Place } from "../types";
import { IoPin, IoHeart, IoHeartOutline } from "react-icons/io5";

interface CanchaProps {
  place: Place;
  isSaved: boolean;
  onSave: (cancha: Place) => void;
  onRemove: (cancha: Place) => void;
}

export default function ImprovedCancha({
  place,
  isSaved,
  onSave,
  onRemove,
}: CanchaProps) {
  const [localIsSaved, setLocalIsSaved] = useState<boolean>(isSaved);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setLocalIsSaved(isSaved);
  }, [isSaved]);

  const handleToggleSave = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (localIsSaved) {
      setLocalIsSaved(false);
      onRemove(place);
    } else {
      setLocalIsSaved(true);
      onSave(place);
    }
  };

  return (
    <article className={styles.canchaCard}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{place.displayName}</h3>
          {place.sport && (
            <span className={styles.sportBadge}>
              {place.sport.charAt(0).toUpperCase() + place.sport.slice(1)}
            </span>
          )}
        </div>

        <p className={styles.address}>
          <IoPin aria-hidden="true" />
          {place.formattedAddress}
        </p>

        <div className={styles.footer}>
          <span className={styles.distance}>
            {(place.distanceMeters / 1000).toFixed(2)} km de distancia
          </span>
        </div>
      </div>

      <button
        onClick={handleToggleSave}
        className={`${styles.saveButton} ${isAnimating ? styles.animating : ""}`}
        aria-label={localIsSaved ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={localIsSaved}
      >
        {localIsSaved ? (
          <IoHeart className={styles.iconFilled} />
        ) : (
          <IoHeartOutline className={styles.iconOutline} />
        )}
      </button>
    </article>
  );
}
