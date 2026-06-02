import type { ResourceType } from "@/lib/types";

// General rule: earlier-chain resources should usually be consumed at lower
// rates than later-chain resources.
// Food consumption can draw from inputs like grain and sugarcane now, while
// later resources such as iron ore may end up with no end-consumer demand.
export const BASE_CONSUMPTION_BY_RESOURCE: Record<ResourceType, number> = {
  grain: 0.001,
  water: 0.02,
  flour: 0.003,
  sugarcain: 0.0001,
  sugar: 0.01,
  bread: 0.1,
  cake: 0.05,
};
