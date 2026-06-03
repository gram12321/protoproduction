import {
  calculateBaseCityDemand,
  calculateBaseCityDemandByResource,
  calculateBaseCityPrice,
  resolveCityMarketplaceTick,
} from "@/lib/services";
import { INITIAL_GAME_LOOP_STATE } from "@/lib/constants";

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
    );

    expect(result.nextInventory.grain).toBe(1);
    expect(result.earnedMoney).toBe(0);
    expect(result.marketplaceTickResult).toEqual({
      city: "copenhagen",
      resources: [
        {
          resource: "grain",
          baseDemand: calculateBaseCityDemand("copenhagen", "grain"),
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
    );

    expect(result.nextInventory.bread).toBe(1);
    expect(result.earnedMoney).toBe(1);
    expect(result.marketplaceTickResult?.resources[0]?.offers[0]?.soldQuantity).toBe(1);
    expect(result.marketplaceTickResult?.resources[0]?.offers[1]?.soldQuantity).toBe(0);
    expect(result.marketplaceTickResult?.resources[0]?.offers[2]?.soldQuantity).toBe(5);
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
    );

    const averageNpcOffer = result.marketplaceTickResult?.resources[0]?.offers.find(
      (offer) => offer.sellerName === "Average NPC",
    );

    expect(averageNpcOffer?.offeredQuantity).toBe(Math.round(baseDemand * 0.2));
    expect(averageNpcOffer?.offerPrice).toBe((localSupplierPrice + lastTickPlayerPrice) / 2);
  });
});
