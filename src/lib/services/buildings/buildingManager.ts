import { RECIPE_BY_TYPE } from "@/lib/constants";
import type { Building, Inventory } from "@/lib/types";
import { updateBuildingEfficiency } from "./buildingEfficiency";
import { calculateEffectiveBuildingWorkPerTick } from "./buildingWork";

export interface ProcessBuildingTickResult {
  nextBuilding: Building;
  nextInventory: Inventory;
}

export interface ProcessBuildingsTickResult {
  nextBuildings: Building[];
  nextInventory: Inventory;
}

export function processBuildingTick(
  building: Building,
  inventory: Inventory,
): ProcessBuildingTickResult {
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
  const completedByWork = Math.floor(totalWorkProgress / safeWorkRequired);

  const completedByInput = recipe.input
    ? Math.floor(
        Math.max(0, inventory[recipe.input.resource]) /
          Math.max(recipe.input.amount, Number.EPSILON),
      )
    : completedByWork;

  const completedRecipeCount = Math.max(
    0,
    Math.min(completedByWork, completedByInput),
  );

  const remainingWorkProgress =
    totalWorkProgress - completedRecipeCount * safeWorkRequired;

  const nextInventory = { ...inventory };

  if (recipe.input && completedRecipeCount > 0) {
    nextInventory[recipe.input.resource] -=
      recipe.input.amount * completedRecipeCount;
  }

  if (completedRecipeCount > 0) {
    nextInventory[recipe.output.resource] +=
      recipe.output.amount * completedRecipeCount;
  }

  return {
    nextBuilding: {
      ...efficiencyUpdatedBuilding,
      currentRecipeWorkProgress: Math.max(0, remainingWorkProgress),
    },
    nextInventory,
  };
}

export function processBuildingsTick(
  buildings: Building[],
  inventory: Inventory,
): ProcessBuildingsTickResult {
  const nextBuildings: Building[] = [];
  let nextInventory = { ...inventory };

  for (const building of buildings) {
    const result = processBuildingTick(building, nextInventory);
    nextBuildings.push(result.nextBuilding);
    nextInventory = result.nextInventory;
  }

  return {
    nextBuildings,
    nextInventory,
  };
}