import type { Building } from "./buildingTypes";
import type { Inventory } from "./inventoryTypes";
import type { CityType } from "./locationTypes";
import type { ResourceType } from "./resourceTypes";

export interface MarketplaceOfferResult {
  sellerName: string;
  offeredQuantity: number | null;
  offerPrice: number;
  soldQuantity: number;
}

export interface MarketplaceDemandShockResult {
  sellerName: string;
  multiplier: number;
  targetDemandDelta: number;
}

export interface MarketplaceResourceTickResult {
  resource: ResourceType;
  baseDemand: number;
  demandShock: MarketplaceDemandShockResult | null;
  offers: MarketplaceOfferResult[];
}

export interface MarketplaceTickResult {
  city: CityType;
  resources: MarketplaceResourceTickResult[];
}

export interface GameLoopState {
  tick: number;
  money: number;
  inventory: Inventory;
  buildings: Building[];
  lastMarketplaceTick: MarketplaceTickResult | null;
  marketplaceTickHistory: MarketplaceTickResult[];
}
