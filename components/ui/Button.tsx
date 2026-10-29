import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const variantClass =
      variant === "primary"
        ? "btn--primary"
        : variant === "secondary"
        ? "btn--secondary"
        : variant === "danger"
        ? "btn--danger"
        : variant === "icon"
        ? "btn--icon"
        : "btn--secondary";

    const sizeClass = size === "sm" ? "btn--sm" : size === "lg" ? "btn--lg" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            width={16}
            height={16}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
