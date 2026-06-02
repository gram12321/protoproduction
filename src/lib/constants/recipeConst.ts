import type { ProductionRecipe } from "@/lib/types";

export const PRODUCE_GRAIN_RECIPE: ProductionRecipe = {
  type: "produce-grain",
  name: "Produce Grain",
  workRequired: 100,
  output: {
    resource: "grain",
    amount: 1,
  },
};

export const PRODUCE_FLOUR_RECIPE: ProductionRecipe = {
  type: "produce-flour",
  name: "Produce Flour",
  workRequired: 100,
  input: {
    resource: "grain",
    amount: 1,
  },
  output: {
    resource: "flour",
    amount: 1,
  },
};

export const RECIPE_BY_TYPE = {
  [PRODUCE_GRAIN_RECIPE.type]: PRODUCE_GRAIN_RECIPE,
  [PRODUCE_FLOUR_RECIPE.type]: PRODUCE_FLOUR_RECIPE,
} as const;
