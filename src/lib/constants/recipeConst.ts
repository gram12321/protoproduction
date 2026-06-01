import type { ProductionRecipe } from "@/lib/types";

export const GRAIN_PER_PRODUCE_GRAIN_RECIPE = 1;
export const PRODUCE_GRAIN_RECIPE_WORK_REQUIRED = 100;

export const PRODUCE_GRAIN_RECIPE: ProductionRecipe = {
  type: "produce-grain",
  name: "Produce Grain",
  workRequired: PRODUCE_GRAIN_RECIPE_WORK_REQUIRED,
  output: {
    resource: "grain",
    amount: GRAIN_PER_PRODUCE_GRAIN_RECIPE,
  },
};

export const RECIPE_BY_TYPE = {
  [PRODUCE_GRAIN_RECIPE.type]: PRODUCE_GRAIN_RECIPE,
} as const;
