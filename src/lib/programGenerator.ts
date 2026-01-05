type Inputs = {
  goal: "cut" | "bulk" | "maintain";
  level: "beginner" | "intermediate";
  daysPerWeek: number;
  equipment: "gym" | "home";
};

export function generateProgram(inputs: Inputs) {
  const { level, daysPerWeek, equipment } = inputs;

  // simple presets (можем да ги разширим после)
  const base = equipment === "gym"
    ? {
        push: ["Bench Press", "Incline DB Press", "Overhead Press", "Triceps Pushdown"],
        pull: ["Pull-ups/Lat Pulldown", "Barbell Row", "Face Pull", "Biceps Curl"],
        legs: ["Squat", "Romanian Deadlift", "Leg Press", "Calf Raises"],
        full: ["Squat", "Bench Press", "Row", "Plank"],
      }
    : {
        push: ["Push-ups", "Pike Push-ups", "Dips (chair)", "Triceps Extensions"],
        pull: ["Pull-ups (bar)", "Inverted Rows", "Rear Delt Raises", "Biceps Curl (band)"],
        legs: ["Goblet Squat", "Lunges", "Hip Hinge (DB/band)", "Calf Raises"],
        full: ["Squat", "Push-ups", "Rows", "Plank"],
      };

  const sets = level === "beginner" ? 3 : 4;

  const makeExercises = (names: string[]) =>
    names.map((name) => ({ name, sets, reps: level === "beginner" ? "8-12" : "6-10" }));

  // choose split
  if (daysPerWeek <= 3) {
    return [
      { day: "Day 1", focus: "Full Body", exercises: makeExercises(base.full) },
      { day: "Day 2", focus: "Full Body", exercises: makeExercises(base.full) },
      { day: "Day 3", focus: "Full Body", exercises: makeExercises(base.full) },
    ];
  }

  if (daysPerWeek === 4) {
    return [
      { day: "Day 1", focus: "Upper", exercises: makeExercises([...base.push, ...base.pull]) },
      { day: "Day 2", focus: "Lower", exercises: makeExercises(base.legs) },
      { day: "Day 3", focus: "Upper", exercises: makeExercises([...base.push, ...base.pull]) },
      { day: "Day 4", focus: "Lower", exercises: makeExercises(base.legs) },
    ];
  }

  // 5-6 => PPL
  const ppl = [
    { day: "Day 1", focus: "Push", exercises: makeExercises(base.push) },
    { day: "Day 2", focus: "Pull", exercises: makeExercises(base.pull) },
    { day: "Day 3", focus: "Legs", exercises: makeExercises(base.legs) },
    { day: "Day 4", focus: "Push", exercises: makeExercises(base.push) },
    { day: "Day 5", focus: "Pull", exercises: makeExercises(base.pull) },
    { day: "Day 6", focus: "Legs", exercises: makeExercises(base.legs) },
  ];

  return ppl.slice(0, daysPerWeek);
}
