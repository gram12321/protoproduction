import type { GameLoopState } from "@/lib/types";

export const STARTING_BALANCE_EUR = 1000;

export const INITIAL_GAME_LOOP_STATE: GameLoopState = {
  tick: 0,
  money: STARTING_BALANCE_EUR,
  inventory: {
    grain: 0,
  },
  buildings: [
    {
      id: "farm-1",
      type: "farm",
      size: 1,
      currentStaff: 2,
      previousEfficiency: 0,
      targetEfficiency: 0,
      currentEfficiency: 0,
      currentRecipeWorkProgress: 0,
      recipeType: "produce-grain",
    },
  ],
};
