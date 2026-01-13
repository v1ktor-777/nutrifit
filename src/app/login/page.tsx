"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="card space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("auth.login")}</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="login-email">
              {t("auth.email")}
            </label>
            <input
              id="login-email"
              placeholder={t("auth.email")}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="login-password">
              {t("auth.password")}
            </label>
            <input
              id="login-password"
              type="password"
              placeholder={t("auth.password")}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {t("auth.login")}
          </button>
        </form>
      </div>
    </div>
  );
}
