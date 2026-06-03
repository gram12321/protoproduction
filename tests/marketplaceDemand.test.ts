import {
  calculateBaseCityDemand,
  calculateBaseCityDemandByResource,
  calculateBaseCityPrice,
  resolveCityMarketplaceTick,
} from "@/lib/services";
import { INITIAL_GAME_LOOP_STATE } from "@/lib/constants";

describe("marketplace demand", () => {
  const noShockRandom = () => 0.5;

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

  it("splits demand with local suppliers when the player matches base city price", () => {
    const baseCityPrice = calculateBaseCityPrice("grain", "copenhagen");
    const result = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        grain: 1,
      },
      "copenhagen",
      { grain: 1 },
      { grain: baseCityPrice },
      undefined,
      { randomFn: noShockRandom },
    );

    expect(result.nextInventory.grain).toBe(1);
    expect(result.earnedMoney).toBe(0);
    expect(result.marketplaceTickResult).toEqual({
      city: "copenhagen",
      resources: [
        {
          resource: "grain",
          baseDemand: calculateBaseCityDemand("copenhagen", "grain"),
          demandShock: null,
          offers: [
            {
              sellerName: "Player",
              offeredQuantity: 1,
              offerPrice: baseCityPrice,
              soldQuantity: 0,
            },
            {
              sellerName: "Average NPC",
              offeredQuantity: 0,
              offerPrice: baseCityPrice,
              soldQuantity: 0,
            },
            {
              sellerName: "Local Suppliers",
              offeredQuantity: null,
              offerPrice: baseCityPrice,
              soldQuantity: 0,
            },
          ],
        },
      ],
    });
  });

  it("caps player sales by listed quantity and available inventory in whole units", () => {
    const result = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 2,
      },
      "copenhagen",
      { bread: 1 },
      { bread: 1 },
      undefined,
      { randomFn: noShockRandom },
    );

    expect(result.nextInventory.bread).toBe(1);
    expect(result.earnedMoney).toBe(1);
    expect(result.marketplaceTickResult?.resources[0]?.offers[0]?.soldQuantity).toBe(1);
    expect(result.marketplaceTickResult?.resources[0]?.offers[1]?.soldQuantity).toBe(1);
    expect(result.marketplaceTickResult?.resources[0]?.offers[2]?.soldQuantity).toBe(5);
  });

  it("reacts more strongly to cheap price for high-sensitivity resources", () => {
    const breadBasePrice = calculateBaseCityPrice("bread", "copenhagen");
    const cakeBasePrice = calculateBaseCityPrice("cake", "copenhagen");
    const cheapBreadPrice = breadBasePrice * 0.1;
    const cheapCakePrice = cakeBasePrice * 0.1;

    const breadResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 999,
      },
      "copenhagen",
      { bread: 999 },
      { bread: cheapBreadPrice },
      undefined,
      { randomFn: noShockRandom },
    );

    const cakeResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        cake: 999,
      },
      "copenhagen",
      { cake: 999 },
      { cake: cheapCakePrice },
      undefined,
      { randomFn: noShockRandom },
    );

    const breadPlayerSold = breadResult.marketplaceTickResult?.resources[0]?.offers[0]?.soldQuantity;
    const cakePlayerSold = cakeResult.marketplaceTickResult?.resources[0]?.offers[0]?.soldQuantity;
    const roundedBreadDemand = Math.round(calculateBaseCityDemand("copenhagen", "bread"));
    const roundedCakeDemand = Math.round(calculateBaseCityDemand("copenhagen", "cake"));

    expect(breadPlayerSold).toBeLessThan(roundedBreadDemand);
    expect(cakePlayerSold).toBeGreaterThanOrEqual(roundedCakeDemand);
  });

  it("shifts demand toward a relatively cheaper substitute resource", () => {
    const breadBasePrice = calculateBaseCityPrice("bread", "copenhagen");
    const cakeBasePrice = calculateBaseCityPrice("cake", "copenhagen");
    const cakeOnlyResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        cake: 999,
      },
      "copenhagen",
      { cake: 999 },
      { cake: cakeBasePrice },
      undefined,
      { randomFn: noShockRandom },
    );
    const withExpensiveBreadResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 999,
        cake: 999,
      },
      "copenhagen",
      { bread: 999, cake: 999 },
      { bread: breadBasePrice * 5, cake: cakeBasePrice },
      undefined,
      { randomFn: noShockRandom },
    );

    const cakeOnlyTotalSold =
      cakeOnlyResult.marketplaceTickResult?.resources[0]?.offers.reduce(
        (sum, offer) => sum + offer.soldQuantity,
        0,
      ) ?? 0;
    const cakeWithExpensiveBreadTotalSold =
      withExpensiveBreadResult.marketplaceTickResult?.resources
        .find((resourceResult) => resourceResult.resource === "cake")
        ?.offers.reduce((sum, offer) => sum + offer.soldQuantity, 0) ?? 0;

    expect(cakeWithExpensiveBreadTotalSold).toBeGreaterThan(cakeOnlyTotalSold);
  });

  it("creates extra demand when a resource is priced below retailer average", () => {
    const breadBasePrice = calculateBaseCityPrice("bread", "copenhagen");
    const baselineResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 999,
      },
      "copenhagen",
      { bread: 999 },
      { bread: breadBasePrice },
      undefined,
      { randomFn: noShockRandom },
    );
    const cheapPriceResult = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 999,
      },
      "copenhagen",
      { bread: 999 },
      { bread: breadBasePrice * 0.2 },
      undefined,
      { randomFn: noShockRandom },
    );

    const baselineTotalSold =
      baselineResult.marketplaceTickResult?.resources[0]?.offers.reduce(
        (sum, offer) => sum + offer.soldQuantity,
        0,
      ) ?? 0;
    const cheapPriceTotalSold =
      cheapPriceResult.marketplaceTickResult?.resources[0]?.offers.reduce(
        (sum, offer) => sum + offer.soldQuantity,
        0,
      ) ?? 0;

    expect(cheapPriceTotalSold).toBeGreaterThanOrEqual(baselineTotalSold);
  });

  it("uses last tick player price to calculate Average NPC offer price", () => {
    const lastTickPlayerPrice = 10;
    const localSupplierPrice = calculateBaseCityPrice("bread", "copenhagen");
    const baseDemand = calculateBaseCityDemand("copenhagen", "bread");
    const result = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 1,
      },
      "copenhagen",
      { bread: 1 },
      { bread: localSupplierPrice },
      {
        city: "copenhagen",
        resources: [
          {
            resource: "bread",
            baseDemand,
            demandShock: null,
            offers: [
              {
                sellerName: "Player",
                offeredQuantity: 1,
                offerPrice: lastTickPlayerPrice,
                soldQuantity: 1,
              },
              {
                sellerName: "Local Suppliers",
                offeredQuantity: null,
                offerPrice: localSupplierPrice,
                soldQuantity: 5,
              },
            ],
          },
        ],
      },
      { randomFn: noShockRandom },
    );

    const averageNpcOffer = result.marketplaceTickResult?.resources[0]?.offers.find(
      (offer) => offer.sellerName === "Average NPC",
    );

    expect(averageNpcOffer?.offeredQuantity).toBe(Math.round(baseDemand * 0.2));
    expect(averageNpcOffer?.offerPrice).toBe((localSupplierPrice + lastTickPlayerPrice) / 2);
  });

  it("reports per-resource demand shock details in snapshot", () => {
    const randomValues = [0.01, 0.0, 0.0];
    let randomIndex = 0;
    const deterministicShockRandom = () => {
      const value = randomValues[randomIndex] ?? 0.99;
      randomIndex += 1;
      return value;
    };

    const result = resolveCityMarketplaceTick(
      {
        ...INITIAL_GAME_LOOP_STATE.inventory,
        bread: 999,
      },
      "copenhagen",
      { bread: 999 },
      { bread: 1 },
      undefined,
      { randomFn: deterministicShockRandom },
    );

    const breadResult = result.marketplaceTickResult?.resources.find(
      (resourceResult) => resourceResult.resource === "bread",
    );

    expect(breadResult?.demandShock).not.toBeNull();
    expect(breadResult?.demandShock?.sellerName).toBe("Player");
    expect(breadResult?.demandShock?.multiplier).toBe(0.85);
  });
});
