"use client";

import { useEffect, useState } from "react";

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DocumentSearch({
  value,
  onChange,
  placeholder = "Search documents…",
}: DocumentSearchProps) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync external value changes without calling setState inside an effect.
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  // Debounce search input by 350ms.
  useEffect(() => {
    if (local === value) return;

    const timer = setTimeout(() => {
      onChange(local);
    }, 350);

    return () => clearTimeout(timer);
  }, [local, value, onChange]);

  const handleClear = () => {
    setLocal("");
    onChange("");
  };

  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <svg
          width="14"
          height="14"
          style={{ width: "14px", height: "14px", flexShrink: 0 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="search-bar__input"
      />

      {local && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="search-bar__clear"
        >
          ×
        </button>
      )}
    </div>
  );
}
