import type { ResourceType } from "./inventoryTypes";

export type RecipeType = "produce-grain" | "produce-flour";

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
  input?: RecipeInput;
  output: RecipeOutput;
}
