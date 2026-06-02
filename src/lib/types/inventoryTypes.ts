export type ResourceType =
  | "grain"
  | "flour"
  | "sugarcain"
  | "sugar"
  | "bread"
  | "cake";

export interface Inventory {
  grain: number;
  flour: number;
  sugarcain: number;
  sugar: number;
  bread: number;
  cake: number;
}
