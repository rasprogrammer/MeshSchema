"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { useConfirmTwoFactor, useDisableTwoFactor, useSetupTwoFactor } from "../hooks/useTwoFactor";

export function TwoFactorCard() {
  const user = useAuthStore((s) => s.user);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const setup = useSetupTwoFactor();
  const confirm = useConfirmTwoFactor();
  const disable = useDisableTwoFactor();

  const enabled = !!user?.twoFactorEnabled;

  function startSetup() {
    setup.mutate(undefined, { onSuccess: (res) => setQrCodeDataUrl(res.qrCodeDataUrl) });
  }

  function confirmSetup() {
    confirm.mutate(code, {
      onSuccess: () => {
        setQrCodeDataUrl(null);
        setCode("");
      },
    });
  }

  function handleDisable() {
    disable.mutate(code, { onSuccess: () => setCode("") });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {enabled ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
          Two-factor authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "2FA is enabled. Every sign-in requires a 6-digit code from your authenticator app."
            : "Add an authenticator app (Google Authenticator, Authy, 1Password) as a second factor for sign-in."}
        </p>

        {!enabled && !qrCodeDataUrl && (
          <Button variant="outline" onClick={startSetup} disabled={setup.isPending}>
            {setup.isPending ? "Generating…" : "Enable 2FA"}
          </Button>
        )}

        {!enabled && qrCodeDataUrl && (
          <div className="space-y-3">
            <p className="text-sm">Scan this QR code with your authenticator app, then enter the code it shows.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it */}
            <img src={qrCodeDataUrl} alt="TOTP QR code" className="h-40 w-40 rounded-md border bg-white p-2" />
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="confirm-code">6-digit code</Label>
                <Input
                  id="confirm-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>
              <Button onClick={confirmSetup} disabled={confirm.isPending || code.length !== 6}>
                {confirm.isPending ? "Confirming…" : "Confirm"}
              </Button>
            </div>
          </div>
        )}

        {enabled && (
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="disable-code">Enter a code to disable</Label>
              <Input
                id="disable-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </div>
            <Button variant="destructive" onClick={handleDisable} disabled={disable.isPending || code.length !== 6}>
              {disable.isPending ? "Disabling…" : "Disable 2FA"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
