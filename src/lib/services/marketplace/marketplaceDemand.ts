import {
  BASE_CONSUMPTION_BY_RESOURCE,
  CROSS_LEVEL_ELASTICITY,
  DEMAND_CREATION_DAMPENING,
  DEMAND_CREATION_MAX_ADDITIONAL_MULTIPLIER,
  DEMAND_CREATION_SENSITIVITY_MULTIPLIER,
  DEMAND_SHOCK_CHANCE,
  DEMAND_SHOCK_NEGATIVE_OUTCOME_CHANCE,
  DEMAND_SHOCK_NEGATIVE_MULTIPLIER,
  DEMAND_SHOCK_POSITIVE_MULTIPLIER,
  SELLER_WEIGHT_RANDOMIZATION_MIN,
  SELLER_WEIGHT_RANDOMIZATION_RANGE,
  CITY_DATA,
  INTER_RETAILER_SENSITIVITY,
  RESOURCE_MARKET_LEVEL_BY_RESOURCE,
  SUBSTITUTION_DAMPENING,
  SUBSTITUTION_DEVIATION_THRESHOLD,
} from "@/lib/constants";
import type {
  CityType,
  Inventory,
  MarketplaceResourceTickResult,
  MarketplaceTickResult,
  ResourceType,
} from "@/lib/types";
import {
  LOCAL_SUPPLIERS_SELLER_NAME,
  PLAYER_SELLER_NAME,
  resolveNpcRetailOffers,
  type NpcRetailOffer,
} from "./npcRetailers";
import { calculateBaseCityPrice } from "./resourceBaseCost";

export function calculateBaseCityDemand(
  city: CityType,
  resource: ResourceType,
): number {
  return (
    CITY_DATA[city].population *
    CITY_DATA[city].wealth *
    BASE_CONSUMPTION_BY_RESOURCE[resource]
  );
}

export function calculateBaseCityDemandByResource(
  city: CityType,
): Record<ResourceType, number> {
  return Object.fromEntries(
    Object.keys(BASE_CONSUMPTION_BY_RESOURCE).map((resource) => [
      resource,
      calculateBaseCityDemand(city, resource as ResourceType),
    ]),
  ) as Record<ResourceType, number>;
}

function calculatePriceWeight(
  price: number,
  averageSellerPrice: number,
  sensitivity: number,
): number {
  const safePrice = Math.max(price, Number.EPSILON);
  const safeAverageSellerPrice = Math.max(averageSellerPrice, Number.EPSILON);

  return Math.pow(safeAverageSellerPrice / safePrice, sensitivity);
}

interface ListedResourceMarketContext {
  resource: ResourceType;
  listedQuantity: number;
  playerOfferPrice: number;
  availableInventory: number;
  baseDemand: number;
  baseCityPrice: number;
  npcOffers: NpcRetailOffer[];
  interRetailerSensitivity: number;
}

type RetailSellerName = string;

interface RetailSellerMarketContext {
  sellerName: RetailSellerName;
  offerPrice: number;
  offeredQuantity: number | null;
  maxSellUnits: number;
}

interface DemandShockAdjustment {
  sellerName: RetailSellerName;
  multiplier: number;
}

function calculateAverageSellerPrice(prices: number[]): number {
  if (prices.length === 0) {
    return 0;
  }

  const totalPrice = prices.reduce((sum, price) => sum + price, 0);
  return totalPrice / prices.length;
}

function buildRetailSellerContexts(
  context: ListedResourceMarketContext,
): RetailSellerMarketContext[] {
  return [
    {
      sellerName: PLAYER_SELLER_NAME,
      offerPrice: context.playerOfferPrice,
      offeredQuantity: context.listedQuantity,
      maxSellUnits: Math.min(context.listedQuantity, context.availableInventory),
    },
    ...context.npcOffers.map((npcOffer) => ({
      sellerName: npcOffer.sellerName,
      offerPrice: npcOffer.offerPrice,
      offeredQuantity: npcOffer.offeredQuantity,
      maxSellUnits: npcOffer.offeredQuantity,
    })),
    {
      sellerName: LOCAL_SUPPLIERS_SELLER_NAME,
      offerPrice: context.baseCityPrice,
      offeredQuantity: null,
      maxSellUnits: Number.POSITIVE_INFINITY,
    },
  ];
}

function buildListedResourceContexts(
  nextInventory: Inventory,
  city: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>>,
  offerPriceByResource: Partial<Record<ResourceType, number>>,
  lastMarketplaceTick?: MarketplaceTickResult | null,
  marketplaceTickHistory?: MarketplaceTickResult[],
): ListedResourceMarketContext[] {
  const resourceContexts: ListedResourceMarketContext[] = [];

  for (const resource of Object.keys(BASE_CONSUMPTION_BY_RESOURCE) as ResourceType[]) {
    const listedQuantity = Math.floor(
      Math.max(0, listedQuantityByResource[resource] ?? 0),
    );
    const playerOfferPrice = offerPriceByResource[resource];
    const availableInventory = Math.floor(Math.max(0, nextInventory[resource]));
    const hasPlayerOffer =
      listedQuantity > 0 && playerOfferPrice !== undefined && playerOfferPrice > 0;

    if (!hasPlayerOffer) {
      continue;
    }

    const baseDemand = calculateBaseCityDemand(city, resource);
    const baseCityPrice = calculateBaseCityPrice(resource, city);
    const npcOffers = resolveNpcRetailOffers(
      resource,
      baseDemand,
      baseCityPrice,
      lastMarketplaceTick,
      {
        lastMarketplaceTicks: marketplaceTickHistory,
      },
    );

    resourceContexts.push({
      resource,
      listedQuantity,
      playerOfferPrice,
      availableInventory,
      baseDemand,
      baseCityPrice,
      npcOffers,
      interRetailerSensitivity: INTER_RETAILER_SENSITIVITY[resource],
    });
  }

  return resourceContexts;
}

function applyCrossResourceSubstitution(
  resourceContexts: ListedResourceMarketContext[],
): Record<ResourceType, number> {
  const baseDemandByResource = Object.fromEntries(
    resourceContexts.map((context) => [context.resource, context.baseDemand]),
  ) as Record<ResourceType, number>;
  const averagePriceByResource = Object.fromEntries(
    resourceContexts.map((context) => {
      const sellerPrices = buildRetailSellerContexts(context).map(
        (sellerContext) => sellerContext.offerPrice,
      );
      return [context.resource, calculateAverageSellerPrice(sellerPrices)];
    }),
  ) as Record<ResourceType, number>;
  const substitutionGainsByResource = new Map<ResourceType, number>();
  const substitutionLossesByResource = new Map<ResourceType, number>();

  for (let i = 0; i < resourceContexts.length; i += 1) {
    for (let j = i + 1; j < resourceContexts.length; j += 1) {
      const resourceA = resourceContexts[i].resource;
      const resourceB = resourceContexts[j].resource;
      const averagePriceA = averagePriceByResource[resourceA];
      const averagePriceB = averagePriceByResource[resourceB];
      const referencePriceA = resourceContexts[i].baseCityPrice;
      const referencePriceB = resourceContexts[j].baseCityPrice;
      const levelA = RESOURCE_MARKET_LEVEL_BY_RESOURCE[resourceA];
      const levelB = RESOURCE_MARKET_LEVEL_BY_RESOURCE[resourceB];
      const elasticity = CROSS_LEVEL_ELASTICITY[levelA][levelB];

      if (
        averagePriceA <= 0 ||
        averagePriceB <= 0 ||
        referencePriceA <= 0 ||
        referencePriceB <= 0 ||
        elasticity <= 0
      ) {
        continue;
      }

      const actualRatio = averagePriceA / averagePriceB;
      const referenceRatio = referencePriceA / referencePriceB;
      const deviationFactor = actualRatio / referenceRatio;
      const deviation = Math.abs(deviationFactor - 1);

      if (deviation < SUBSTITUTION_DEVIATION_THRESHOLD) {
        continue;
      }

      if (actualRatio > referenceRatio) {
        const shiftAmount =
          baseDemandByResource[resourceA] * deviation * elasticity * SUBSTITUTION_DAMPENING;
        substitutionLossesByResource.set(
          resourceA,
          (substitutionLossesByResource.get(resourceA) ?? 0) + shiftAmount,
        );
        substitutionGainsByResource.set(
          resourceB,
          (substitutionGainsByResource.get(resourceB) ?? 0) + shiftAmount,
        );
      } else {
        const shiftAmount =
          baseDemandByResource[resourceB] * deviation * elasticity * SUBSTITUTION_DAMPENING;
        substitutionLossesByResource.set(
          resourceB,
          (substitutionLossesByResource.get(resourceB) ?? 0) + shiftAmount,
        );
        substitutionGainsByResource.set(
          resourceA,
          (substitutionGainsByResource.get(resourceA) ?? 0) + shiftAmount,
        );
      }
    }
  }

  return Object.fromEntries(
    resourceContexts.map((context) => {
      const loss = substitutionLossesByResource.get(context.resource) ?? 0;
      const gain = substitutionGainsByResource.get(context.resource) ?? 0;
      return [context.resource, Math.max(0, context.baseDemand - loss + gain)];
    }),
  ) as Record<ResourceType, number>;
}

function applyDemandCreationFromBelowAveragePricing(
  resourceContexts: ListedResourceMarketContext[],
  demandByResource: Record<ResourceType, number>,
): Record<ResourceType, number> {
  return Object.fromEntries(
    resourceContexts.map((context) => {
      const currentDemand = demandByResource[context.resource] ?? 0;
      const sellerContexts = buildRetailSellerContexts(context);
      const averageSellerPrice = calculateAverageSellerPrice(
        sellerContexts.map((sellerContext) => sellerContext.offerPrice),
      );

      if (currentDemand <= 0 || averageSellerPrice <= 0) {
        return [context.resource, currentDemand];
      }

      const prices = sellerContexts.map((sellerContext) => sellerContext.offerPrice);
      let totalCreatedDemand = 0;

      for (const price of prices) {
        if (price >= averageSellerPrice) {
          continue;
        }

        const priceRatio = price / averageSellerPrice;
        const creationFactor = Math.pow(
          1 / Math.max(priceRatio, Number.EPSILON),
          context.interRetailerSensitivity * DEMAND_CREATION_SENSITIVITY_MULTIPLIER,
        );
        const maxCreationMultiplier = Math.min(
          Math.max(0, creationFactor - 1),
          DEMAND_CREATION_MAX_ADDITIONAL_MULTIPLIER,
        );
        totalCreatedDemand +=
          currentDemand * maxCreationMultiplier * DEMAND_CREATION_DAMPENING;
      }

      return [context.resource, currentDemand + totalCreatedDemand];
    }),
  ) as Record<ResourceType, number>;
}

function buildDemandShockAdjustmentsByResource(
  resourceContexts: ListedResourceMarketContext[],
  randomFn: () => number,
): Partial<Record<ResourceType, DemandShockAdjustment>> {
  const adjustmentsByResource: Partial<Record<ResourceType, DemandShockAdjustment>> = {};

  for (const context of resourceContexts) {
    if (randomFn() >= DEMAND_SHOCK_CHANCE) {
      continue;
    }

    const sellers = buildRetailSellerContexts(context).map(
      (sellerContext) => sellerContext.sellerName,
    );
    const shockedSeller = sellers[Math.floor(randomFn() * sellers.length)]
      ?? PLAYER_SELLER_NAME;
    const multiplier = randomFn() < DEMAND_SHOCK_NEGATIVE_OUTCOME_CHANCE
      ? DEMAND_SHOCK_NEGATIVE_MULTIPLIER
      : DEMAND_SHOCK_POSITIVE_MULTIPLIER;

    adjustmentsByResource[context.resource] = {
      sellerName: shockedSeller,
      multiplier,
    };
  }

  return adjustmentsByResource;
}

function distributeResourceDemandAcrossSellers(
  context: ListedResourceMarketContext,
  totalDemandUnits: number,
  demandShockAdjustment: DemandShockAdjustment | undefined,
  randomFn: () => number,
): {
  playerSoldUnits: number;
  npcOffers: MarketplaceResourceTickResult["offers"];
  localSupplierSoldUnits: number;
  demandShock: MarketplaceResourceTickResult["demandShock"];
} {
  const sellerContexts = buildRetailSellerContexts(context);
  const averageSellerPrice = calculateAverageSellerPrice(
    sellerContexts.map((sellerContext) => sellerContext.offerPrice),
  );
  const randomizedWeightBySeller = Object.fromEntries(
    sellerContexts.map((sellerContext) => {
      const baseWeight = calculatePriceWeight(
        sellerContext.offerPrice,
        averageSellerPrice,
        context.interRetailerSensitivity,
      );
      const randomizedWeight = baseWeight *
        (SELLER_WEIGHT_RANDOMIZATION_MIN + randomFn() * SELLER_WEIGHT_RANDOMIZATION_RANGE);
      return [sellerContext.sellerName, randomizedWeight];
    }),
  ) as Record<RetailSellerName, number>;
  const totalRandomizedWeight = Object.values(randomizedWeightBySeller).reduce(
    (sum, weight) => sum + weight,
    0,
  );

  const normalizedShareBySeller = Object.fromEntries(
    sellerContexts.map((sellerContext) => [
      sellerContext.sellerName,
      totalRandomizedWeight > 0
        ? randomizedWeightBySeller[sellerContext.sellerName] / totalRandomizedWeight
        : 0,
    ]),
  ) as Record<RetailSellerName, number>;
  const rawDemandBySeller = Object.fromEntries(
    sellerContexts.map((sellerContext) => [
      sellerContext.sellerName,
      totalDemandUnits * normalizedShareBySeller[sellerContext.sellerName],
    ]),
  ) as Record<RetailSellerName, number>;
  let demandShock: MarketplaceResourceTickResult["demandShock"] = null;

  if (demandShockAdjustment) {
    const originalShockedDemand = rawDemandBySeller[demandShockAdjustment.sellerName];
    const shockedDemand = originalShockedDemand * demandShockAdjustment.multiplier;
    const demandDifference = originalShockedDemand - shockedDemand;

    rawDemandBySeller[demandShockAdjustment.sellerName] = Math.max(0, shockedDemand);

    const otherSellers = (Object.keys(rawDemandBySeller) as RetailSellerName[]).filter(
      (sellerName) => sellerName !== demandShockAdjustment.sellerName,
    );
    const totalOtherShare = otherSellers.reduce(
      (sum, sellerName) => sum + normalizedShareBySeller[sellerName],
      0,
    );

    if (totalOtherShare > 0) {
      for (const sellerName of otherSellers) {
        const redistributionShare = normalizedShareBySeller[sellerName] / totalOtherShare;
        rawDemandBySeller[sellerName] += demandDifference * redistributionShare;
      }
    }

    demandShock = {
      sellerName: demandShockAdjustment.sellerName,
      multiplier: demandShockAdjustment.multiplier,
      targetDemandDelta: Math.round(shockedDemand - originalShockedDemand),
    };
  }

  const soldUnitsBySeller: Record<RetailSellerName, number> = {};
  let remainingDemandUnits = totalDemandUnits;
  for (const sellerContext of sellerContexts) {
    const targetUnits = Math.max(
      0,
      Math.floor(rawDemandBySeller[sellerContext.sellerName] ?? 0),
    );
    const soldUnits = Math.min(targetUnits, sellerContext.maxSellUnits, remainingDemandUnits);

    soldUnitsBySeller[sellerContext.sellerName] = soldUnits;
    remainingDemandUnits -= soldUnits;
  }

  if (remainingDemandUnits > 0) {
    soldUnitsBySeller[LOCAL_SUPPLIERS_SELLER_NAME] =
      (soldUnitsBySeller[LOCAL_SUPPLIERS_SELLER_NAME] ?? 0) + remainingDemandUnits;
    remainingDemandUnits = 0;
  }

  const playerSoldUnits = soldUnitsBySeller[PLAYER_SELLER_NAME] ?? 0;
  const localSupplierSoldUnits = soldUnitsBySeller[LOCAL_SUPPLIERS_SELLER_NAME] ?? 0;
  const npcOffers = context.npcOffers.map((npcOffer) => ({
    sellerName: npcOffer.sellerName,
    offeredQuantity: npcOffer.offeredQuantity,
    offerPrice: npcOffer.offerPrice,
    soldQuantity: soldUnitsBySeller[npcOffer.sellerName] ?? 0,
  }));

  return {
    playerSoldUnits,
    npcOffers,
    localSupplierSoldUnits,
    demandShock,
  };
}

export function resolveCityMarketplaceTick(
  inventory: Inventory,
  city: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>>,
  offerPriceByResource: Partial<Record<ResourceType, number>>,
  lastMarketplaceTick?: MarketplaceTickResult | null,
  options?: {
    randomFn?: () => number;
    lastMarketplaceTicks?: MarketplaceTickResult[];
  },
): {
  nextInventory: Inventory;
  earnedMoney: number;
  marketplaceTickResult: MarketplaceTickResult | null;
} {
  const randomFn = options?.randomFn ?? Math.random;
  const nextInventory = { ...inventory };
  let earnedMoney = 0;
  const resourceResults: MarketplaceResourceTickResult[] = [];

  // STEP 1: Calculate base demand and active seller prices for listed resources.
  const listedResourceContexts = buildListedResourceContexts(
    nextInventory,
    city,
    listedQuantityByResource,
    offerPriceByResource,
    lastMarketplaceTick,
    options?.lastMarketplaceTicks,
  );

  // STEP 2: Apply bidirectional cross-resource substitution from relative price deviations.
  const substitutionAdjustedDemandByResource =
    applyCrossResourceSubstitution(listedResourceContexts);

  // STEP 3: Apply demand creation when sellers are priced below the resource average.
  const finalDemandByResource = applyDemandCreationFromBelowAveragePricing(
    listedResourceContexts,
    substitutionAdjustedDemandByResource,
  );

  // STEP 4: Apply random demand shocks by resource before seller allocation.
  const demandShockAdjustmentsByResource = buildDemandShockAdjustmentsByResource(
    listedResourceContexts,
    randomFn,
  );

  // STEP 5: Distribute demand across sellers, apply seller caps, and settle sales.
  for (const context of listedResourceContexts) {
    const totalDemandUnits = Math.round(finalDemandByResource[context.resource] ?? 0);
    const {
      playerSoldUnits,
      npcOffers,
      localSupplierSoldUnits,
      demandShock,
    } = distributeResourceDemandAcrossSellers(
      context,
      totalDemandUnits,
      demandShockAdjustmentsByResource[context.resource],
      randomFn,
    );

    nextInventory[context.resource] -= playerSoldUnits;
    earnedMoney += playerSoldUnits * context.playerOfferPrice;
    resourceResults.push({
      resource: context.resource,
      baseDemand: context.baseDemand,
      demandShock,
      offers: [
        {
          sellerName: PLAYER_SELLER_NAME,
          offeredQuantity: context.listedQuantity,
          offerPrice: context.playerOfferPrice,
          soldQuantity: playerSoldUnits,
        },
        ...npcOffers,
        {
          sellerName: LOCAL_SUPPLIERS_SELLER_NAME,
          offeredQuantity: null,
          offerPrice: context.baseCityPrice,
          soldQuantity: localSupplierSoldUnits,
        },
      ],
    });
  }

  return {
    nextInventory,
    earnedMoney,
    marketplaceTickResult: resourceResults.length > 0
      ? {
          city,
          resources: resourceResults,
        }
      : null,
  };
}
