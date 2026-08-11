"use client";

import { RequireAuth } from "@/shared/components/RequireAuth";
import { Topbar } from "@/shared/components/Topbar";

import { ProfileCard } from "@/features/profile/components/ProfileCard";
import { UpdatePasswordDialog } from "@/features/profile/components/UpdatePasswordDialog";
import { TwoFactorCard } from "@/features/profile/components/TwoFactorCard";

import { useState } from "react";

export default function ProfilePage() {
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <Topbar />

        <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
          <h1 className="text-3xl font-bold">My Profile</h1>

          <ProfileCard
            onUpdatePassword={() => setOpenPasswordModal(true)}
          />

          <TwoFactorCard />

          <UpdatePasswordDialog
            open={openPasswordModal}
            onOpenChange={setOpenPasswordModal}
          />
        </main>
      </div>
    </RequireAuth>
  );
}
