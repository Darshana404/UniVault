interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const pixelSizes = {
  sm: 16,
  md: 28,
  lg: 36,
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const px = pixelSizes[size] ?? 28;

  return (
    <svg
      width={px}
      height={px}
      style={{
        width: `${px}px`,
        height: `${px}px`,
        maxWidth: `${px}px`,
        maxHeight: `${px}px`,
        display: "inline-block",
      }}
      className={`spinner animate-spin ${className}`.trim()}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        style={{ opacity: 0.85 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
