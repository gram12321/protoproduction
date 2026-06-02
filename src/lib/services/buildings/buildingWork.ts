import { BASE_WORK_PER_WORKER_PER_TICK } from "@/lib/constants";
import type { Building } from "@/lib/types";

function clampNonNegative(value: number): number {
  return Math.max(0, value);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function calculateEffectiveWorkPerWorkerPerTick(
  baseWorkPerWorkerPerTick: number,
  workerModifier: number,
): number {
  return clampNonNegative(baseWorkPerWorkerPerTick) *
    clampNonNegative(workerModifier);
}

function calculateFallbackAggregateWorkerWorkPerTick(currentStaff: number): number {
  return clampNonNegative(currentStaff) * BASE_WORK_PER_WORKER_PER_TICK;
}

export function calculateTotalWorkerWorkPerTick(building: Building): number {
  return calculateFallbackAggregateWorkerWorkPerTick(building.currentStaff);
}

export function calculateEffectiveBuildingWorkPerTick(building: Building): number {
  const totalWorkerWorkPerTick = calculateTotalWorkerWorkPerTick(building);
  return totalWorkerWorkPerTick * clamp01(building.currentEfficiency);
}