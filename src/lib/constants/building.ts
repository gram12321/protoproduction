import type { BuildingType } from "@/lib/types";

export const MIN_WORKERS_BY_BUILDING_TYPE: Record<BuildingType, number> = {
  farm: 2,
};

export const STAFF_GROWTH_BASE = 2;

export const STAFF_EFFICIENCY_CURVE_STEEPNESS = 1.2;
export const EFFICIENCY_TICK_LERP_MIN = 0.08;
export const EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER = 0.6;
export const EFFICIENCY_TICK_LERP_MAX = 0.75;