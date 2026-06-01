import { RECIPE_BY_TYPE } from "@/lib/constants";
import type { Building, ResourceType } from "@/lib/types";
import { updateBuildingEfficiency } from "./buildingEfficiency";
import { calculateEffectiveBuildingWorkPerTick } from "./buildingWork";

export interface ProductionDelta {
  resource: ResourceType;
  amount: number;
}

export interface ProcessBuildingTickResult {
  nextBuilding: Building;
  productionDeltas: ProductionDelta[];
}

export interface ProcessBuildingsTickResult {
  nextBuildings: Building[];
  productionDeltas: ProductionDelta[];
}

export function processBuildingTick(building: Building): ProcessBuildingTickResult {
  const efficiencyUpdatedBuilding = updateBuildingEfficiency(building);
  const recipe = RECIPE_BY_TYPE[efficiencyUpdatedBuilding.recipeType];
  const effectiveWorkThisTick = calculateEffectiveBuildingWorkPerTick(
    efficiencyUpdatedBuilding,
  );
  const previousWorkProgress = Math.max(
    0,
    efficiencyUpdatedBuilding.currentRecipeWorkProgress,
  );
  const totalWorkProgress = previousWorkProgress + effectiveWorkThisTick;

  const safeWorkRequired = Math.max(recipe.workRequired, Number.EPSILON);
  const completedRecipeCount = Math.floor(totalWorkProgress / safeWorkRequired);
  const remainingWorkProgress =
    totalWorkProgress - completedRecipeCount * safeWorkRequired;

  const productionDeltas: ProductionDelta[] =
    completedRecipeCount > 0
      ? [
          {
            resource: recipe.output.resource,
            amount: recipe.output.amount * completedRecipeCount,
          },
        ]
      : [];

  return {
    nextBuilding: {
      ...efficiencyUpdatedBuilding,
      currentRecipeWorkProgress: Math.max(0, remainingWorkProgress),
    },
    productionDeltas,
  };
}

export function processBuildingsTick(
  buildings: Building[],
): ProcessBuildingsTickResult {
  const nextBuildings: Building[] = [];
  const productionDeltas: ProductionDelta[] = [];

  for (const building of buildings) {
    const result = processBuildingTick(building);
    nextBuildings.push(result.nextBuilding);
    productionDeltas.push(...result.productionDeltas);
  }

  return {
    nextBuildings,
    productionDeltas,
  };
}