import { RECIPE_BY_TYPE } from "@/lib/constants";
import { addResource } from "@/lib/services/inventory";
import type { GameLoopState } from "@/lib/types";

export function processGameTick(state: GameLoopState): GameLoopState {
  let nextInventory = { ...state.inventory };

  for (const building of state.buildings) {
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
    inventory: nextInventory,
  };
}
