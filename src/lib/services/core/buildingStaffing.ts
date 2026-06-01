import { MIN_WORKERS_BY_BUILDING_TYPE, STAFF_GROWTH_BASE } from "@/lib/constants";
import type { BuildingSize, BuildingType } from "@/lib/types";

export function getMinimumWorkersForBuildingType(type: BuildingType): number {
  return MIN_WORKERS_BY_BUILDING_TYPE[type];
}

export function calculateMaxStaff(
  type: BuildingType,
  size: BuildingSize,
): number {
  const safeSize = Math.max(1, Math.floor(size));
  const minimumWorkers = getMinimumWorkersForBuildingType(type);
  const scaledMax = Math.floor(
    minimumWorkers * Math.pow(STAFF_GROWTH_BASE, safeSize - 1),
  );

  return Math.max(minimumWorkers, scaledMax);
}