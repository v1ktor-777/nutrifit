"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      alert(t("auth.registerFailed"));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("auth.register")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="register-name">
              {t("auth.name")}
            </label>
            <input
              id="register-name"
              name="name"
              placeholder={t("auth.name")}
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="register-email">
              {t("auth.email")}
            </label>
            <input
              id="register-email"
              name="email"
              placeholder={t("auth.email")}
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="register-password">
              {t("auth.password")}
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder={t("auth.password")}
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {t("auth.register")}
          </button>
        </form>
      </div>
    </div>
  );
}
