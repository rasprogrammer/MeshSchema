"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { apiClient, getErrorMessage } from "@/lib/apiClient";
import { Skeleton } from "@/shared/ui/skeleton";

function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .post<{ projectId: string }>(`/projects/invites/accept/${token}`)
      .then(({ data }) => router.replace(`/projects/${data.projectId}`))
      .catch((err) => setError(getErrorMessage(err)));
  }, [token, router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return (
    <RequireAuth>
      <AcceptInvite token={token} />
    </RequireAuth>
  );
}
