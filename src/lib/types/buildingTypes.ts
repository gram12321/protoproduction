import type { CityType, NationType } from "./locationTypes";
import type { RecipeType } from "./recipeTypes";

export type BuildingType =
  | "farm"
  | "foodprocessingfactory"
  | "bakery"
  | "utilityfacility";
export type BuildingSize = number;

export interface Building {
  id: string;
  type: BuildingType;
  size: BuildingSize;
  currentStaff: number;
  previousEfficiency: number;
  targetEfficiency: number;
  currentEfficiency: number;
  currentRecipeWorkProgress: number;
  recipeType: RecipeType;
  city: CityType;
  nation: NationType;
}
