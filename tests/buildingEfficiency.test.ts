import {
  calculateEffectiveBuildingWorkPerTick,
  calculateTargetEfficiencyFromStaffing,
  updateBuildingEfficiency,
} from "@/lib/services";
import type { Building } from "@/lib/types";

function createTestBuilding(partial?: Partial<Building>): Building {
  return {
    id: "farm-1",
    type: "farm",
    size: 1,
    currentStaff: 2,
    previousEfficiency: 1,
    targetEfficiency: 1,
    currentEfficiency: 1,
    currentRecipeWorkProgress: 0,
    recipeType: "produce-grain",
    city: "copenhagen",
    nation: "denmark",
    ...partial,
  };
}

describe("building efficiency overstaffing behavior", () => {
  it("returns exactly 1 target efficiency at full staffing", () => {
    const targetEfficiency = calculateTargetEfficiencyFromStaffing(2, 2);

    expect(targetEfficiency).toBeCloseTo(1);
  });

  it("allows target efficiency above 1 for overstaffed buildings", () => {
    const targetEfficiency = calculateTargetEfficiencyFromStaffing(4, 2);

    expect(targetEfficiency).toBeGreaterThan(1);
  });

  it("keeps updated current efficiency above 1 when already over 1", () => {
    const nextBuilding = updateBuildingEfficiency(
      createTestBuilding({ currentStaff: 4, currentEfficiency: 1.1 }),
    );

    expect(nextBuilding.currentEfficiency).toBeGreaterThan(1);
  });

  it("does not cap effective building work at 100 percent efficiency", () => {
    const effectiveWork = calculateEffectiveBuildingWorkPerTick(
      createTestBuilding({ currentStaff: 2, currentEfficiency: 1.25 }),
    );

    expect(effectiveWork).toBeCloseTo(125);
  });
});
