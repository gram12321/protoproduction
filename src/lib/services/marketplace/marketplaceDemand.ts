import {
  AVERAGE_NPC_DEMAND_SHARE,
  BASE_CONSUMPTION_BY_RESOURCE,
  CROSS_LEVEL_ELASTICITY,
  DEMAND_CREATION_DAMPENING,
  DEMAND_CREATION_MAX_ADDITIONAL_MULTIPLIER,
  DEMAND_CREATION_SENSITIVITY_MULTIPLIER,
  DEMAND_SHOCK_CHANCE,
  DEMAND_SHOCK_NEGATIVE_MULTIPLIER,
  DEMAND_SHOCK_POSITIVE_MULTIPLIER,
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

function findLastTickPlayerOfferPrice(
  lastMarketplaceTick: MarketplaceTickResult | null | undefined,
  resource: ResourceType,
): number | undefined {
  const lastResourceResult = lastMarketplaceTick?.resources.find(
    (result) => result.resource === resource,
  );
  const playerOffer = lastResourceResult?.offers.find(
    (offer) => offer.sellerName === "Player",
  );

  return playerOffer?.offerPrice;
}

interface ListedResourceMarketContext {
  resource: ResourceType;
  listedQuantity: number;
  playerOfferPrice: number;
  availableInventory: number;
  baseDemand: number;
  baseCityPrice: number;
  averageNpcPrice: number;
  interRetailerSensitivity: number;
}

type RetailSellerName = "Player" | "Average NPC" | "Local Suppliers";

interface DemandShockAdjustment {
  sellerName: RetailSellerName;
  multiplier: number;
}

function buildListedResourceContexts(
  nextInventory: Inventory,
  city: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>>,
  offerPriceByResource: Partial<Record<ResourceType, number>>,
  lastMarketplaceTick?: MarketplaceTickResult | null,
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
    const lastTickPlayerPrice = findLastTickPlayerOfferPrice(
      lastMarketplaceTick,
      resource,
    );
    const averageNpcPrice =
      lastTickPlayerPrice !== undefined
        ? (baseCityPrice + lastTickPlayerPrice) / 2
        : baseCityPrice;

    resourceContexts.push({
      resource,
      listedQuantity,
      playerOfferPrice,
      availableInventory,
      baseDemand,
      baseCityPrice,
      averageNpcPrice,
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
    resourceContexts.map((context) => [
      context.resource,
      (context.playerOfferPrice + context.averageNpcPrice + context.baseCityPrice) / 3,
    ]),
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
      const averageSellerPrice =
        (context.playerOfferPrice + context.averageNpcPrice + context.baseCityPrice) / 3;

      if (currentDemand <= 0 || averageSellerPrice <= 0) {
        return [context.resource, currentDemand];
      }

      const prices = [
        context.playerOfferPrice,
        context.averageNpcPrice,
        context.baseCityPrice,
      ];
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
  const sellers: RetailSellerName[] = [
    "Player",
    "Average NPC",
    "Local Suppliers",
  ];
  const adjustmentsByResource: Partial<Record<ResourceType, DemandShockAdjustment>> = {};

  for (const context of resourceContexts) {
    if (randomFn() >= DEMAND_SHOCK_CHANCE) {
      continue;
    }

    const shockedSeller = sellers[Math.floor(randomFn() * sellers.length)] ?? "Player";
    const multiplier = randomFn() < 0.5
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
  averageNpcSoldUnits: number;
  localSupplierSoldUnits: number;
  averageNpcOfferedQuantity: number;
  demandShock: MarketplaceResourceTickResult["demandShock"];
} {
  const averageNpcOfferedQuantity = Math.max(
    0,
    Math.round(context.baseDemand * AVERAGE_NPC_DEMAND_SHARE),
  );
  const averageSellerPrice =
    (context.playerOfferPrice + context.averageNpcPrice + context.baseCityPrice) / 3;

  const playerMaxSellUnits = Math.min(
    context.listedQuantity,
    context.availableInventory,
  );
  const playerWeight = calculatePriceWeight(
    context.playerOfferPrice,
    averageSellerPrice,
    context.interRetailerSensitivity,
  );
  const averageNpcWeight = calculatePriceWeight(
    context.averageNpcPrice,
    averageSellerPrice,
    context.interRetailerSensitivity,
  );
  const localSupplierWeight = calculatePriceWeight(
    context.baseCityPrice,
    averageSellerPrice,
    context.interRetailerSensitivity,
  );
  const totalWeight = playerWeight + averageNpcWeight + localSupplierWeight;

  const randomizedWeightBySeller = {
    Player: playerWeight * (0.95 + randomFn() * 0.1),
    "Average NPC": averageNpcWeight * (0.95 + randomFn() * 0.1),
    "Local Suppliers": localSupplierWeight * (0.95 + randomFn() * 0.1),
  } as const;
  const totalRandomizedWeight =
    randomizedWeightBySeller.Player +
    randomizedWeightBySeller["Average NPC"] +
    randomizedWeightBySeller["Local Suppliers"];

  const normalizedShareBySeller = {
    Player: totalRandomizedWeight > 0
      ? randomizedWeightBySeller.Player / totalRandomizedWeight
      : 0,
    "Average NPC": totalRandomizedWeight > 0
      ? randomizedWeightBySeller["Average NPC"] / totalRandomizedWeight
      : 0,
    "Local Suppliers": totalRandomizedWeight > 0
      ? randomizedWeightBySeller["Local Suppliers"] / totalRandomizedWeight
      : 0,
  } as const;
  const rawDemandBySeller: Record<RetailSellerName, number> = {
    Player: totalDemandUnits * normalizedShareBySeller.Player,
    "Average NPC": totalDemandUnits * normalizedShareBySeller["Average NPC"],
    "Local Suppliers": totalDemandUnits * normalizedShareBySeller["Local Suppliers"],
  };
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

  const playerTargetUnits = Math.max(0, Math.floor(rawDemandBySeller.Player));
  const averageNpcTargetUnits = Math.max(0, Math.floor(rawDemandBySeller["Average NPC"]));

  let remainingDemandUnits = totalDemandUnits;
  const playerSoldUnits = Math.min(playerTargetUnits, playerMaxSellUnits, remainingDemandUnits);
  remainingDemandUnits -= playerSoldUnits;

  const averageNpcSoldUnits = Math.min(
    averageNpcTargetUnits,
    averageNpcOfferedQuantity,
    remainingDemandUnits,
  );
  remainingDemandUnits -= averageNpcSoldUnits;

  const localSupplierSoldUnits = Math.max(0, remainingDemandUnits);

  return {
    playerSoldUnits,
    averageNpcSoldUnits,
    localSupplierSoldUnits,
    averageNpcOfferedQuantity,
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
      averageNpcSoldUnits,
      localSupplierSoldUnits,
      averageNpcOfferedQuantity,
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
          sellerName: "Player",
          offeredQuantity: context.listedQuantity,
          offerPrice: context.playerOfferPrice,
          soldQuantity: playerSoldUnits,
        },
        {
          sellerName: "Average NPC",
          offeredQuantity: averageNpcOfferedQuantity,
          offerPrice: context.averageNpcPrice,
          soldQuantity: averageNpcSoldUnits,
        },
        {
          sellerName: "Local Suppliers",
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
