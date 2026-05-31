import type { Building } from "./buildingTypes";
import type { Inventory } from "./inventoryTypes";

export interface GameLoopState {
  tick: number;
  money: number;
  inventory: Inventory;
  buildings: Building[];
}
