"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ProfileData = {
  name?: string | null;
  email?: string | null;
  heightCm?: number | null;
  sex?: "male" | "female" | null;
};

export default function ProfilePage() {
  const { t } = useI18n();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [heightCm, setHeightCm] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [editing, setEditing] = useState(false);

  const fmtSex = (value: ProfileData["sex"]) => {
    if (value === "male") return t("profile.sexMale");
    if (value === "female") return t("profile.sexFemale");
    return t("profile.sexNotSet");
  };

  const isProfileComplete = useMemo(() => {
    return Boolean(data?.heightCm) && Boolean(data?.sex);
  }, [data]);

  async function load() {
    setError(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch("/api/profile");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? t("profile.loadFailed"));
      }

      const d = (json?.data ?? null) as ProfileData | null;
      setData(d);

      const h = d?.heightCm;
      const s = d?.sex;

      setHeightCm(h === null || h === undefined ? "" : String(h));
      setSex(s === null || s === undefined ? "" : String(s));

      setEditing(false);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setError(null);
    setOk(null);

    const h = heightCm.trim() === "" ? null : Number(heightCm);

    if (h !== null && (!Number.isFinite(h) || h < 0)) {
      setError(t("profile.invalidHeight"));
      return;
    }

    if (sex !== "" && sex !== "male" && sex !== "female") {
      setError(t("profile.invalidSex"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: h,
          sex: sex === "" ? null : sex,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? t("profile.saveFailed"));
      }

      setOk(t("profile.saved"));
      await load();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">{t("common.loading")}</p>;
  if (!data) return <p className="text-muted">{t("profile.noData")}</p>;

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted">{t("profile.subtitle")}</p>
      </header>

      {(error || ok) && (
        <div
          className={`card text-sm ${
            error
              ? "border border-red-300 bg-red-50 text-red-700"
              : "border border-green-300 bg-green-50 text-green-700"
          }`}
        >
          {error ?? ok}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("profile.name")}</p>
          <p className="text-xl font-semibold">{data.name ?? t("common.notSet")}</p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("profile.email")}</p>
          <p className="text-xl font-semibold">{data.email ?? t("common.notSet")}</p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">{t("profile.body")}</p>
          <p className="text-sm text-muted">
            {t("profile.height")}:{" "}
            <span className="font-semibold text-foreground">
              {data.heightCm !== null && data.heightCm !== undefined
                ? `${data.heightCm} cm`
                : t("common.notSet")}
            </span>
          </p>
          <p className="text-sm text-muted">
            {t("profile.sex")}:{" "}
            <span className="font-semibold text-foreground">
              {fmtSex(data.sex)}
            </span>
          </p>
        </div>
      </div>

      <div className="card space-y-4 max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("profile.bodyInfoTitle")}</h2>
            <p className="text-sm text-muted">
              {isProfileComplete
                ? t("profile.bodyInfoComplete")
                : t("profile.bodyInfoIncomplete")}
            </p>
          </div>

          {isProfileComplete && !editing && (
            <button
              type="button"
              className="btn-secondary px-5 py-2"
              onClick={() => setEditing(true)}
            >
              {t("profile.edit")}
            </button>
          )}
        </div>

        {isProfileComplete && !editing ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm text-muted">{t("profile.height")}</span>
              <span className="font-semibold">
                {data.heightCm ?? t("common.noData")} cm
              </span>
            </div>

            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm text-muted">{t("profile.sex")}</span>
              <span className="font-semibold">{fmtSex(data.sex)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm text-muted">{t("profile.heightLabel")}</label>
            <input
              type="number"
              min={0}
              step="1"
              placeholder={t("profile.heightPlaceholder")}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />

            <label className="text-sm text-muted">{t("profile.sexLabel")}</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">{t("profile.sexNotSet")}</option>
              <option value="male">{t("profile.sexMale")}</option>
              <option value="female">{t("profile.sexFemale")}</option>
            </select>

            <div className="flex items-center gap-3 pt-2">
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving
                  ? t("profile.saving")
                  : isProfileComplete
                  ? t("profile.saveChanges")
                  : t("profile.save")}
              </button>

              {isProfileComplete && editing && (
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setHeightCm(data.heightCm == null ? "" : String(data.heightCm));
                    setSex(data.sex == null ? "" : String(data.sex));
                    setError(null);
                    setOk(null);
                  }}
                >
                  {t("profile.cancel")}
                </button>
              )}
            </div>

            <p className="text-xs text-muted">{t("profile.formHint")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
