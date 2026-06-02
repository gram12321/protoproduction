import {
  calculateBaseCityPrice,
  calculateBaseCityPriceByResource,
  calculateBaseResourceCost,
  calculateBaseResourceCostByResource,
} from "@/lib/services";

describe("resource base cost", () => {
  it("calculates intrinsic base cost for individual resources", () => {
    expect(calculateBaseResourceCost("grain")).toBeCloseTo(20);
    expect(calculateBaseResourceCost("water")).toBeCloseTo(16);
    expect(calculateBaseResourceCost("flour")).toBeCloseTo(40);
    expect(calculateBaseResourceCost("sugarcain")).toBeCloseTo(24);
    expect(calculateBaseResourceCost("sugar")).toBeCloseTo(44);
    expect(calculateBaseResourceCost("bread")).toBeCloseTo(64);
    expect(calculateBaseResourceCost("cake")).toBeCloseTo(160);
  });

  it("builds a full intrinsic base cost map", () => {
    expect(calculateBaseResourceCostByResource()).toEqual({
      grain: 20,
      water: 16,
      flour: 40,
      sugarcain: 24,
      sugar: 44,
      bread: 64,
      cake: 160,
    });
  });

  it("calculates city-adjusted base price from base cost and city wealth", () => {
    expect(calculateBaseCityPrice("grain", "copenhagen")).toBeCloseTo(38.6);
    expect(calculateBaseCityPrice("water", "copenhagen")).toBeCloseTo(30.88);
    expect(calculateBaseCityPrice("cake", "aarhus")).toBeCloseTo(305.6);
  });

  it("builds a full city-adjusted base price map", () => {
    const baseCityPriceByResource = calculateBaseCityPriceByResource("copenhagen");

    expect(baseCityPriceByResource.grain).toBeCloseTo(38.6);
    expect(baseCityPriceByResource.water).toBeCloseTo(30.88);
    expect(baseCityPriceByResource.flour).toBeCloseTo(77.2);
    expect(baseCityPriceByResource.sugarcain).toBeCloseTo(46.32);
    expect(baseCityPriceByResource.sugar).toBeCloseTo(84.92);
    expect(baseCityPriceByResource.bread).toBeCloseTo(123.52);
    expect(baseCityPriceByResource.cake).toBeCloseTo(308.8);
  });
});
