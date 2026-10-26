import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-slate-900/80 border border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 relative ${className}`}
    >
      {children}
    </div>
  );
}
