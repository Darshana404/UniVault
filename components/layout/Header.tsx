"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Library" },
  { href: "/upload", label: "Upload" },
];

export function Header() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <span className="text-xl font-bold text-teal-400">UniVault</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith(href)
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-slate-400 hidden md:block">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
