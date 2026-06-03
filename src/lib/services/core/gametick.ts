import type { CityType, GameLoopState, ResourceType } from "@/lib/types";
import { FOLLOWER_NPC_SMOOTHING_TICK_WINDOW } from "@/lib/constants";
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
      marketplaceTickHistory: state.marketplaceTickHistory,
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
      state.lastMarketplaceTick,
      {
        lastMarketplaceTicks: state.marketplaceTickHistory,
      },
    );

  const nextMarketplaceTickHistory = marketplaceTickResult
    ? [marketplaceTickResult, ...state.marketplaceTickHistory].slice(
      0,
      FOLLOWER_NPC_SMOOTHING_TICK_WINDOW,
    )
    : state.marketplaceTickHistory;

  return {
    ...state,
    tick: state.tick + 1,
    buildings: nextBuildings,
    inventory: nextMarketplaceInventory,
    money: state.money + earnedMoney,
    lastMarketplaceTick: marketplaceTickResult,
    marketplaceTickHistory: nextMarketplaceTickHistory,
  };
}
