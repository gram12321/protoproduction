import { AVAILABLE_RECIPE_TYPES_BY_BUILDING_TYPE } from "@/lib/constants";
import type { GameLoopState, RecipeType } from "@/lib/types";

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
        AVAILABLE_RECIPE_TYPES_BY_BUILDING_TYPE[building.type];

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
