import { BASE_CONSUMPTION_BY_RESOURCE, CITY_DATA } from "@/lib/constants";
import type { CityType, ResourceType } from "@/lib/types";

export function calculateBaseCityDemand(
  city: CityType,
  resource: ResourceType,
): number {
  return CITY_DATA[city].population * BASE_CONSUMPTION_BY_RESOURCE[resource];
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
