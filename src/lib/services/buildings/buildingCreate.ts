import type { Building, BuildingType, GameLoopState } from "@/lib/types";
import { DEFAULT_RECIPE_BY_BUILDING_TYPE, INITIAL_BUILDING_SIZE } from "@/lib/constants";
import { getMinimumWorkersForBuildingType } from "./buildingStaffing";

function getNextBuildingId(buildings: Building[], type: BuildingType): string {
  const prefix = `${type}-`;
  let highestNumericId = 0;

  for (const building of buildings) {
    if (!building.id.startsWith(prefix)) {
      continue;
    }

    const nextPart = building.id.slice(prefix.length);
    const parsedId = Number.parseInt(nextPart, 10);

    if (Number.isFinite(parsedId)) {
      highestNumericId = Math.max(highestNumericId, parsedId);
    }
  }

  return `${prefix}${highestNumericId + 1}`;
}

export function createBuilding(
  state: GameLoopState,
  type: BuildingType = "farm",
): GameLoopState {
  const nextBuilding: Building = {
    id: getNextBuildingId(state.buildings, type),
    type,
    size: INITIAL_BUILDING_SIZE,
    currentStaff: getMinimumWorkersForBuildingType(type),
    previousEfficiency: 0,
    targetEfficiency: 0,
    currentEfficiency: 0,
    currentRecipeWorkProgress: 0,
    recipeType: DEFAULT_RECIPE_BY_BUILDING_TYPE[type],
  };

  return {
    ...state,
    buildings: [...state.buildings, nextBuilding],
  };
}