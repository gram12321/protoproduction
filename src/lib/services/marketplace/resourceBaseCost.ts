import {
  CITY_DATA,
  BASE_WAGE,
  BASE_WORK_PER_WORKER_PER_TICK,
  RECIPE_BY_TYPE,
} from "@/lib/constants";
import {
  RESOURCE_DEFINITIONS,
  type CityType,
  type ProductionRecipe,
  type ResourceType,
} from "@/lib/types";

function getRecipesByOutputResource(resource: ResourceType): ProductionRecipe[] {
  return Object.values(RECIPE_BY_TYPE).filter(
    (recipe) => recipe.output.resource === resource,
  );
}

function calculateRecipeLaborCost(recipe: ProductionRecipe): number {
  const safeOutputAmount = Math.max(recipe.output.amount, Number.EPSILON);
  return (recipe.workRequired / BASE_WORK_PER_WORKER_PER_TICK) *
    BASE_WAGE / safeOutputAmount;
}

function calculateBaseResourceCostInternal(
  resource: ResourceType,
  resolvingResources: Set<ResourceType>,
  memoizedResourceCosts: Map<ResourceType, number>,
): number {
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];

  if (resourceDefinition.isCycleDependentResource) {
    if (resourceDefinition.fixedBaseCost === undefined) {
      throw new Error(
        `Cycle-dependent resource "${resource}" is missing fixedBaseCost.`,
      );
    }

    return resourceDefinition.fixedBaseCost;
  }

  const memoizedCost = memoizedResourceCosts.get(resource);

  if (memoizedCost !== undefined) {
    return memoizedCost;
  }

  if (resolvingResources.has(resource)) {
    throw new Error(
      `Circular base resource cost dependency detected for "${resource}".`,
    );
  }

  const recipes = getRecipesByOutputResource(resource);

  if (recipes.length === 0) {
    throw new Error(`Resource "${resource}" is missing a producing recipe.`);
  }

  resolvingResources.add(resource);

  const cheapestRecipeCost = Math.min(
    ...recipes.map((recipe) => {
      const inputCost = (recipe.input ?? []).reduce((total, input) => {
        return total + input.amount * calculateBaseResourceCostInternal(
          input.resource,
          resolvingResources,
          memoizedResourceCosts,
        );
      }, 0);

      return calculateRecipeLaborCost(recipe) + inputCost;
    }),
  );

  resolvingResources.delete(resource);
  memoizedResourceCosts.set(resource, cheapestRecipeCost);

  return cheapestRecipeCost;
}

export function calculateBaseResourceCost(resource: ResourceType): number {
  return calculateBaseResourceCostInternal(resource, new Set(), new Map());
}

export function calculateBaseResourceCostByResource(): Record<ResourceType, number> {
  return Object.fromEntries(
    Object.keys(RESOURCE_DEFINITIONS).map((resource) => [
      resource,
      calculateBaseResourceCost(resource as ResourceType),
    ]),
  ) as Record<ResourceType, number>;
}

export function calculateBaseCityPrice(
  resource: ResourceType,
  city: CityType,
): number {
  return calculateBaseResourceCost(resource) * (1 + CITY_DATA[city].wealth);
}

export function calculateBaseCityPriceByResource(
  city: CityType,
): Record<ResourceType, number> {
  return Object.fromEntries(
    Object.keys(RESOURCE_DEFINITIONS).map((resource) => [
      resource,
      calculateBaseCityPrice(resource as ResourceType, city),
    ]),
  ) as Record<ResourceType, number>;
}
