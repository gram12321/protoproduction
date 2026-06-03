import type { CityType, GameLoopState, ResourceType } from "@/lib/types";
import { processBuildingsTick } from "@/lib/services/buildings/buildingManager";
import { resolveCityMarketplaceTick } from "@/lib/services/marketplace/marketplaceDemand";

export function processGameTick(
  state: GameLoopState,
  marketplaceCity?: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>> = {},
  offerPriceByResource: Partial<Record<ResourceType, number>> = {},
): GameLoopState {
  const { nextBuildings, nextInventory } = processBuildingsTick(
    state.buildings,
    state.inventory,
  );

  if (!marketplaceCity) {
    return {
      ...state,
      tick: state.tick + 1,
      buildings: nextBuildings,
      inventory: nextInventory,
      lastMarketplaceTick: null,
    };
  }

  const {
    nextInventory: nextMarketplaceInventory,
    earnedMoney,
    marketplaceTickResult,
  } =
    resolveCityMarketplaceTick(
      nextInventory,
      marketplaceCity,
      listedQuantityByResource,
      offerPriceByResource,
    );

  return {
    ...state,
    tick: state.tick + 1,
    buildings: nextBuildings,
    inventory: nextMarketplaceInventory,
    money: state.money + earnedMoney,
    lastMarketplaceTick: marketplaceTickResult,
  };
}
