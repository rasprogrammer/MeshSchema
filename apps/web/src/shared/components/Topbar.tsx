"use client";

import Link from "next/link";
import { Database, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";

export function Topbar({ children }: { children?: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      {/* Left */}
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Database className="h-5 w-5 text-primary" />
          Schema Designer
        </Link>

        {children}
      </div>

      {/* Right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 rounded-full px-2"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.avatarUrl || ""}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-2">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
