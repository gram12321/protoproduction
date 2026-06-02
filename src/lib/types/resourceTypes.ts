export interface ResourceDefinition {
  isCycleDependentResource: boolean;
  fixedBaseCost?: number;
}

export const RESOURCE_DEFINITIONS = {
  grain: {
    isCycleDependentResource: false,
  },
  water: {
    isCycleDependentResource: true,
    // Mirrors the current no-input pump-water intrinsic cost. Update if recipe or wage inputs change.
    // 80 workRequired / 50 baseWorkPerWorkerPerTick * 10 baseWage = 16
    fixedBaseCost: 16,
  },
  flour: {
    isCycleDependentResource: false,
  },
  sugarcain: {
    isCycleDependentResource: false,
  },
  sugar: {
    isCycleDependentResource: false,
  },
  bread: {
    isCycleDependentResource: false,
  },
  cake: {
    isCycleDependentResource: false,
  },
} satisfies Record<string, ResourceDefinition>;

export type ResourceType = keyof typeof RESOURCE_DEFINITIONS;
