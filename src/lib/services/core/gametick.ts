import { addResource } from "@/lib/services/inventory";
import type { GameLoopState } from "@/lib/types";
import { processBuildingsTick } from "./buildingManager";

export function processGameTick(state: GameLoopState): GameLoopState {
  let nextInventory = { ...state.inventory };
  const { nextBuildings, productionDeltas } = processBuildingsTick(state.buildings);

  for (const delta of productionDeltas) {
    nextInventory = addResource(nextInventory, delta.resource, delta.amount);
  }

  return {
    ...state,
    tick: state.tick + 1,
    buildings: nextBuildings,
    inventory: nextInventory,
  };
}
