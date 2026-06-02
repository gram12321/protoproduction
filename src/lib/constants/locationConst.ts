import type {
  CityDefinition,
  CityToNationMap,
  CityType,
  NationDefinition,
  NationType,
  NationPopulationMap,
} from "@/lib/types";
import { clamp01 } from "@/lib/utils";

interface CityBaselineDefinition {
  nation: NationType;
  population: number;
  wealthDelta: number;
  educationLevelDelta: number;
}

export const NATION_DATA: Record<NationType, NationDefinition> = {
  denmark: {
    wealth: 0.9,
    educationLevel: 0.88,
  },
  egypt: {
    wealth: 0.45,
    educationLevel: 0.57,
  },
  russia: {
    wealth: 0.63,
    educationLevel: 0.75,
  },
};

const CITY_BASELINE_DATA: Record<CityType, CityBaselineDefinition> = {
  copenhagen: {
    nation: "denmark",
    population: 660000,
    wealthDelta: 0.03,
    educationLevelDelta: 0.04,
  },
  aarhus: {
    nation: "denmark",
    population: 290000,
    wealthDelta: 0.01,
    educationLevelDelta: -0.02,
  },
  cairo: {
    nation: "egypt",
    population: 10200000,
    wealthDelta: -0.02,
    educationLevelDelta: -0.03,
  },
  moscow: {
    nation: "russia",
    population: 13000000,
    wealthDelta: 0.02,
    educationLevelDelta: 0.01,
  },
};

export const CITY_DATA: Record<CityType, CityDefinition> = Object.entries(
  CITY_BASELINE_DATA,
).reduce((result, [cityName, cityBaseline]) => {
  const city = cityName as CityType;
  const nationValues = NATION_DATA[cityBaseline.nation];
  result[city] = {
    nation: cityBaseline.nation,
    population: cityBaseline.population,
    wealth: clamp01(nationValues.wealth + cityBaseline.wealthDelta),
    educationLevel: clamp01(
      nationValues.educationLevel + cityBaseline.educationLevelDelta,
    ),
  };
  return result;
}, {} as Record<CityType, CityDefinition>);

export const CITY_TO_NATION_MAP: CityToNationMap = {
  copenhagen: CITY_DATA.copenhagen.nation,
  aarhus: CITY_DATA.aarhus.nation,
  cairo: CITY_DATA.cairo.nation,
  moscow: CITY_DATA.moscow.nation,
};

const BASE_NATION_POPULATION: NationPopulationMap = {
  denmark: 0,
  egypt: 0,
  russia: 0,
};

export const NATION_TOTAL_POPULATION: NationPopulationMap = Object.values(
  CITY_DATA,
).reduce((totals, city) => {
  totals[city.nation] += city.population;
  return totals;
}, { ...BASE_NATION_POPULATION });
