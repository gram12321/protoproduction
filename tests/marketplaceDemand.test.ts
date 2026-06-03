import {
  calculateBaseCityDemand,
  calculateBaseCityDemandByResource,
  calculateBaseCityPrice,
  resolveNpcRetailOffers,
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
    const offers = result.marketplaceTickResult?.resources[0]?.offers;
    const averageNpcOffer = offers?.find((offer) => offer.sellerName === "Average NPC");
    const followerNpcOffer = offers?.find((offer) => offer.sellerName === "Follower NPC");
    const localSupplierOffer = offers?.find((offer) => offer.sellerName === "Local Suppliers");

    expect(averageNpcOffer?.offeredQuantity).toBe(0);
    expect(averageNpcOffer?.offerPrice).toBe(baseCityPrice);
    expect(followerNpcOffer?.offeredQuantity).toBe(1);
    expect(followerNpcOffer?.offerPrice).toBe(baseCityPrice);
    expect(localSupplierOffer?.offerPrice).toBe(baseCityPrice);
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
    const offers = result.marketplaceTickResult?.resources[0]?.offers;
    const playerOffer = offers?.find((offer) => offer.sellerName === "Player");
    const nonPlayerSoldQuantity = offers?.filter(
      (offer) => offer.sellerName !== "Player",
    ).reduce((sum, offer) => sum + offer.soldQuantity, 0);

    expect(playerOffer?.soldQuantity).toBe(1);
    expect(nonPlayerSoldQuantity).toBe(6);
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

  it("caps Average NPC offer price at base city price", () => {
    const baseCityPrice = calculateBaseCityPrice("bread", "copenhagen");
    const lastTickPlayerPrice = baseCityPrice * 3;
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      baseCityPrice,
      {
        city: "copenhagen",
        resources: [
          {
            resource: "bread",
            baseDemand: calculateBaseCityDemand("copenhagen", "bread"),
            demandShock: null,
            offers: [
              {
                sellerName: "Player",
                offeredQuantity: 1,
                offerPrice: lastTickPlayerPrice,
                soldQuantity: 1,
              },
            ],
          },
        ],
      },
    );

    expect(offers[0]?.sellerName).toBe("Average NPC");
    expect(offers[0]?.offerPrice).toBe(baseCityPrice);
  });

  it("supports multiple NPC strategies in offer resolution", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      10,
      100,
      null,
      {
        strategies: [
          {
            sellerName: "Average NPC",
            calculateOfferPrice: () => 90,
            calculateOfferedQuantity: () => 2,
          },
          {
            sellerName: "Value NPC",
            calculateOfferPrice: () => 80,
            calculateOfferedQuantity: () => 3,
          },
        ],
      },
    );

    expect(offers).toEqual([
      {
        sellerName: "Average NPC",
        offerPrice: 90,
        offeredQuantity: 2,
      },
      {
        sellerName: "Value NPC",
        offerPrice: 80,
        offeredQuantity: 3,
      },
    ]);
  });

  it("sets Follower NPC quantity from last tick player sold quantity", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      calculateBaseCityPrice("bread", "copenhagen"),
      {
        city: "copenhagen",
        resources: [
          {
            resource: "bread",
            baseDemand: calculateBaseCityDemand("copenhagen", "bread"),
            demandShock: null,
            offers: [
              {
                sellerName: "Player",
                offeredQuantity: 10,
                offerPrice: 100,
                soldQuantity: 7,
              },
              {
                sellerName: "Follower NPC",
                offeredQuantity: 5,
                offerPrice: 100,
                soldQuantity: 1,
              },
            ],
          },
        ],
      },
    );

    const followerNpcOffer = offers.find((offer) => offer.sellerName === "Follower NPC");
    expect(followerNpcOffer?.offeredQuantity).toBe(7);
  });

  it("decreases Follower NPC price when its sell-through was below 10 percent", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      calculateBaseCityPrice("bread", "copenhagen"),
      {
        city: "copenhagen",
        resources: [
          {
            resource: "bread",
            baseDemand: calculateBaseCityDemand("copenhagen", "bread"),
            demandShock: null,
            offers: [
              {
                sellerName: "Player",
                offeredQuantity: 10,
                offerPrice: 100,
                soldQuantity: 5,
              },
              {
                sellerName: "Follower NPC",
                offeredQuantity: 10,
                offerPrice: 100,
                soldQuantity: 0,
              },
            ],
          },
        ],
      },
    );

    const followerNpcOffer = offers.find((offer) => offer.sellerName === "Follower NPC");
    expect(followerNpcOffer?.offerPrice).toBeCloseTo(95);
  });

  it("increases Follower NPC price when its sell-through was above 10 percent", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      calculateBaseCityPrice("bread", "copenhagen"),
      {
        city: "copenhagen",
        resources: [
          {
            resource: "bread",
            baseDemand: calculateBaseCityDemand("copenhagen", "bread"),
            demandShock: null,
            offers: [
              {
                sellerName: "Player",
                offeredQuantity: 10,
                offerPrice: 100,
                soldQuantity: 5,
              },
              {
                sellerName: "Follower NPC",
                offeredQuantity: 10,
                offerPrice: 100,
                soldQuantity: 2,
              },
            ],
          },
        ],
      },
    );

    const followerNpcOffer = offers.find((offer) => offer.sellerName === "Follower NPC");
    expect(followerNpcOffer?.offerPrice).toBeCloseTo(105);
  });

  it("applies Follower NPC minimum quantity floor when player has no recent sales", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      calculateBaseCityPrice("bread", "copenhagen"),
      null,
    );

    const followerNpcOffer = offers.find((offer) => offer.sellerName === "Follower NPC");
    expect(followerNpcOffer?.offeredQuantity).toBe(1);
  });

  it("smooths Follower NPC quantity and base price over recent tick history", () => {
    const offers = resolveNpcRetailOffers(
      "bread",
      calculateBaseCityDemand("copenhagen", "bread"),
      calculateBaseCityPrice("bread", "copenhagen"),
      null,
      {
        lastMarketplaceTicks: [
          {
            city: "copenhagen",
            resources: [
              {
                resource: "bread",
                baseDemand: 6,
                demandShock: null,
                offers: [
                  { sellerName: "Player", offeredQuantity: 10, offerPrice: 120, soldQuantity: 8 },
                  { sellerName: "Follower NPC", offeredQuantity: 10, offerPrice: 120, soldQuantity: 0 },
                ],
              },
            ],
          },
          {
            city: "copenhagen",
            resources: [
              {
                resource: "bread",
                baseDemand: 6,
                demandShock: null,
                offers: [
                  { sellerName: "Player", offeredQuantity: 10, offerPrice: 100, soldQuantity: 6 },
                  { sellerName: "Follower NPC", offeredQuantity: 10, offerPrice: 100, soldQuantity: 0 },
                ],
              },
            ],
          },
          {
            city: "copenhagen",
            resources: [
              {
                resource: "bread",
                baseDemand: 6,
                demandShock: null,
                offers: [
                  { sellerName: "Player", offeredQuantity: 10, offerPrice: 80, soldQuantity: 4 },
                  { sellerName: "Follower NPC", offeredQuantity: 10, offerPrice: 80, soldQuantity: 2 },
                ],
              },
            ],
          },
          {
            city: "copenhagen",
            resources: [
              {
                resource: "bread",
                baseDemand: 6,
                demandShock: null,
                offers: [
                  { sellerName: "Player", offeredQuantity: 10, offerPrice: 100, soldQuantity: 2 },
                  { sellerName: "Follower NPC", offeredQuantity: 10, offerPrice: 100, soldQuantity: 2 },
                ],
              },
            ],
          },
        ],
      },
    );

    const followerNpcOffer = offers.find((offer) => offer.sellerName === "Follower NPC");
    expect(followerNpcOffer?.offeredQuantity).toBe(5);
    expect(followerNpcOffer?.offerPrice).toBeCloseTo(100);
  });
});
