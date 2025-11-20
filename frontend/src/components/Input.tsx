import { useState } from "react";
import styles from "./Input.module.css";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  success?: boolean;
  icon?: React.ReactNode;
  onValidate?: (value: string) => string | undefined;
}

export default function Input({
  label,
  error,
  helpText,
  success,
  icon,
  onValidate,
  id,
  required,
  className,
  onBlur,
  onChange,
  ...props
}: InputProps) {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();
  const generatedId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const displayError = error || (touched ? validationError : undefined);
  const showSuccess = success && !displayError && touched;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (onValidate) {
      const errorMsg = onValidate(e.target.value);
      setValidationError(errorMsg);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (touched && onValidate) {
      const errorMsg = onValidate(e.target.value);
      setValidationError(errorMsg);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`${styles.inputWrapper} ${className || ""}`}>
      <label htmlFor={generatedId} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-label="required">
            *
          </span>
        )}
      </label>
      <div
        className={`${styles.inputContainer} ${
          displayError ? styles.hasError : ""
        } ${showSuccess ? styles.hasSuccess : ""}`}
      >
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={generatedId}
          className={styles.input}
          aria-invalid={!!displayError}
          aria-describedby={
            displayError
              ? `${generatedId}-error`
              : helpText
              ? `${generatedId}-help`
              : undefined
          }
          onBlur={handleBlur}
          onChange={handleChange}
          required={required}
          {...props}
        />
        {displayError && (
          <span className={styles.statusIcon} aria-hidden="true">
            <IoAlertCircle />
          </span>
        )}
        {showSuccess && (
          <span className={styles.statusIcon} aria-hidden="true">
            <IoCheckmarkCircle />
          </span>
        )}
      </div>
      {displayError && (
        <p id={`${generatedId}-error`} className={styles.errorText} role="alert">
          {displayError}
        </p>
      )}
      {helpText && !displayError && (
        <p id={`${generatedId}-help`} className={styles.helpText}>
          {helpText}
        </p>
      )}
    </div>
  );
}
