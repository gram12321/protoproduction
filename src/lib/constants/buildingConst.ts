import type { BuildingType, RecipeType } from "@/lib/types";

export const INITIAL_BUILDING_SIZE = 1;

type BuildingConfig = {
  minWorkers: number;
  defaultRecipe: RecipeType;
  availableRecipes: RecipeType[];
};

export const FARM_BUILDING_CONFIG: BuildingConfig = {
  minWorkers: 2,
  defaultRecipe: "produce-grain",
  availableRecipes: ["produce-grain", "grow-sugarcain"],
};

export const FOOD_PROCESSING_FACTORY_BUILDING_CONFIG: BuildingConfig = {
  minWorkers: 2,
  defaultRecipe: "produce-flour",
  availableRecipes: ["produce-flour", "process-sugarcain"],
};

export const BAKERY_BUILDING_CONFIG: BuildingConfig = {
  minWorkers: 2,
  defaultRecipe: "bake-bread",
  availableRecipes: ["bake-bread", "bake-cake"],
};

export const UTILITY_FACILITY_BUILDING_CONFIG: BuildingConfig = {
  minWorkers: 2,
  defaultRecipe: "pump-water",
  availableRecipes: ["pump-water"],
};

export const BUILDING_CONFIG_BY_TYPE: Record<BuildingType, BuildingConfig> = {
  farm: FARM_BUILDING_CONFIG,
  foodprocessingfactory: FOOD_PROCESSING_FACTORY_BUILDING_CONFIG,
  bakery: BAKERY_BUILDING_CONFIG,
  utilityfacility: UTILITY_FACILITY_BUILDING_CONFIG,
};

export const STAFF_GROWTH_BASE = 2;
export const BASE_WAGE = 10;

export const STAFF_EFFICIENCY_CURVE_STEEPNESS = 1.2;
export const OVERSTAFF_EFFICIENCY_LOG_BONUS_MULTIPLIER = 0.2;
export const EFFICIENCY_TICK_LERP_MIN = 0.08;
export const EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER = 0.6;
export const EFFICIENCY_TICK_LERP_MAX = 0.75;

export const BASE_WORK_PER_WORKER_PER_TICK = 50;
