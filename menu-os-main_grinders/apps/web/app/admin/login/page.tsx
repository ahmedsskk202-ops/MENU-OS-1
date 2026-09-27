"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AdminLocaleToggle } from "@/components/admin/AdminLocaleToggle";
import { GrindersLogo } from "@/components/brand/GrindersLogo";
import { useLocale } from "@/lib/LocaleContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLocale();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("admin.login.invalid"));
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="fixed top-4 end-4 flex items-center gap-2">
        <AdminLocaleToggle />
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm p-8">
        <div className="mb-4 flex items-center justify-center">
          <GrindersLogo className="h-12 w-12" />
        </div>
        <p className="text-center text-xs uppercase tracking-widest text-accent-ink font-semibold mb-1">Coffee House · Baghdad</p>
        <h1 className="font-display text-2xl font-semibold mb-6 text-center">{t("admin.login.title")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("admin.common.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("admin.login.password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {t("admin.login.submit")}
          </Button>
        </form>
      </Card>
      <p dir="ltr" className="fixed bottom-4 inset-x-0 text-center text-xs tracking-wide text-muted-foreground">
        Powered by <span className="font-semibold text-accent-ink">ORVYQ CO.</span>
      </p>
    </div>
  );
}
