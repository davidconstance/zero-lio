import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { logInUser } from "../api/authentication";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import styles from "./Auth.module.css";
import Input from "../components/Input";
import Button from "../components/Button";
import { IoMail, IoLockClosed } from "react-icons/io5";

const firebaseErrorMap: Record<string, string> = {
  "auth/invalid-email": "Por favor, ingresa una dirección de correo válida.",
  "auth/invalid-credential": "Correo o contraseña inválidos.",
  "auth/user-not-found": "No se encontró una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
};

const validateEmail = (email: string) => {
  if (!email) return "El correo es requerido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Ingresa un correo válido";
  return undefined;
};

const validatePassword = (password: string) => {
  if (!password) return "La contraseña es requerida";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return undefined;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      toast.warning("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);
      await logInUser(email, password);
      toast.success("Sesión iniciada exitosamente");
      navigate("/canchas");
    } catch (error: unknown) {
      const err = error as FirebaseError;
      const message =
        firebaseErrorMap[err.code] || "Ha ocurrido un error al iniciar sesión";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.logoSection}>
        <img src="/zero-lio/icons/zero_icon.png" alt="Logo de 0lio" />
        <h1>LÍO</h1>
      </div>

      <div className={styles.formSection}>
        <div className={styles.header}>
          <h2>Iniciar Sesión</h2>
          <p className={styles.subtitle}>
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className={styles.link}>
              Regístrate
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onValidate={validateEmail}
            icon={<IoMail />}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />

          <div className={styles.passwordField}>
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onValidate={validatePassword}
              icon={<IoLockClosed />}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePassword}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
