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
    <form onSubmit={handleLogin}>
      <input
        placeholder={t("auth.email")}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder={t("auth.password")}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">{t("auth.login")}</button>
    </form>
  );
}
