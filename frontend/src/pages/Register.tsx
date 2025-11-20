import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { registerUser, updateUserInfo } from "../api/authentication";
import { saveUserInfo } from "../api/firestore";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";
import styles from "./Auth.module.css";
import Input from "../components/Input";
import Button from "../components/Button";
import { IoMail, IoLockClosed, IoPerson, IoCard } from "react-icons/io5";

const firebaseErrorMap: Record<string, string> = {
  "auth/invalid-email": "Por favor, ingresa una dirección de correo válida.",
  "auth/email-already-in-use": "Ese correo ya está registrado.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
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
  if (password.length < 6) return "Mínimo 6 caracteres";
  if (!/[A-Z]/.test(password)) return "Debe incluir una mayúscula";
  if (!/[0-9]/.test(password)) return "Debe incluir un número";
  return undefined;
};

const validateName = (name: string) => {
  if (!name) return "Este campo es requerido";
  if (name.length < 2) return "Mínimo 2 caracteres";
  return undefined;
};

const validateCedula = (cedula: string) => {
  if (!cedula) return "La cédula es requerida";
  if (!/^\d{3}-\d{7}-\d{1}$/.test(cedula))
    return "Formato: 001-0000000-1";
  return undefined;
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    cedula: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.warning("Debes aceptar los términos y condiciones");
      return;
    }

    const errors = {
      name: validateName(formData.name),
      lastName: validateName(formData.lastName),
      email: validateEmail(formData.email),
      cedula: validateCedula(formData.cedula),
      password: validatePassword(formData.password),
    };

    if (formData.password !== formData.confirmPassword) {
      toast.warning("Las contraseñas no coinciden");
      return;
    }

    if (Object.values(errors).some((error) => error)) {
      toast.warning("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);
      await registerUser(formData.email, formData.password);
      await updateUserInfo(`${formData.name} ${formData.lastName}`);
      await saveUserInfo({
        name: formData.name,
        lastName: formData.lastName,
        cedula: formData.cedula,
        email: formData.email,
      });
      toast.success("Cuenta creada exitosamente");
      navigate("/canchas");
    } catch (error: unknown) {
      const err = error as FirebaseError;
      const message =
        firebaseErrorMap[err.code] ||
        "Ha ocurrido un error durante el registro.";
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
          <h2>Crear Cuenta</h2>
          <p className={styles.subtitle}>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/" className={styles.link}>
              Inicia sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <Input
              label="Nombre"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onValidate={validateName}
              icon={<IoPerson />}
              placeholder="Juan"
              autoComplete="given-name"
              required
            />
            <Input
              label="Apellido"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onValidate={validateName}
              icon={<IoPerson />}
              placeholder="Pérez"
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onValidate={validateEmail}
            icon={<IoMail />}
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />

          <Input
            label="Cédula"
            type="text"
            value={formData.cedula}
            onChange={(e) => handleChange("cedula", e.target.value)}
            onValidate={validateCedula}
            icon={<IoCard />}
            placeholder="001-0000000-1"
            helpText="Formato: XXX-XXXXXXX-X"
            required
          />

          <div className={styles.passwordField}>
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onValidate={validatePassword}
              icon={<IoLockClosed />}
              placeholder="••••••••"
              autoComplete="new-password"
              helpText="Mínimo 6 caracteres, 1 mayúscula, 1 número"
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

          <Input
            label="Confirmar Contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            icon={<IoLockClosed />}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <span>
              Acepto los{" "}
              <Link to="/terms" className={styles.link} target="_blank">
                términos y condiciones
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
          >
            Crear Cuenta
          </Button>
        </form>
      </div>
    </div>
  );
}
