import {
  BASE_WORK_PER_WORKER_PER_TICK,
  BUILDING_CONFIG_BY_TYPE,
  EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER,
  EFFICIENCY_TICK_LERP_MAX,
  EFFICIENCY_TICK_LERP_MIN,
  OVERSTAFF_EFFICIENCY_LOG_BONUS_MULTIPLIER,
  RECIPE_BY_TYPE,
  STAFF_EFFICIENCY_CURVE_STEEPNESS,
  STAFF_GROWTH_BASE,
} from "@/lib/constants";
import type {
  Building,
  BuildingSize,
  BuildingType,
  GameLoopState,
  Inventory,
  ProductionRecipe,
  RecipeType,
  RecipeInput,
} from "@/lib/types";

// START STAFF FUNCTIONS

// Returns baseline staffing requirement by building type.
export function getMinimumWorkersForBuildingType(type: BuildingType): number {
  return BUILDING_CONFIG_BY_TYPE[type].minWorkers;
}

// Calculates scaled maximum staff by size using growth base.
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

// Applies staff change for one building, clamped to non-negative values.
export function setBuildingStaff(
  state: GameLoopState,
  buildingId: string,
  requestedStaff: number,
): GameLoopState {
  return {
    ...state,
    buildings: state.buildings.map((building) => {
      if (building.id !== buildingId) {
        return building;
      }

      const nextStaff = Math.max(0, requestedStaff);

      return {
        ...building,
        currentStaff: nextStaff,
      };
    }),
  };
}

// Computes target efficiency from staffing with diminishing overstaff returns.
export function calculateTargetEfficiencyFromStaffing(
  currentStaff: number,
  maxStaff: number,
): number {
  if (maxStaff <= 0) {
    return 0;
  }

  const staffingRatio = Math.max(0, currentStaff / maxStaff);
  const cappedStaffingRatio = Math.min(staffingRatio, 1);
  const baseTargetEfficiency =
    1 - Math.pow(1 - cappedStaffingRatio, STAFF_EFFICIENCY_CURVE_STEEPNESS);
  const overstaffingRatio = Math.max(0, staffingRatio - 1);
  const overstaffingBonus =
    Math.log1p(overstaffingRatio) * OVERSTAFF_EFFICIENCY_LOG_BONUS_MULTIPLIER;

  return baseTargetEfficiency + overstaffingBonus;
}

// Steps current building efficiency toward its staffing-based target.
export function updateBuildingEfficiency(building: Building): Building {
  const maxStaff = calculateMaxStaff(building.type, building.size);
  const targetEfficiency = calculateTargetEfficiencyFromStaffing(
    building.currentStaff,
    maxStaff,
  );
  const currentEfficiency = Math.max(0, building.currentEfficiency);
  const delta = targetEfficiency - currentEfficiency;

  const lerpFactor = Math.min(
    EFFICIENCY_TICK_LERP_MAX,
    EFFICIENCY_TICK_LERP_MIN +
      Math.abs(delta) * EFFICIENCY_TICK_LERP_DISTANCE_MULTIPLIER,
  );

  const nextCurrentEfficiency = Math.max(
    0,
    currentEfficiency + delta * lerpFactor,
  );

  return {
    ...building,
    previousEfficiency: currentEfficiency,
    targetEfficiency,
    currentEfficiency: nextCurrentEfficiency,
  };
}

// START BUILDING STATE MUTATION FUNCTIONS

// Increases building size by at least 1 step.
export function increaseBuildingSize(
  state: GameLoopState,
  buildingId: string,
  amount = 1,
): GameLoopState {
  const safeIncrease = Math.max(1, Math.floor(amount));

  return {
    ...state,
    buildings: state.buildings.map((building) => {
      if (building.id !== buildingId) {
        return building;
      }

      return {
        ...building,
        size: Math.max(1, Math.floor(building.size) + safeIncrease),
      };
    }),
  };
}

// Decreases building size by at least 1 step, never below 1.
export function decreaseBuildingSize(
  state: GameLoopState,
  buildingId: string,
  amount = 1,
): GameLoopState {
  const safeDecrease = Math.max(1, Math.floor(amount));

  return {
    ...state,
    buildings: state.buildings.map((building) => {
      if (building.id !== buildingId) {
        return building;
      }

      const nextSize = Math.max(1, Math.floor(building.size) - safeDecrease);

      return {
        ...building,
        size: nextSize,
      };
    }),
  };
}

// Sets recipe for a building if allowed by building type and resets progress.
export function setBuildingRecipeType(
  state: GameLoopState,
  buildingId: string,
  requestedRecipeType: RecipeType,
): GameLoopState {
  return {
    ...state,
    buildings: state.buildings.map((building) => {
      if (building.id !== buildingId) {
        return building;
      }

      const allowedRecipeTypes =
        BUILDING_CONFIG_BY_TYPE[building.type].availableRecipes;

      if (!allowedRecipeTypes.includes(requestedRecipeType)) {
        return building;
      }

      return {
        ...building,
        recipeType: requestedRecipeType,
        currentRecipeWorkProgress: 0,
      };
    }),
  };
}

// START WORK AND VALIDATION FUNCTIONS

// Calculates effective work-per-worker after modifiers.
export function calculateEffectiveWorkPerWorkerPerTick(
  baseWorkPerWorkerPerTick: number,
  workerModifier: number,
): number {
  return baseWorkPerWorkerPerTick * workerModifier;
}

// Calculates total worker contribution per tick for one building.
export function calculateTotalWorkerWorkPerTick(building: Building): number {
  return building.currentStaff * BASE_WORK_PER_WORKER_PER_TICK;
}

// Calculates effective building work after efficiency is applied.
export function calculateEffectiveBuildingWorkPerTick(building: Building): number {
  const totalWorkerWorkPerTick = calculateTotalWorkerWorkPerTick(building);
  return totalWorkerWorkPerTick * Math.max(0, building.currentEfficiency);
}

// Checks if a recipe can start from current inventory and progress state.
export function canStartRecipeFromInventory(
  building: Building,
  recipe: ProductionRecipe,
  inventory: Inventory,
): boolean {
  if (!recipe.input?.length) {
    return true;
  }

  if (building.currentRecipeWorkProgress > 0) {
    return true;
  }

  return recipe.input.every(
    (requiredInput) =>
      inventory[requiredInput.resource] >= requiredInput.amount,
  );
}

// Formats recipe input requirements for UI warnings.
export function formatRecipeInputRequirements(recipe: ProductionRecipe): string {
  if (!recipe.input?.length) {
    return "";
  }

  return recipe.input
    .map(
      (requiredInput) =>
        `${requiredInput.amount} ${requiredInput.resource}`,
    )
    .join(", ");
}

// START TICK PROCESSING FUNCTIONS

// Internal check used while advancing recipe work loops.
function hasRequiredInputs(
  inventory: Inventory,
  requiredInputs: RecipeInput[],
): boolean {
  return requiredInputs.every(
    (requiredInput) => inventory[requiredInput.resource] >= requiredInput.amount,
  );
}

// Internal mutation helper that subtracts recipe inputs from inventory.
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

// Processes one building for a tick, including efficiency, work, and outputs.
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

// Processes all buildings sequentially and carries inventory between them.
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