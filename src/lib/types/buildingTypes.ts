import type { RecipeType } from "./recipeTypes";

export type BuildingType = "farm";

export interface Building {
  id: string;
  type: BuildingType;
  recipeType: RecipeType;
}
