import { INITIAL_GAME_LOOP_STATE } from "@/lib/constants";
import type { GameLoopState } from "@/lib/types";

export function createInitialGameLoopState(): GameLoopState {
  return {
    ...INITIAL_GAME_LOOP_STATE,
    inventory: {
      ...INITIAL_GAME_LOOP_STATE.inventory,
    },
    buildings: INITIAL_GAME_LOOP_STATE.buildings.map((building) => ({
      ...building,
    })),
  };
}
