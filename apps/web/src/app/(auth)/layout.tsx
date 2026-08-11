import Link from "next/link";
import { Database } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blueprint-grid flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Database className="h-6 w-6 text-primary" />
          Schema Designer
        </Link>
        <div className="rounded-lg border bg-card p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
