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
    <div style={{ padding: 24 }}>
      <h1>{t("auth.register")}</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("auth.name")}
          value={form.name}
          onChange={handleChange}
        />
        <br />

        <input
          name="email"
          placeholder={t("auth.email")}
          value={form.email}
          onChange={handleChange}
        />
        <br />

        <input
          type="password"
          name="password"
          placeholder={t("auth.password")}
          value={form.password}
          onChange={handleChange}
        />
        <br />

        <button type="submit">{t("auth.register")}</button>
      </form>
    </div>
  );
}
