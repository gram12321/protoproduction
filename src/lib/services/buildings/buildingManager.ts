import { RECIPE_BY_TYPE } from "@/lib/constants";
import type { Building, Inventory, RecipeInput } from "@/lib/types";
import { updateBuildingEfficiency } from "./buildingEfficiency";
import { calculateEffectiveBuildingWorkPerTick } from "./buildingWork";

function hasRequiredInputs(
  inventory: Inventory,
  requiredInputs: RecipeInput[],
): boolean {
  return requiredInputs.every(
    (requiredInput) => inventory[requiredInput.resource] >= requiredInput.amount,
  );
}

function consumeInputs(inventory: Inventory, requiredInputs: RecipeInput[]): void {
  for (const requiredInput of requiredInputs) {
    inventory[requiredInput.resource] -= requiredInput.amount;
  }
}

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
  const safeWorkRequired = Math.max(recipe.workRequired, Number.EPSILON);
  const nextInventory = { ...inventory };
  let remainingWork = Math.max(0, effectiveWorkThisTick);
  let remainingWorkProgress = previousWorkProgress;
  let completedRecipeCount = 0;

  if (recipe.input?.length && remainingWorkProgress === 0 && remainingWork > 0) {
    const hasStartingInput = hasRequiredInputs(nextInventory, recipe.input);

    if (hasStartingInput) {
      consumeInputs(nextInventory, recipe.input);
    } else {
      remainingWork = 0;
    }
  }

  while (remainingWork > 0) {
    const workNeededToFinish = safeWorkRequired - remainingWorkProgress;
    const appliedWork = Math.min(remainingWork, workNeededToFinish);

    remainingWorkProgress += appliedWork;
    remainingWork -= appliedWork;

    if (remainingWorkProgress + Number.EPSILON >= safeWorkRequired) {
      completedRecipeCount += 1;
      remainingWorkProgress = 0;

      if (recipe.input?.length && remainingWork > 0) {
        const hasInputForNextCycle = hasRequiredInputs(nextInventory, recipe.input);

        if (hasInputForNextCycle) {
          consumeInputs(nextInventory, recipe.input);
        } else {
          break;
        }
      }
    }
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