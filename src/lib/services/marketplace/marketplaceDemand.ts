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

function calculatePriceWeight(price: number): number {
  return 1 / Math.max(price, Number.EPSILON);
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

export function resolveCityMarketplaceTick(
  inventory: Inventory,
  city: CityType,
  listedQuantityByResource: Partial<Record<ResourceType, number>>,
  offerPriceByResource: Partial<Record<ResourceType, number>>,
  lastMarketplaceTick?: MarketplaceTickResult | null,
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
    const lastTickPlayerPrice = findLastTickPlayerOfferPrice(
      lastMarketplaceTick,
      resource,
    );
    const averageNpcPrice =
      lastTickPlayerPrice !== undefined
        ? (localSupplierPrice + lastTickPlayerPrice) / 2
        : localSupplierPrice;
    const averageNpcOfferedQuantity = Math.max(0, Math.round(baseDemand * 0.2));

    const playerMaxSellUnits = Math.min(listedQuantity, availableInventory);
    const playerWeight = calculatePriceWeight(offerPrice);
    const averageNpcWeight = calculatePriceWeight(averageNpcPrice);
    const localSupplierWeight = calculatePriceWeight(localSupplierPrice);
    const totalWeight = playerWeight + averageNpcWeight + localSupplierWeight;

    let remainingDemandUnits = totalDemandUnits;
    const playerTargetUnits = totalWeight > 0
      ? Math.round((totalDemandUnits * playerWeight) / totalWeight)
      : 0;
    const playerSoldUnits = Math.min(playerTargetUnits, playerMaxSellUnits, remainingDemandUnits);
    remainingDemandUnits -= playerSoldUnits;

    const averageNpcTargetUnits = totalWeight > 0
      ? Math.round((totalDemandUnits * averageNpcWeight) / totalWeight)
      : 0;
    const averageNpcSoldUnits = Math.min(
      averageNpcTargetUnits,
      averageNpcOfferedQuantity,
      remainingDemandUnits,
    );
    remainingDemandUnits -= averageNpcSoldUnits;

    const localSupplierSoldQuantity = Math.max(0, remainingDemandUnits);

    nextInventory[resource] -= playerSoldUnits;
    earnedMoney += playerSoldUnits * offerPrice;
    resourceResults.push({
      resource,
      baseDemand,
      offers: [
        {
          sellerName: "Player",
          offeredQuantity: listedQuantity,
          offerPrice,
          soldQuantity: playerSoldUnits,
        },
        {
          sellerName: "Average NPC",
          offeredQuantity: averageNpcOfferedQuantity,
          offerPrice: averageNpcPrice,
          soldQuantity: averageNpcSoldUnits,
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
