import type { GameLoopState } from "@/lib/types";
import { processBuildingsTick } from "@/lib/services/buildings/buildingManager";

export function processGameTick(state: GameLoopState): GameLoopState {
  const { nextBuildings, nextInventory } = processBuildingsTick(
    state.buildings,
    state.inventory,
  );

  return {
    ...state,
    tick: state.tick + 1,
    buildings: nextBuildings,
    inventory: nextInventory,
  };
}
