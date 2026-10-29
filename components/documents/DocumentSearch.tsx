// "use client";

// import { useEffect, useState } from "react";

// interface DocumentSearchProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
// }

// export function DocumentSearch({
//   value,
//   onChange,
//   placeholder = "Search documents…",
// }: DocumentSearchProps) {
//   const [local, setLocal] = useState(value);

//   // Debounce search input by 300ms
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onChange(local);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [local, onChange]);

//   // Sync external value changes
//   useEffect(() => {
//     setLocal(value);
//   }, [value]);

//   return (
//     <div className="relative">
//       <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//         <svg
//           className="w-4 h-4 text-slate-500"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//           />
//         </svg>
//       </div>
//       <input
//         type="search"
//         value={local}
//         onChange={(e) => setLocal(e.target.value)}
//         placeholder={placeholder}
//         className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
//       />
//       {local && (
//         <button
//           onClick={() => {
//             setLocal("");
//             onChange("");
//           }}
//           className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
//           aria-label="Clear search"
//         >
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// }


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
    <div className="relative">
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
      />

      {local && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}