import type { BuildingType, RecipeType } from "@/lib/types";

export const INITIAL_BUILDING_SIZE = 1;

export const MIN_WORKERS_BY_BUILDING_TYPE: Record<BuildingType, number> = {
  farm: 2,
  mill: 2,
};

export const DEFAULT_RECIPE_BY_BUILDING_TYPE: Record<BuildingType, RecipeType> = {
  farm: "produce-grain",
  mill: "produce-flour",
};

export const STAFF_GROWTH_BASE = 2;

export const STAFF_EFFICIENCY_CURVE_STEEPNESS = 1.2;
export const EFFICIENCY_TICK_LERP_MIN = 0.08;
export const EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER = 0.6;
export const EFFICIENCY_TICK_LERP_MAX = 0.75;

export const BASE_WORK_PER_WORKER_PER_TICK = 50;