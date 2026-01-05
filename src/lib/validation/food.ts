import { z } from "zod";

export const FoodCreateSchema = z.object({
  name: z.string().trim().min(2, "Името е твърде кратко").max(60),
  calories: z.number().int().min(0).max(5000),
  protein: z.number().min(0).max(500).optional().default(0),
  carbs: z.number().min(0).max(500).optional().default(0),
  fat: z.number().min(0).max(500).optional().default(0),

  eatenAt: z.coerce.date().optional(), // приема string/Date
});

export type FoodCreateInput = z.infer<typeof FoodCreateSchema>;
