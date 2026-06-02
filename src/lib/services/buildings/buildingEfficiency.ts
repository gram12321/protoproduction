import {
  EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER,
  EFFICIENCY_TICK_LERP_MAX,
  EFFICIENCY_TICK_LERP_MIN,
  STAFF_EFFICIENCY_CURVE_STEEPNESS,
} from "@/lib/constants";
import type { Building } from "@/lib/types";
import { calculateMaxStaff } from "./buildingStaffing";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function calculateTargetEfficiencyFromStaffing(
  currentStaff: number,
  maxStaff: number,
): number {
  if (maxStaff <= 0) {
    return 0;
  }

  const staffingRatio = Math.max(0, currentStaff / maxStaff);
  const rawTarget = 1 - Math.exp(-staffingRatio * STAFF_EFFICIENCY_CURVE_STEEPNESS);

  return clamp01(rawTarget);
}

export function updateBuildingEfficiency(building: Building): Building {
  const maxStaff = calculateMaxStaff(building.type, building.size);
  const targetEfficiency = calculateTargetEfficiencyFromStaffing(
    building.currentStaff,
    maxStaff,
  );
  const currentEfficiency = clamp01(building.currentEfficiency);
  const delta = targetEfficiency - currentEfficiency;

  const lerpFactor = Math.min(
    EFFICIENCY_TICK_LERP_MAX,
    EFFICIENCY_TICK_LERP_MIN +
      Math.abs(delta) * EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER,
  );

  const nextCurrentEfficiency = clamp01(currentEfficiency + delta * lerpFactor);

  return {
    ...building,
    previousEfficiency: currentEfficiency,
    targetEfficiency,
    currentEfficiency: nextCurrentEfficiency,
  };
}