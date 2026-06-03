import {
  AVERAGE_NPC_DEMAND_SHARE,
  FOLLOWER_NPC_LOW_SELL_THROUGH_THRESHOLD,
  FOLLOWER_NPC_MIN_QUANTITY_FLOOR,
  FOLLOWER_NPC_PRICE_ADJUSTMENT_MULTIPLIER,
  FOLLOWER_NPC_SMOOTHING_TICK_WINDOW,
} from "@/lib/constants";
import type { MarketplaceTickResult, ResourceType } from "@/lib/types";

export const PLAYER_SELLER_NAME = "Player" as const;
export const AVERAGE_NPC_SELLER_NAME = "Average NPC" as const;
export const LOCAL_SUPPLIERS_SELLER_NAME = "Local Suppliers" as const;
export const FOLLOWER_NPC_SELLER_NAME = "Follower NPC" as const;

export interface NpcRetailPricingContext {
  resource: ResourceType;
  baseCityPrice: number;
  lastMarketplaceTick: MarketplaceTickResult | null | undefined;
  lastMarketplaceTicks: MarketplaceTickResult[];
}

export interface NpcRetailQuantityContext {
  baseDemand: number;
  resource: ResourceType;
  lastMarketplaceTick: MarketplaceTickResult | null | undefined;
  lastMarketplaceTicks: MarketplaceTickResult[];
}

export interface NpcRetailerStrategy {
  sellerName: string;
  calculateOfferPrice: (context: NpcRetailPricingContext) => number;
  calculateOfferedQuantity: (context: NpcRetailQuantityContext) => number;
}

export interface NpcRetailOffer {
  sellerName: string;
  offerPrice: number;
  offeredQuantity: number;
}

interface LastTickOfferSummary {
  averageOfferPrice: number;
  averageSoldQuantity: number;
  averageOfferedQuantity: number;
}

function getSmoothingTickWindow(
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  lastMarketplaceTicks: MarketplaceTickResult[],
): MarketplaceTickResult[] {
  const ticks = lastMarketplaceTicks.length > 0
    ? lastMarketplaceTicks
    : (lastMarketplaceTick ? [lastMarketplaceTick] : []);

  return ticks.slice(0, FOLLOWER_NPC_SMOOTHING_TICK_WINDOW);
}

function summarizeTickWindowOffersBySellerName(
  tickWindow: MarketplaceTickResult[],
  resource: ResourceType,
  sellerName: string,
): LastTickOfferSummary | null {
  let totalOfferPrice = 0;
  let totalSoldQuantity = 0;
  let totalOfferedQuantity = 0;
  let offerCount = 0;

  for (const tick of tickWindow) {
    const resourceResult = tick.resources.find(
      (result) => result.resource === resource,
    );

    if (!resourceResult) {
      continue;
    }

    const matchingOffers = resourceResult.offers.filter(
      (offer) => offer.sellerName === sellerName,
    );

    for (const offer of matchingOffers) {
      totalOfferPrice += offer.offerPrice;
      totalSoldQuantity += offer.soldQuantity;
      totalOfferedQuantity += Math.max(0, offer.offeredQuantity ?? 0);
      offerCount += 1;
    }
  }

  if (offerCount === 0) {
    return null;
  }

  return {
    averageOfferPrice: totalOfferPrice / offerCount,
    averageSoldQuantity: totalSoldQuantity / offerCount,
    averageOfferedQuantity: totalOfferedQuantity / offerCount,
  };
}

function findLastTickSellerOfferPrice(
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  resource: ResourceType,
  sellerName: string,
): number | undefined {
  const lastResourceResult = lastMarketplaceTick?.resources.find(
    (result) => result.resource === resource,
  );
  const sellerOffer = lastResourceResult?.offers.find(
    (offer) => offer.sellerName === sellerName,
  );

  return sellerOffer?.offerPrice;
}

function summarizeLastTickOffersBySellerName(
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  resource: ResourceType,
  sellerName: string,
): LastTickOfferSummary | null {
  const lastResourceResult = lastMarketplaceTick?.resources.find(
    (result) => result.resource === resource,
  );

  if (!lastResourceResult) {
    return null;
  }

  const matchingOffers = lastResourceResult.offers.filter(
    (offer) => offer.sellerName === sellerName,
  );

  if (matchingOffers.length === 0) {
    return null;
  }

  const totalOfferPrice = matchingOffers.reduce(
    (sum, offer) => sum + offer.offerPrice,
    0,
  );
  const totalSoldQuantity = matchingOffers.reduce(
    (sum, offer) => sum + offer.soldQuantity,
    0,
  );
  const totalOfferedQuantity = matchingOffers.reduce(
    (sum, offer) => sum + Math.max(0, offer.offeredQuantity ?? 0),
    0,
  );

  return {
    averageOfferPrice: totalOfferPrice / matchingOffers.length,
    averageSoldQuantity: totalSoldQuantity / matchingOffers.length,
    averageOfferedQuantity: totalOfferedQuantity / matchingOffers.length,
  };
}

function calculateFollowerNpcOfferPrice(
  resource: ResourceType,
  baseCityPrice: number,
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  lastMarketplaceTicks: MarketplaceTickResult[],
): number {
  const tickWindow = getSmoothingTickWindow(lastMarketplaceTick, lastMarketplaceTicks);
  const playerSummary = summarizeTickWindowOffersBySellerName(
    tickWindow,
    resource,
    PLAYER_SELLER_NAME,
  );
  const followerNpcLastTickOffer = summarizeTickWindowOffersBySellerName(
    tickWindow,
    resource,
    FOLLOWER_NPC_SELLER_NAME,
  );

  if (!playerSummary) {
    return baseCityPrice;
  }

  const basePrice = playerSummary.averageOfferPrice;
  const followerSoldQuantity = followerNpcLastTickOffer?.averageSoldQuantity ?? 0;
  const followerOfferedQuantity = Math.max(
    0,
    followerNpcLastTickOffer?.averageOfferedQuantity ?? 0,
  );

  if (followerOfferedQuantity <= 0) {
    return basePrice;
  }

  const sellThroughRate = followerSoldQuantity / followerOfferedQuantity;

  if (sellThroughRate < FOLLOWER_NPC_LOW_SELL_THROUGH_THRESHOLD) {
    return basePrice * (1 - FOLLOWER_NPC_PRICE_ADJUSTMENT_MULTIPLIER);
  }

  if (sellThroughRate > FOLLOWER_NPC_LOW_SELL_THROUGH_THRESHOLD) {
    return basePrice * (1 + FOLLOWER_NPC_PRICE_ADJUSTMENT_MULTIPLIER);
  }

  return basePrice;
}

function calculateFollowerNpcOfferedQuantity(
  resource: ResourceType,
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  lastMarketplaceTicks: MarketplaceTickResult[],
): number {
  const tickWindow = getSmoothingTickWindow(lastMarketplaceTick, lastMarketplaceTicks);
  const playerSummary = summarizeTickWindowOffersBySellerName(
    tickWindow,
    resource,
    PLAYER_SELLER_NAME,
  );

  const smoothedQuantity = Math.round(playerSummary?.averageSoldQuantity ?? 0);

  return Math.max(FOLLOWER_NPC_MIN_QUANTITY_FLOOR, smoothedQuantity);
}

export function calculateAverageNpcOfferPrice(
  resource: ResourceType,
  baseCityPrice: number,
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
): number {
  const lastTickPlayerPrice = findLastTickSellerOfferPrice(
    lastMarketplaceTick,
    resource,
    PLAYER_SELLER_NAME,
  );
  const uncappedPrice = lastTickPlayerPrice !== undefined
    ? (baseCityPrice + lastTickPlayerPrice) / 2
    : baseCityPrice;

  // Average NPC behavior never lists above local supplier baseline.
  return Math.min(baseCityPrice, uncappedPrice);
}

export function calculateAverageNpcOfferedQuantity(baseDemand: number): number {
  return Math.max(0, Math.round(baseDemand * AVERAGE_NPC_DEMAND_SHARE));
}

const averageNpcRetailerStrategy: NpcRetailerStrategy = {
  sellerName: AVERAGE_NPC_SELLER_NAME,
  calculateOfferPrice: ({ resource, baseCityPrice, lastMarketplaceTick }) =>
    calculateAverageNpcOfferPrice(resource, baseCityPrice, lastMarketplaceTick),
  calculateOfferedQuantity: ({ baseDemand }) =>
    calculateAverageNpcOfferedQuantity(baseDemand),
};

const followerNpcRetailerStrategy: NpcRetailerStrategy = {
  sellerName: FOLLOWER_NPC_SELLER_NAME,
  calculateOfferPrice: ({ resource, baseCityPrice, lastMarketplaceTick, lastMarketplaceTicks }) =>
    calculateFollowerNpcOfferPrice(
      resource,
      baseCityPrice,
      lastMarketplaceTick,
      lastMarketplaceTicks,
    ),
  calculateOfferedQuantity: ({ resource, lastMarketplaceTick, lastMarketplaceTicks }) =>
    calculateFollowerNpcOfferedQuantity(
      resource,
      lastMarketplaceTick,
      lastMarketplaceTicks,
    ),
};

export const NPC_RETAILER_STRATEGIES: readonly NpcRetailerStrategy[] = [
  averageNpcRetailerStrategy,
  followerNpcRetailerStrategy,
];

export function resolveNpcRetailOffers(
  resource: ResourceType,
  baseDemand: number,
  baseCityPrice: number,
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  options?: {
    strategies?: readonly NpcRetailerStrategy[];
    lastMarketplaceTicks?: MarketplaceTickResult[];
  },
): NpcRetailOffer[] {
  const strategies = options?.strategies ?? NPC_RETAILER_STRATEGIES;
  const lastMarketplaceTicks = options?.lastMarketplaceTicks ?? [];

  return strategies.map((strategy) => ({
    sellerName: strategy.sellerName,
    offerPrice: strategy.calculateOfferPrice({
      resource,
      baseCityPrice,
      lastMarketplaceTick,
      lastMarketplaceTicks,
    }),
    offeredQuantity: strategy.calculateOfferedQuantity({
      baseDemand,
      resource,
      lastMarketplaceTick,
      lastMarketplaceTicks,
    }),
  }));
}