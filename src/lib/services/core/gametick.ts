import { RECIPE_BY_TYPE } from "@/lib/constants";
import { addResource } from "@/lib/services/inventory";
import type { GameLoopState } from "@/lib/types";
import { updateBuildingEfficiency } from "./buildingEfficiency";

export function processGameTick(state: GameLoopState): GameLoopState {
  let nextInventory = { ...state.inventory };
  const nextBuildings = state.buildings.map((building) =>
    updateBuildingEfficiency(building),
  );

  for (const building of nextBuildings) {
    const recipe = RECIPE_BY_TYPE[building.recipeType];
    nextInventory = addResource(
      nextInventory,
      recipe.output.resource,
      recipe.output.amount,
    );
  }

  return {
    ...state,
    tick: state.tick + 1,
    buildings: nextBuildings,
    inventory: nextInventory,
  };
}
