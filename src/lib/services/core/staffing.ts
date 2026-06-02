import { calculateMaxStaff } from "@/lib/services/buildings/buildingStaffing";
import type { GameLoopState } from "@/lib/types";

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

      const maxStaff = calculateMaxStaff(building.type, building.size);
      const nextStaff = Math.max(0, Math.min(requestedStaff, maxStaff));

      return {
        ...building,
        currentStaff: nextStaff,
      };
    }),
  };
}