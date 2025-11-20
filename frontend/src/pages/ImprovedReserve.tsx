import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import styles from "./ImprovedReserve.module.css";
import { fetchSavedCanchas, saveReservations } from "../api/firestore";
import type { Place, Reservation } from "../types";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import { IoCalendarOutline, IoLocationOutline, IoBasketballOutline, IoCheckmarkCircle } from "react-icons/io5";
import EmptyState from "../components/EmptyState";

type Step = 1 | 2 | 3;

export default function ImprovedReserve() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [savedCanchas, setSavedCanchas] = useState<Place[]>([]);
  const [selectedCancha, setSelectedCancha] = useState<Place | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedCanchas();
  }, []);

  const loadSavedCanchas = async () => {
    try {
      setLoading(true);
      const canchas = await fetchSavedCanchas();
      setSavedCanchas(canchas);
      if (canchas.length === 0) {
        toast.info("Primero guarda algunas canchas favoritas");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al cargar canchas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCanchaSelect = (cancha: Place) => {
    setSelectedCancha(cancha);
    setCurrentStep(2);
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.warning("Selecciona fecha y hora");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    if (selectedDateTime < now) {
      toast.error("No puedes reservar en el pasado");
      return;
    }

    setCurrentStep(3);
  };

  const handleConfirmReservation = async () => {
    if (!selectedCancha || !selectedDate || !selectedTime) {
      toast.error("Información incompleta");
      return;
    }

    const reservation: Reservation = {
      datetime: new Date(`${selectedDate}T${selectedTime}`),
      courtType: selectedCancha.sport || "Cancha",
      location: selectedCancha.formattedAddress,
    };

    try {
      setLoading(true);
      await saveReservations([reservation], []);
      setShowSuccess(true);
      toast.success("Reserva confirmada");

      setTimeout(() => {
        navigate("/reservaciones");
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Error al confirmar reserva");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      navigate("/canchas");
    }
  };

  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.container}>
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <IoCheckmarkCircle className={styles.successIcon} />
            <h2>Reserva Confirmada</h2>
            <p>Tu cancha ha sido reservada exitosamente</p>
            <div className={styles.reservationDetails}>
              <p><strong>Cancha:</strong> {selectedCancha?.displayName}</p>
              <p><strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString("es-ES")}</p>
              <p><strong>Hora:</strong> {selectedTime}</p>
            </div>
            <Button onClick={() => navigate("/reservaciones")} variant="primary">
              Ver Mis Reservas
            </Button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn} aria-label="Volver">
          ←
        </button>
        <h1>Reservar Cancha</h1>
      </header>

      <div className={styles.progressBar}>
        <div className={`${styles.progressStep} ${currentStep >= 1 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>1</div>
          <span>Cancha</span>
        </div>
        <div className={styles.progressLine}></div>
        <div className={`${styles.progressStep} ${currentStep >= 2 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>2</div>
          <span>Fecha</span>
        </div>
        <div className={styles.progressLine}></div>
        <div className={`${styles.progressStep} ${currentStep >= 3 ? styles.active : ""}`}>
          <div className={styles.stepNumber}>3</div>
          <span>Confirmar</span>
        </div>
      </div>

      <main className={styles.main}>
        {currentStep === 1 && (
          <div className={styles.step}>
            <h2>Selecciona una cancha</h2>
            {savedCanchas.length === 0 ? (
              <EmptyState
                icon={<IoLocationOutline />}
                title="Sin canchas guardadas"
                description="Primero guarda canchas en favoritos para reservar"
                actionLabel="Buscar Canchas"
                onAction={() => navigate("/canchas")}
              />
            ) : (
              <div className={styles.canchasList}>
                {savedCanchas.map((cancha) => (
                  <button
                    key={cancha.id}
                    onClick={() => handleCanchaSelect(cancha)}
                    className={styles.canchaCard}
                  >
                    <IoBasketballOutline className={styles.canchaIcon} />
                    <div className={styles.canchaInfo}>
                      <h3>{cancha.displayName}</h3>
                      <p>{cancha.formattedAddress}</p>
                      {cancha.sport && (
                        <span className={styles.sportBadge}>
                          {cancha.sport.charAt(0).toUpperCase() + cancha.sport.slice(1)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && selectedCancha && (
          <div className={styles.step}>
            <h2>Selecciona fecha y hora</h2>
            <div className={styles.selectedCanchaPreview}>
              <IoLocationOutline />
              <div>
                <strong>{selectedCancha.displayName}</strong>
                <p>{selectedCancha.formattedAddress}</p>
              </div>
            </div>

            <div className={styles.dateTimeSelection}>
              <label htmlFor="date-picker">
                <IoCalendarOutline /> Fecha
              </label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                min={todayString}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.dateInput}
              />

              <label htmlFor="time-picker">
                <IoCalendarOutline /> Hora
              </label>
              <select
                id="time-picker"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={styles.timeSelect}
                disabled={!selectedDate}
              >
                <option value="">Selecciona una hora</option>
                {getAvailableTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleDateTimeConfirm}
              variant="primary"
              fullWidth
              disabled={!selectedDate || !selectedTime}
            >
              Continuar
            </Button>
          </div>
        )}

        {currentStep === 3 && selectedCancha && (
          <div className={styles.step}>
            <h2>Confirmar reserva</h2>
            <div className={styles.confirmationCard}>
              <div className={styles.confirmationRow}>
                <IoLocationOutline />
                <div>
                  <strong>Cancha</strong>
                  <p>{selectedCancha.displayName}</p>
                  <p className={styles.address}>{selectedCancha.formattedAddress}</p>
                </div>
              </div>

              <div className={styles.confirmationRow}>
                <IoCalendarOutline />
                <div>
                  <strong>Fecha</strong>
                  <p>{new Date(selectedDate).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                </div>
              </div>

              <div className={styles.confirmationRow}>
                <IoBasketballOutline />
                <div>
                  <strong>Hora</strong>
                  <p>{selectedTime}</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button onClick={handleBack} variant="secondary" fullWidth>
                Editar
              </Button>
              <Button
                onClick={handleConfirmReservation}
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
