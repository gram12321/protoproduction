import type { ProductionRecipe } from "@/lib/types";

export const GRAIN_PER_PRODUCE_GRAIN_RECIPE = 1;
export const PRODUCE_GRAIN_RECIPE_DURATION_TICKS = 1;

export const PRODUCE_GRAIN_RECIPE: ProductionRecipe = {
  type: "produce-grain",
  name: "Produce Grain",
  durationTicks: PRODUCE_GRAIN_RECIPE_DURATION_TICKS,
  output: {
    resource: "grain",
    amount: GRAIN_PER_PRODUCE_GRAIN_RECIPE,
  },
};

export const RECIPE_BY_TYPE = {
  [PRODUCE_GRAIN_RECIPE.type]: PRODUCE_GRAIN_RECIPE,
} as const;
