import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={inputId} className="form-field__label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`form-field__input ${error ? "form-field__input--error" : ""} ${className}`.trim()}
          {...props}
        />
        {error && (
          <p className="form-field__error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="form-field__hint">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
