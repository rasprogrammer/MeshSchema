"use client";

import Link from "next/link";
import { Database, LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";

export function Topbar({ children }: { children?: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Database className="h-5 w-5 text-primary" />
          Schema Designer
        </Link>
        {children}
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-muted-foreground">{user.name}</span>}
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </header>
  );
}
