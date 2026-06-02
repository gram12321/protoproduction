import { calculateBaseCityDemand, calculateBaseCityDemandByResource } from "@/lib/services";

describe("marketplace demand", () => {
  it("calculates base city demand from city population, wealth, and base consumption", () => {
    expect(calculateBaseCityDemand("copenhagen", "grain")).toBeCloseTo(0.06138);
    expect(calculateBaseCityDemand("copenhagen", "bread")).toBeCloseTo(6.138);
    expect(calculateBaseCityDemand("aarhus", "cake")).toBeCloseTo(1.3195);
    expect(calculateBaseCityDemand("cairo", "sugar")).toBeCloseTo(4.386);
  });

  it("builds a full resource demand map for a city", () => {
    expect(calculateBaseCityDemandByResource("moscow")).toEqual({
      grain: 0.845,
      water: 16.9,
      flour: 2.535,
      sugarcain: 0.0845,
      sugar: 8.45,
      bread: 84.5,
      cake: 42.25,
    });
  });
});
