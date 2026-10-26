import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
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
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold shadow-md shadow-teal-500/20 focus:ring-teal-400 active:scale-[0.99]",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500 active:scale-[0.99]",
      ghost:
        "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500",
      danger:
        "bg-red-500 hover:bg-red-400 text-white font-medium focus:ring-red-500",
    };

    const sizes = {
      sm: "text-xs px-3 py-2",
      md: "text-sm px-4 py-2.5",
      lg: "text-sm sm:text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 text-current"
            width={16}
            height={16}
            style={{ width: "16px", height: "16px", flexShrink: 0 }}
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
