import {
  CITY_DATA,
  CITY_TO_NATION_MAP,
  NATION_DATA,
  NATION_TOTAL_POPULATION,
} from "@/lib/constants";

describe("location constants", () => {
  it("maps every city to its nation", () => {
    expect(CITY_TO_NATION_MAP.copenhagen).toBe("denmark");
    expect(CITY_TO_NATION_MAP.aarhus).toBe("denmark");
    expect(CITY_TO_NATION_MAP.cairo).toBe("egypt");
    expect(CITY_TO_NATION_MAP.moscow).toBe("russia");
  });

  it("keeps nation totals equal to the sum of city populations", () => {
    expect(NATION_TOTAL_POPULATION.denmark).toBe(
      CITY_DATA.copenhagen.population + CITY_DATA.aarhus.population,
    );
    expect(NATION_TOTAL_POPULATION.egypt).toBe(CITY_DATA.cairo.population);
    expect(NATION_TOTAL_POPULATION.russia).toBe(CITY_DATA.moscow.population);
  });

  it("keeps city wealth and education anchored to nation values", () => {
    for (const city of Object.values(CITY_DATA)) {
      const nation = NATION_DATA[city.nation];
      expect(city.wealth).toBeGreaterThanOrEqual(0);
      expect(city.wealth).toBeLessThanOrEqual(1);
      expect(city.educationLevel).toBeGreaterThanOrEqual(0);
      expect(city.educationLevel).toBeLessThanOrEqual(1);
      expect(Math.abs(city.wealth - nation.wealth)).toBeLessThanOrEqual(0.1);
      expect(Math.abs(city.educationLevel - nation.educationLevel)).toBeLessThanOrEqual(0.1);
    }
  });
});
