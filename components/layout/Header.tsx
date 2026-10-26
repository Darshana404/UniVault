"use client";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-teal-400">UniVault</span>
          <span className="text-xs text-slate-500 hidden sm:block">
            Academic Resource Platform
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-slate-400 hidden sm:block">
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