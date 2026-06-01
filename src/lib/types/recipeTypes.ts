import type { ResourceType } from "./inventoryTypes";

export type RecipeType = "produce-grain";

export interface RecipeOutput {
  resource: ResourceType;
  amount: number;
}

export interface ProductionRecipe {
  type: RecipeType;
  name: string;
  workRequired: number;
  output: RecipeOutput;
}
