"use client";

import { useEffect, useMemo, useState } from "react";

type FoodItem = {
  _id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date?: string;
  createdAt?: string;
};

function fmtDate(x?: string) {
  if (!x) return "";
  const d = new Date(x);
  return d.toLocaleString();
}

export default function FoodPage() {
  // form
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  // list
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ui states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<FoodItem>>({});

  const canSubmit = useMemo(() => Number(calories) > 0, [calories]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/food");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Load failed");
      setItems(json?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Грешка при зареждане.");
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
      setError("Калориите трябва да са > 0.");
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
      if (!res.ok) throw new Error(json?.error ?? "Save failed");

      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");

      setOkMsg("Записано ✅");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Грешка при запис.");
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
      setError("Калориите трябва да са > 0.");
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
      if (!res.ok) throw new Error(json?.error ?? "Edit failed");

      setOkMsg("Запазено ✅");
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Грешка при edit.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setError(null);
    setOkMsg(null);

    if (!confirm("Сигурен ли си, че искаш да изтриеш записа?")) return;

    setSaving(true);
    try {
      console.log(id)
      const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Delete failed");

      setOkMsg("Изтрито ✅");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Неуспешно изтриване.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <h1 className="text-2xl font-semibold">Food Log</h1>

      {/* FORM */}
      <div className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Calories"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <input
            type="number"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
          <input
            type="number"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
          <input
            type="number"
            placeholder="Fat (g)"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>

        <button className="btn-primary w-fit" onClick={submit} disabled={saving || !canSubmit}>
          {saving ? "Saving..." : "Add entry"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {okMsg && <p className="text-green-600 text-sm">{okMsg}</p>}
      </div>

      {/* LIST */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Последни записи</h2>

        {loading ? (
          <p className="text-muted text-sm">Зареждане...</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-sm">Няма записи.</p>
        ) : (
          <div className="space-y-4">
            {items.map((it) => {
              const isEditing = editingId === it._id;

              return (
                <div key={it._id} className="border-b border-border pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted">{fmtDate(it.date ?? it.createdAt)}</p>

                      {!isEditing ? (
                        <>
                          <p className="font-semibold">{it.calories} kcal</p>
                          <p className="text-sm">
                            P: {it.protein}g • C: {it.carbs}g • F: {it.fat}g
                          </p>
                        </>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3 mt-2">
                          <input
                            type="number"
                            value={String(editDraft.calories ?? "")}
                            placeholder="Calories"
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, calories: Number(e.target.value) }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.protein ?? "")}
                            placeholder="Protein"
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, protein: Number(e.target.value) }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.carbs ?? "")}
                            placeholder="Carbs"
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, carbs: Number(e.target.value) }))
                            }
                          />
                          <input
                            type="number"
                            value={String(editDraft.fat ?? "")}
                            placeholder="Fat"
                            onChange={(e) =>
                              setEditDraft((p) => ({ ...p, fat: Number(e.target.value) }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-30">
                      {!isEditing ? (
                        <>
                          <button className="btn-secondary" onClick={() => startEdit(it)} disabled={saving}>
                            Edit
                          </button>
                          <button className="btn-secondary" onClick={() => deleteItem(it._id)} disabled={saving}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-primary" onClick={() => saveEdit(it._id)} disabled={saving}>
                            Save
                          </button>
                          <button className="btn-secondary" onClick={cancelEdit} disabled={saving}>
                            Cancel
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
