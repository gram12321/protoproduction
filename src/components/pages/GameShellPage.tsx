import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CityMarketplaceCard,
} from "@/components/ui";
import {
  AVAILABLE_RECIPE_TYPES_BY_BUILDING_TYPE,
  CITY_TYPES,
  getNationForCity,
  RECIPE_BY_TYPE,
} from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { BuildingType, CityType, RecipeType } from "@/lib/types";
import {
  calculateMaxStaff,
  calculateEffectiveBuildingWorkPerTick,
  canStartRecipeFromInventory,
  createBuilding,
  createInitialGameLoopState,
  decreaseBuildingSize,
  formatRecipeInputRequirements,
  getMinimumWorkersForBuildingType,
  increaseBuildingSize,
  processGameTick,
  setBuildingRecipeType,
  setBuildingStaff,
} from "@/lib/services";

function formatLocationName(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GameShellPage() {
  const [gameState, setGameState] = useState(createInitialGameLoopState);
  const [selectedBuildingType, setSelectedBuildingType] =
    useState<BuildingType>("farm");
  const [selectedCity, setSelectedCity] = useState<CityType | "">("");

  function handleStaffChange(buildingId: string, requestedStaff: number) {
    setGameState((previousState) =>
      setBuildingStaff(previousState, buildingId, requestedStaff),
    );
  }

  function handleRunTick() {
    setGameState((previousState) => processGameTick(previousState));
  }

  function handleCreateBuilding() {
    if (!selectedCity) {
      return;
    }

    setGameState((previousState) =>
      createBuilding(previousState, selectedBuildingType, selectedCity),
    );
  }

  function handleIncreaseBuildingSize(buildingId: string) {
    setGameState((previousState) =>
      increaseBuildingSize(previousState, buildingId),
    );
  }

  function handleDecreaseBuildingSize(buildingId: string) {
    setGameState((previousState) =>
      decreaseBuildingSize(previousState, buildingId),
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="container py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                Smallest game loop
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
                Build farms, food processing factories, and bakeries.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Recipe chains now support multiple building types and ingredient
                requirements across production steps.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                id="building-type-select"
                value={selectedBuildingType}
                onChange={(event) =>
                  setSelectedBuildingType(event.target.value as BuildingType)
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Building type"
              >
                <option value="farm">Farm</option>
                <option value="foodprocessingfactory">
                  Food processing factory
                </option>
                <option value="bakery">Bakery</option>
              </select>
              <select
                id="building-city-select"
                value={selectedCity}
                onChange={(event) =>
                  setSelectedCity(event.target.value as CityType | "")
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
                aria-label="Building city"
              >
                <option value="">Select city</option>
                {CITY_TYPES.map((city) => (
                  <option key={city} value={city}>
                    {formatLocationName(city)}
                  </option>
                ))}
              </select>
              <Button
                size="lg"
                variant="outline"
                onClick={handleCreateBuilding}
                disabled={!selectedCity}
              >
                Build building
              </Button>
              <Button size="lg" onClick={handleRunTick}>
                Run 1 tick
              </Button>
            </div>
            {selectedCity && (
              <p className="text-sm text-muted-foreground">
                Nation: {formatLocationName(getNationForCity(selectedCity))}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {gameState.buildings.map((building) => {
                const maxStaff = calculateMaxStaff(building.type, building.size);
                const recipe = RECIPE_BY_TYPE[building.recipeType];
                const availableRecipeTypes =
                  AVAILABLE_RECIPE_TYPES_BY_BUILDING_TYPE[building.type];
                const effectiveWorkThisTick =
                  calculateEffectiveBuildingWorkPerTick(building);
                const canStartRecipe = canStartRecipeFromInventory(
                  building,
                  recipe,
                  gameState.inventory,
                );

                return (
                  <Card key={building.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize">
                        {building.type} ({building.id})
                      </CardTitle>
                      <CardDescription>Recipe: {recipe.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6">
                      <p>City: {formatLocationName(building.city)}</p>
                      <p>Nation: {formatLocationName(building.nation)}</p>
                      <label
                        htmlFor={`recipe-select-${building.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Recipe
                      </label>
                      <select
                        id={`recipe-select-${building.id}`}
                        value={building.recipeType}
                        onChange={(event) =>
                          setGameState((previousState) =>
                            setBuildingRecipeType(
                              previousState,
                              building.id,
                              event.target.value as RecipeType,
                            ),
                          )
                        }
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        aria-label={`Recipe for ${building.id}`}
                      >
                        {availableRecipeTypes.map((recipeType) => (
                          <option key={recipeType} value={recipeType}>
                            {RECIPE_BY_TYPE[recipeType].name}
                          </option>
                        ))}
                      </select>
                      <p>Building size: {building.size}</p>
                      <p>
                        Min workers: {getMinimumWorkersForBuildingType(building.type)}
                      </p>
                      <p>Max staff: {maxStaff}</p>
                      <p>Current staff: {building.currentStaff}</p>
                      <p>
                        Previous efficiency:{" "}
                        {formatNumber(building.previousEfficiency, {
                          decimals: 3,
                          forceDecimals: true,
                        })}
                      </p>
                      <p>
                        Current efficiency:{" "}
                        {formatNumber(building.currentEfficiency, {
                          decimals: 3,
                          forceDecimals: true,
                        })}
                      </p>
                      <p>
                        Target efficiency:{" "}
                        {formatNumber(building.targetEfficiency, {
                          decimals: 3,
                          forceDecimals: true,
                        })}
                      </p>
                      <p>Work required: {recipe.workRequired}</p>
                      <p>
                        Effective work this tick:{" "}
                        {formatNumber(effectiveWorkThisTick, {
                          decimals: 3,
                          forceDecimals: true,
                        })}
                      </p>
                      <p>
                        Current recipe work progress:{" "}
                        {formatNumber(building.currentRecipeWorkProgress, {
                          decimals: 3,
                          forceDecimals: true,
                        })}
                      </p>
                      {!canStartRecipe && recipe.input?.length && (
                        <p className="text-xs font-medium text-destructive">
                          Cannot start production: need{" "}
                          {formatRecipeInputRequirements(recipe)}.
                        </p>
                      )}

                      <label
                        htmlFor={`staff-slider-${building.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Staff: {building.currentStaff} / {maxStaff}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncreaseBuildingSize(building.id)}
                        >
                          Increase size +1
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecreaseBuildingSize(building.id)}
                        >
                          Decrease size -1
                        </Button>
                      </div>
                      <input
                        id={`staff-slider-${building.id}`}
                        type="range"
                        min={0}
                        max={maxStaff}
                        value={building.currentStaff}
                        onChange={(event) =>
                          handleStaffChange(
                            building.id,
                            Number(event.target.value),
                          )
                        }
                        className="w-full"
                        aria-label={`Hire staff for ${building.id}`}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <CityMarketplaceCard />

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Simulation state</CardTitle>
                <CardDescription>Global resources and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6">
                <p>Current tick: {gameState.tick}</p>
                <p>Money: {formatNumber(gameState.money, { currency: true })}</p>
                <p>Buildings count: {gameState.buildings.length}</p>
                <p>Grain in inventory: {gameState.inventory.grain}</p>
                <p>Flour in inventory: {gameState.inventory.flour}</p>
                <p>Sugarcain in inventory: {gameState.inventory.sugarcain}</p>
                <p>Sugar in inventory: {gameState.inventory.sugar}</p>
                <p>Bread in inventory: {gameState.inventory.bread}</p>
                <p>Cake in inventory: {gameState.inventory.cake}</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
