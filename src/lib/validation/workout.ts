import { z } from "zod";

export const WorkoutCreateSchema = z.object({
  title: z.string().trim().min(2).max(80),
  duration: z.number().int().min(1).max(600),
  calories: z.number().int().min(0).max(5000),
  date: z.coerce.date().optional(),
});
