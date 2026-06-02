import type { GameLoopState } from "@/lib/types";

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