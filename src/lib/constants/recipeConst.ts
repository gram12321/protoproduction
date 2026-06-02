import type { ProductionRecipe } from "@/lib/types";

export const PRODUCE_GRAIN_RECIPE: ProductionRecipe = {
  type: "produce-grain",
  name: "Grow Grain",
  workRequired: 100,
  output: {
    resource: "grain",
    amount: 1,
  },
};

export const PUMP_WATER_RECIPE: ProductionRecipe = {
  type: "pump-water",
  name: "Pump Water",
  workRequired: 80,
  output: {
    resource: "water",
    amount: 1,
  },
};

export const PRODUCE_FLOUR_RECIPE: ProductionRecipe = {
  type: "produce-flour",
  name: "Grind Flour",
  workRequired: 100,
  input: [
    {
      resource: "grain",
      amount: 1,
    },
  ],
  output: {
    resource: "flour",
    amount: 1,
  },
};

export const GROW_SUGARCAIN_RECIPE: ProductionRecipe = {
  type: "grow-sugarcain",
  name: "Grow Sugarcain",
  workRequired: 120,
  output: {
    resource: "sugarcain",
    amount: 1,
  },
};

export const PROCESS_SUGARCAIN_RECIPE: ProductionRecipe = {
  type: "process-sugarcain",
  name: "Process Sugarcain",
  workRequired: 100,
  input: [
    {
      resource: "sugarcain",
      amount: 1,
    },
  ],
  output: {
    resource: "sugar",
    amount: 1,
  },
};

export const BAKE_BREAD_RECIPE: ProductionRecipe = {
  type: "bake-bread",
  name: "Bake Bread",
  workRequired: 120,
  input: [
    {
      resource: "flour",
      amount: 1,
    },
  ],
  output: {
    resource: "bread",
    amount: 1,
  },
};

export const BAKE_CAKE_RECIPE: ProductionRecipe = {
  type: "bake-cake",
  name: "Bake Cake",
  workRequired: 180,
  input: [
    {
      resource: "flour",
      amount: 2,
    },
    {
      resource: "sugar",
      amount: 1,
    },
  ],
  output: {
    resource: "cake",
    amount: 1,
  },
};

export const RECIPE_BY_TYPE = {
  [PRODUCE_GRAIN_RECIPE.type]: PRODUCE_GRAIN_RECIPE,
  [PUMP_WATER_RECIPE.type]: PUMP_WATER_RECIPE,
  [PRODUCE_FLOUR_RECIPE.type]: PRODUCE_FLOUR_RECIPE,
  [GROW_SUGARCAIN_RECIPE.type]: GROW_SUGARCAIN_RECIPE,
  [PROCESS_SUGARCAIN_RECIPE.type]: PROCESS_SUGARCAIN_RECIPE,
  [BAKE_BREAD_RECIPE.type]: BAKE_BREAD_RECIPE,
  [BAKE_CAKE_RECIPE.type]: BAKE_CAKE_RECIPE,
} as const;
