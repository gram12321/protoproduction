import { BASE_CONSUMPTION_BY_RESOURCE, CITY_DATA } from "@/lib/constants";
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

function calculateDemandShareFromPrice(
  ownPrice: number,
  competingPrice: number,
): number {
  const safeOwnPrice = Math.max(ownPrice, Number.EPSILON);
  const safeCompetingPrice = Math.max(competingPrice, Number.EPSILON);
  const ownWeight = 1 / safeOwnPrice;
  const competingWeight = 1 / safeCompetingPrice;

  return ownWeight / (ownWeight + competingWeight);
}

export function resolveCityMarketplaceTick(
  inventory: Inventory,
  city: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>>,
  offerPriceByResource: Partial<Record<ResourceType, number>>,
): {
  nextInventory: Inventory;
  earnedMoney: number;
  marketplaceTickResult: MarketplaceTickResult | null;
} {
  const nextInventory = { ...inventory };
  let earnedMoney = 0;
  const resourceResults: MarketplaceResourceTickResult[] = [];

  for (const resource of Object.keys(BASE_CONSUMPTION_BY_RESOURCE) as ResourceType[]) {
    const listedQuantity = Math.floor(
      Math.max(0, listedQuantityByResource[resource] ?? 0),
    );
    const offerPrice = offerPriceByResource[resource];
    const availableInventory = Math.floor(Math.max(0, nextInventory[resource]));
    const hasPlayerOffer = listedQuantity > 0 && offerPrice !== undefined && offerPrice > 0;

    if (!hasPlayerOffer) {
      continue;
    }

    const baseDemand = calculateBaseCityDemand(city, resource);
    const totalDemandUnits = Math.round(baseDemand);
    const localSupplierPrice = calculateBaseCityPrice(resource, city);
    const playerDemandShare =
      baseDemand * calculateDemandShareFromPrice(offerPrice, localSupplierPrice);
    const playerDemandUnits = Math.round(playerDemandShare);
    const soldAmount = availableInventory > 0
      ? Math.min(playerDemandUnits, listedQuantity, availableInventory)
      : 0;
    const localSupplierSoldQuantity = Math.max(0, totalDemandUnits - soldAmount);

    nextInventory[resource] -= soldAmount;
    earnedMoney += soldAmount * offerPrice;
    resourceResults.push({
      resource,
      baseDemand,
      offers: [
        {
          sellerName: "Player",
          offeredQuantity: listedQuantity,
          offerPrice,
          soldQuantity: soldAmount,
        },
        {
          sellerName: "Local Suppliers",
          offeredQuantity: null,
          offerPrice: localSupplierPrice,
          soldQuantity: localSupplierSoldQuantity,
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
