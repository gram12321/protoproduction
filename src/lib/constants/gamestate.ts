import type { GameLoopState } from "@/lib/types";

export const STARTING_BALANCE_EUR = 1000;

export const INITIAL_GAME_LOOP_STATE: GameLoopState = {
  tick: 0,
  money: STARTING_BALANCE_EUR,
  inventory: {
    grain: 0,
    flour: 0,
  },
  buildings: [],
};
