"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type FoodItem = {
  _id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date?: string;
  createdAt?: string;
};

function fmtDate(x?: string, locale?: string) {
  if (!x) return "";
  const d = new Date(x);
  return d.toLocaleString(locale || undefined);
}

function formatMessage(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}

export default function FoodPage() {
  const { t, lang } = useI18n();
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<FoodItem>>({});

  const canSubmit = useMemo(() => Number(calories) > 0, [calories]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/food");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? t("food.loadFailed"));
      setItems(json?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? t("food.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setError(null);
    setOkMsg(null);
    if (!canSubmit) {
      setError(t("food.invalidCalories"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? t("food.saveFailed"));

      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");

      setOkMsg(t("food.saved"));
      await load();
    } catch (e: any) {
      setError(e?.message ?? t("food.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: FoodItem) {
    setError(null);
    setOkMsg(null);
    setEditingId(item._id);
    setEditDraft({
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  async function saveEdit(id: string) {
    setError(null);
    setOkMsg(null);

    const cals = Number(editDraft.calories);
    if (!Number.isFinite(cals) || cals <= 0) {
      setError(t("food.invalidCalories"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/food/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(editDraft.calories) || 0,
          protein: Number(editDraft.protein) || 0,
          carbs: Number(editDraft.carbs) || 0,
          fat: Number(editDraft.fat) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? t("food.editFailed"));

      setOkMsg(t("food.updated"));
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e?.message ?? t("food.editFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setError(null);
    setOkMsg(null);

    if (!confirm(t("food.confirmDelete"))) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? t("food.deleteFailed"));

      setOkMsg(t("food.deleted"));
      await load();
    } catch (e: any) {
      setError(e?.message ?? t("food.deleteFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <h1 className="text-2xl font-semibold">{t("food.title")}</h1>

      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder={t("food.caloriesPlaceholder")}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <input
            type="number"
            placeholder={t("food.proteinPlaceholder")}
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
          <input
            type="number"
            placeholder={t("food.carbsPlaceholder")}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
          <input
            type="number"
            placeholder={t("food.fatPlaceholder")}
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>

        <button className="btn-primary w-fit" onClick={submit} disabled={saving || !canSubmit}>
          {saving ? t("food.saving") : t("food.addEntry")}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {okMsg && <p className="text-green-600 text-sm">{okMsg}</p>}
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">{t("food.listTitle")}</h2>

        {loading ? (
          <p className="text-muted text-sm">{t("common.loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-sm">{t("food.listEmpty")}</p>
        ) : (
          <div className="space-y-4">
            {items.map((it) => {
              const isEditing = editingId === it._id;

              return (
                <div key={it._id} className="border-b border-border pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted">
                        {fmtDate(it.date ?? it.createdAt, lang)}
                      </p>

                      {!isEditing ? (
                        <>
                          <p className="font-semibold">{it.calories} kcal</p>
                          <p className="text-sm">
                            {formatMessage(t("food.macros"), {
                              protein: it.protein,
                              carbs: it.carbs,
                              fat: it.fat,
                            })}
                          </p>
                        </>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <input
                            type="number"
                            value={String(editDraft.calories ?? "")}
                            placeholder={t("food.caloriesPlaceholder")}
                            onChange={(e) =>
                              setEditDraft((p) => ({
                                ...p,
                                calories: Number(e.target.value),
                              }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.protein ?? "")}
                            placeholder={t("food.proteinPlaceholder")}
                            onChange={(e) =>
                              setEditDraft((p) => ({
                                ...p,
                                protein: Number(e.target.value),
                              }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.carbs ?? "")}
                            placeholder={t("food.carbsPlaceholder")}
                            onChange={(e) =>
                              setEditDraft((p) => ({
                                ...p,
                                carbs: Number(e.target.value),
                              }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.fat ?? "")}
                            placeholder={t("food.fatPlaceholder")}
                            onChange={(e) =>
                              setEditDraft((p) => ({
                                ...p,
                                fat: Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-30">
                      {!isEditing ? (
                        <>
                          <button
                            className="btn-secondary"
                            onClick={() => startEdit(it)}
                            disabled={saving}
                          >
                            {t("common.edit")}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => deleteItem(it._id)}
                            disabled={saving}
                          >
                            {t("common.delete")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-primary"
                            onClick={() => saveEdit(it._id)}
                            disabled={saving}
                          >
                            {t("common.save")}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            {t("common.cancel")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
