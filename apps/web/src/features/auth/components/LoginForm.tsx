"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useLogin, useVerifyTwoFactorLogin } from "../hooks/useAuth";
import { oauthUrl } from "../services/auth.service";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

  const login = useLogin();
  const verifyTwoFactor = useVerifyTwoFactorLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          if (result.twoFactorRequired) {
            setTwoFactorToken(result.twoFactorToken);
          } else {
            window.location.href = "/dashboard";
          }
        },
      }
    );
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!twoFactorToken) return;
    verifyTwoFactor.mutate({ twoFactorToken, code });
  }

  if (twoFactorToken) {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Enter the 6-digit code from your authenticator app
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Authentication code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
          />
        </div>
        <Button type="submit" className="w-full" disabled={verifyTwoFactor.isPending || code.length !== 6}>
          {verifyTwoFactor.isPending ? "Verifying…" : "Verify & sign in"}
        </Button>
        <button
          type="button"
          className="w-full text-center text-sm text-muted-foreground hover:underline"
          onClick={() => setTwoFactorToken(null)}
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" asChild>
          <a href={oauthUrl("google")}>Google</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={oauthUrl("github")}>GitHub</a>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
