export type NationType = "denmark" | "egypt" | "russia";

export type CityType = "copenhagen" | "aarhus" | "cairo" | "moscow";

export interface NationDefinition {
  wealth: number;
  educationLevel: number;
}

export interface CityDefinition {
  nation: NationType;
  population: number;
  wealth: number;
  educationLevel: number;
}

export type CityToNationMap = Record<CityType, NationType>;

export type NationPopulationMap = Record<NationType, number>;
