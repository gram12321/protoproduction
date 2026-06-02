import type { ResourceType } from "./resourceTypes";

export type RecipeType =
  | "produce-grain"
  | "pump-water"
  | "produce-flour"
  | "grow-sugarcain"
  | "process-sugarcain"
  | "bake-bread"
  | "bake-cake";

export interface RecipeInput {
  resource: ResourceType;
  amount: number;
}

export interface RecipeOutput {
  resource: ResourceType;
  amount: number;
}

export interface ProductionRecipe {
  type: RecipeType;
  name: string;
  workRequired: number;
  input?: RecipeInput[];
  output: RecipeOutput;
}
