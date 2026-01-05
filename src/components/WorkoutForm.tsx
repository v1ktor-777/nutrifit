"use client";

import { useState } from "react";

export default function WorkoutForm({ onAdd }: { onAdd: () => void }) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        duration: Number(duration),
        calories: Number(calories),
      }),
    });

    setTitle("");
    setDuration("");
    setCalories("");
    onAdd();
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 24 }}>
      <h3>Add workout</h3>

      <input
        placeholder="Workout name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />

      <input
        type="number"
        placeholder="Duration (min)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <br />

      <input
        type="number"
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <br />

      <button type="submit">Add</button>
    </form>
  );
}
