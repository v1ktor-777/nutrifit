"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type BodyStat = {
  _id: string;
  date: string;
  weight: number;
};

type ProfileData = {
  heightCm?: number | null;
  sex?: "male" | "female" | null;
};

function calcBmi(weightKg: number, heightCm: number) {
  const h = heightCm / 100;
  if (h <= 0) return null;
  return weightKg / (h * h);
}

export default function ProgressPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<BodyStat[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weight, setWeight] = useState<string>("");

  const latest = useMemo(() => {
    if (!items.length) return null;
    return items[items.length - 1];
  }, [items]);

  const heightCm = profile?.heightCm ?? null;

  const latestBmi = useMemo(() => {
    if (!latest || !heightCm) return null;
    const bmi = calcBmi(latest.weight, heightCm);
    if (!bmi || !Number.isFinite(bmi)) return null;
    return bmi;
  }, [latest, heightCm]);

  const bmiLabel = (bmi: number) => {
    if (bmi < 18.5) return t("progress.bmiUnderweight");
    if (bmi < 25) return t("progress.bmiNormal");
    if (bmi < 30) return t("progress.bmiOverweight");
    return t("progress.bmiObesity");
  };

  async function load() {
    setError(null);
    setLoading(true);

    try {
      const [statsRes, profileRes] = await Promise.all([
        fetch("/api/body-stats?days=30"),
        fetch("/api/profile"),
      ]);

      if (!statsRes.ok) {
        const txt = await statsRes.text().catch(() => "");
        throw new Error(`GET /api/body-stats -> ${statsRes.status} ${txt}`);
      }

      if (!profileRes.ok) {
        const txt = await profileRes.text().catch(() => "");
        throw new Error(`GET /api/profile -> ${profileRes.status} ${txt}`);
      }

      const statsJson = await statsRes.json();
      const profileJson = await profileRes.json();

      setItems(statsJson?.data ?? []);
      setProfile(profileJson?.data ?? null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setItems([]);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setError(null);

    const w = Number(weight);

    if (!Number.isFinite(w) || w <= 0) {
      setError(t("progress.invalidWeight"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/body-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`POST /api/body-stats -> ${res.status} ${txt}`);
      }

      setWeight("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("progress.title")}
        </h1>
        <p className="text-muted">{t("progress.subtitle")}</p>
      </header>

      {error && (
        <div className="card border border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.latestWeight")}</p>
          <p className="text-2xl font-semibold">
            {latest ? `${latest.weight} kg` : t("common.noData")}
          </p>
          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {latest?.date ?? t("progress.noWeight")}
          </span>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.bmi")}</p>
          <p className="text-2xl font-semibold">
            {latestBmi ? latestBmi.toFixed(1) : t("common.noData")}
          </p>
          <p className="text-sm text-muted">
            {latestBmi
              ? bmiLabel(latestBmi)
              : heightCm
              ? t("progress.noWeight")
              : t("progress.heightMissing")}
          </p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("progress.heightFromProfile")}</p>
          <p className="text-2xl font-semibold">
            {heightCm ? `${heightCm} cm` : t("common.noData")}
          </p>
          <span className="inline-block text-xs px-2 py-1 rounded bg-muted">
            {t("progress.profile")}
          </span>
        </div>
      </div>

      <div className="card space-y-4 max-w-md">
        <h2 className="text-lg font-semibold">{t("progress.logTitle")}</h2>

        <input
          type="number"
          step="0.1"
          min={0}
          placeholder={t("progress.weightPlaceholder")}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? t("progress.saving") : t("progress.save")}
        </button>

        <p className="text-xs text-muted">{t("progress.hint")}</p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">{t("progress.historyTitle")}</h2>

        {items.length === 0 ? (
          <p className="text-sm text-muted">{t("progress.historyEmpty")}</p>
        ) : (
          <div className="space-y-2">
            {items
              .slice()
              .reverse()
              .map((x) => (
                <div
                  key={x._id}
                  className="flex items-center justify-between border-b border-border/60 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{x.date}</span>
                  </div>

                  <div className="text-sm text-muted flex items-center gap-3">
                    <span>{x.weight} kg</span>
                    {heightCm ? (
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        BMI {(calcBmi(x.weight, heightCm) ?? 0).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
