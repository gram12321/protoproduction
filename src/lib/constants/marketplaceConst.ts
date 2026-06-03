import type { ResourceType } from "@/lib/types";

export const AVERAGE_NPC_DEMAND_SHARE = 0.2;

export type ResourceMarketLevel = "raw" | "intermediate" | "finished";

export const RESOURCE_MARKET_LEVEL_BY_RESOURCE: Record<ResourceType, ResourceMarketLevel> = {
  grain: "raw",
  water: "raw",
  flour: "intermediate",
  sugarcain: "raw",
  sugar: "intermediate",
  bread: "finished",
  cake: "finished",
};

export const CROSS_LEVEL_ELASTICITY: Record<
  ResourceMarketLevel,
  Record<ResourceMarketLevel, number>
> = {
  raw: {
    raw: 0.7,
    intermediate: 0.2,
    finished: 0.1,
  },
  intermediate: {
    raw: 0.2,
    intermediate: 0.6,
    finished: 0.3,
  },
  finished: {
    raw: 0.1,
    intermediate: 0.3,
    finished: 0.5,
  },
};

export const SUBSTITUTION_DEVIATION_THRESHOLD = 0.02;
export const SUBSTITUTION_DAMPENING = 0.5;
export const DEMAND_CREATION_SENSITIVITY_MULTIPLIER = 0.8;
export const DEMAND_CREATION_MAX_ADDITIONAL_MULTIPLIER = 0.5;
export const DEMAND_CREATION_DAMPENING = 0.3;
export const DEMAND_SHOCK_CHANCE = 0.05;
export const DEMAND_SHOCK_NEGATIVE_MULTIPLIER = 0.85;
export const DEMAND_SHOCK_POSITIVE_MULTIPLIER = 1.15;

export const INTER_RETAILER_SENSITIVITY: Record<ResourceType, number> = {
  grain: 0.4,
  water: 0.4,
  flour: 0.5,
  sugarcain: 0.4,
  sugar: 0.4,
  bread: 0.3,
  cake: 1.2,
};