import type { Inventory, ResourceType } from "@/lib/types";

export function addResource(
  inventory: Inventory,
  resource: ResourceType,
  amount: number,
): Inventory {
  return {
    ...inventory,
    [resource]: inventory[resource] + amount,
  };
}
