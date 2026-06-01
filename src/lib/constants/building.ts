import type { BuildingType } from "@/lib/types";

export const MIN_WORKERS_BY_BUILDING_TYPE: Record<BuildingType, number> = {
  farm: 2,
};

export const STAFF_GROWTH_BASE = 2;