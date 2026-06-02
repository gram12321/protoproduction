import type { ProductionRecipe } from "@/lib/types";

export const GRAIN_PER_PRODUCE_GRAIN_RECIPE = 1;
export const PRODUCE_GRAIN_RECIPE_WORK_REQUIRED = 100;
export const GRAIN_PER_PRODUCE_FLOUR_RECIPE = 1;
export const FLOUR_PER_PRODUCE_FLOUR_RECIPE = 1;
export const PRODUCE_FLOUR_RECIPE_WORK_REQUIRED = 100;
export const SUGARCAIN_PER_GROW_SUGARCAIN_RECIPE = 1;
export const GROW_SUGARCAIN_RECIPE_WORK_REQUIRED = 120;
export const SUGARCAIN_PER_PROCESS_SUGARCAIN_RECIPE = 1;
export const SUGAR_PER_PROCESS_SUGARCAIN_RECIPE = 1;
export const PROCESS_SUGARCAIN_RECIPE_WORK_REQUIRED = 100;
export const FLOUR_PER_BAKE_BREAD_RECIPE = 1;
export const BREAD_PER_BAKE_BREAD_RECIPE = 1;
export const BAKE_BREAD_RECIPE_WORK_REQUIRED = 120;
export const FLOUR_PER_BAKE_CAKE_RECIPE = 2;
export const SUGAR_PER_BAKE_CAKE_RECIPE = 1;
export const CAKE_PER_BAKE_CAKE_RECIPE = 1;
export const BAKE_CAKE_RECIPE_WORK_REQUIRED = 180;

export const PRODUCE_GRAIN_RECIPE: ProductionRecipe = {
  type: "produce-grain",
  name: "Grow Grain",
  workRequired: PRODUCE_GRAIN_RECIPE_WORK_REQUIRED,
  output: {
    resource: "grain",
    amount: GRAIN_PER_PRODUCE_GRAIN_RECIPE,
  },
};

export const PRODUCE_FLOUR_RECIPE: ProductionRecipe = {
  type: "produce-flour",
  name: "Grind Flour",
  workRequired: PRODUCE_FLOUR_RECIPE_WORK_REQUIRED,
  input: [
    {
      resource: "grain",
      amount: GRAIN_PER_PRODUCE_FLOUR_RECIPE,
    },
  ],
  output: {
    resource: "flour",
    amount: FLOUR_PER_PRODUCE_FLOUR_RECIPE,
  },
};

export const GROW_SUGARCAIN_RECIPE: ProductionRecipe = {
  type: "grow-sugarcain",
  name: "Grow Sugarcain",
  workRequired: GROW_SUGARCAIN_RECIPE_WORK_REQUIRED,
  output: {
    resource: "sugarcain",
    amount: SUGARCAIN_PER_GROW_SUGARCAIN_RECIPE,
  },
};

export const PROCESS_SUGARCAIN_RECIPE: ProductionRecipe = {
  type: "process-sugarcain",
  name: "Process Sugarcain",
  workRequired: PROCESS_SUGARCAIN_RECIPE_WORK_REQUIRED,
  input: [
    {
      resource: "sugarcain",
      amount: SUGARCAIN_PER_PROCESS_SUGARCAIN_RECIPE,
    },
  ],
  output: {
    resource: "sugar",
    amount: SUGAR_PER_PROCESS_SUGARCAIN_RECIPE,
  },
};

export const BAKE_BREAD_RECIPE: ProductionRecipe = {
  type: "bake-bread",
  name: "Bake Bread",
  workRequired: BAKE_BREAD_RECIPE_WORK_REQUIRED,
  input: [
    {
      resource: "flour",
      amount: FLOUR_PER_BAKE_BREAD_RECIPE,
    },
  ],
  output: {
    resource: "bread",
    amount: BREAD_PER_BAKE_BREAD_RECIPE,
  },
};

export const BAKE_CAKE_RECIPE: ProductionRecipe = {
  type: "bake-cake",
  name: "Bake Cake",
  workRequired: BAKE_CAKE_RECIPE_WORK_REQUIRED,
  input: [
    {
      resource: "flour",
      amount: FLOUR_PER_BAKE_CAKE_RECIPE,
    },
    {
      resource: "sugar",
      amount: SUGAR_PER_BAKE_CAKE_RECIPE,
    },
  ],
  output: {
    resource: "cake",
    amount: CAKE_PER_BAKE_CAKE_RECIPE,
  },
};

export const RECIPE_BY_TYPE = {
  [PRODUCE_GRAIN_RECIPE.type]: PRODUCE_GRAIN_RECIPE,
  [PRODUCE_FLOUR_RECIPE.type]: PRODUCE_FLOUR_RECIPE,
  [GROW_SUGARCAIN_RECIPE.type]: GROW_SUGARCAIN_RECIPE,
  [PROCESS_SUGARCAIN_RECIPE.type]: PROCESS_SUGARCAIN_RECIPE,
  [BAKE_BREAD_RECIPE.type]: BAKE_BREAD_RECIPE,
  [BAKE_CAKE_RECIPE.type]: BAKE_CAKE_RECIPE,
} as const;
