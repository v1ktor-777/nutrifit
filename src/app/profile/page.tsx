"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileData = {
  name?: string | null;
  email?: string | null;
  heightCm?: number | null;
  sex?: "male" | "female" | null;
};

function fmtSex(sex: ProfileData["sex"]) {
  if (sex === "male") return "Male";
  if (sex === "female") return "Female";
  return "Not set";
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [heightCm, setHeightCm] = useState<string>("");
  const [sex, setSex] = useState<string>("");

  // ✅ locked by default once filled, but can be unlocked via Edit button
  const [editing, setEditing] = useState(false);

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
        throw new Error(json?.error ?? "Failed to load profile");
      }

      const d = (json?.data ?? null) as ProfileData | null;
      setData(d);

      const h = d?.heightCm;
      const s = d?.sex;

      setHeightCm(h === null || h === undefined ? "" : String(h));
      setSex(s === null || s === undefined ? "" : String(s));

      // ако има данни – заключваме (освен ако user натисне Edit)
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

    // ✅ 0+ (ако искаш >0, кажи)
    if (h !== null && (!Number.isFinite(h) || h < 0)) {
      setError("Height must be 0 or more.");
      return;
    }

    if (sex !== "" && sex !== "male" && sex !== "female") {
      setError("Invalid sex value.");
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
        throw new Error(json?.error ?? "Failed to save");
      }

      setOk("Saved ✅");
      await load();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">Зареждане...</p>;
  if (!data) return <p className="text-muted">Няма профилни данни.</p>;

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted">
          Управление на профилната информация и настройки
        </p>
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

      {/* Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-sm text-muted">Name</p>
          <p className="text-xl font-semibold">{data.name ?? "Not set"}</p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">Email</p>
          <p className="text-xl font-semibold">{data.email ?? "Not set"}</p>
        </div>

        <div className="card space-y-2">
          <p className="text-sm text-muted">Body</p>
          <p className="text-sm text-muted">
            Height:{" "}
            <span className="font-semibold text-foreground">
              {data.heightCm !== null && data.heightCm !== undefined
                ? `${data.heightCm} cm`
                : "Not set"}
            </span>
          </p>
          <p className="text-sm text-muted">
            Sex:{" "}
            <span className="font-semibold text-foreground">
              {fmtSex(data.sex)}
            </span>
          </p>
        </div>
      </div>

      {/* Body info */}
      <div className="card space-y-4 max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Body info</h2>
            <p className="text-sm text-muted">
              {isProfileComplete
                ? "Данните са заключени. Натисни Edit ако трябва корекция."
                : "Попълни данните си веднъж, за да изчисляваме BMI в Body Stats."}
            </p>
          </div>

          {isProfileComplete && !editing && (
            <button
              type="button"
              className="btn-secondary px-5 py-2"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* Read-only view when complete and not editing */}
        {isProfileComplete && !editing ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm text-muted">Height</span>
              <span className="font-semibold">
                {data.heightCm ?? "—"} cm
              </span>
            </div>

            <div className="flex items-center justify-between border border-border rounded-lg p-3">
              <span className="text-sm text-muted">Sex</span>
              <span className="font-semibold">{fmtSex(data.sex)}</span>
            </div>
          </div>
        ) : (
          // Edit/Setup form
          <div className="space-y-3">
            <label className="text-sm text-muted">Height (cm)</label>
            <input
              type="number"
              min={0}
              step="1"
              placeholder="e.g. 175"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />

            <label className="text-sm text-muted">Sex</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <div className="flex items-center gap-3 pt-2">
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : isProfileComplete ? "Save changes" : "Save"}
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
                  Cancel
                </button>
              )}
            </div>

            <p className="text-xs text-muted">
              Височината трябва да е от 0 нагоре. Полът се пази в профила.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
