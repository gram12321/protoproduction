import { calculateBaseCityDemand, calculateBaseCityDemandByResource } from "@/lib/services";

describe("marketplace demand", () => {
  it("calculates base city demand from city population and base consumption", () => {
    expect(calculateBaseCityDemand("copenhagen", "grain")).toBe(660);
    expect(calculateBaseCityDemand("copenhagen", "bread")).toBe(66000);
    expect(calculateBaseCityDemand("aarhus", "cake")).toBe(14500);
    expect(calculateBaseCityDemand("cairo", "sugar")).toBe(102000);
  });

  it("builds a full resource demand map for a city", () => {
    expect(calculateBaseCityDemandByResource("moscow")).toEqual({
      grain: 13000,
      flour: 39000,
      sugarcain: 1300,
      sugar: 130000,
      bread: 1300000,
      cake: 650000,
    });
  });
});
