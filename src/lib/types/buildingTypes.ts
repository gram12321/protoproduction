import type { RecipeType } from "./recipeTypes";

export type BuildingType = "farm";
export type BuildingSize = number;

export interface Building {
  id: string;
  type: BuildingType;
  size: BuildingSize;
  currentStaff: number;
  recipeType: RecipeType;
}
