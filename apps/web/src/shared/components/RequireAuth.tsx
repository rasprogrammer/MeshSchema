"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Client-side route guard. Session tokens live in httpOnly cookies (not
 * readable from JS), so the only reliable way to know if a session is valid
 * is to ask the server via /auth/me — the browser attaches the cookies
 * automatically. Redirects to /login on failure.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/login");
    }
  }, [isLoading, isError, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
