"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function HomePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => {
        setUser(user);
        router.replace("/dashboard");
      })
      .catch(() => router.replace("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
