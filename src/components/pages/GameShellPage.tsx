import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { RECIPE_BY_TYPE } from "@/lib/constants";
import type { BuildingType } from "@/lib/types";
import {
  calculateMaxStaff,
  calculateEffectiveBuildingWorkPerTick,
  createBuilding,
  createInitialGameLoopState,
  decreaseBuildingSize,
  getMinimumWorkersForBuildingType,
  increaseBuildingSize,
  processGameTick,
  setBuildingStaff,
} from "@/lib/services";

export function GameShellPage() {
  const [gameState, setGameState] = useState(createInitialGameLoopState);
  const [selectedBuildingType, setSelectedBuildingType] =
    useState<BuildingType>("farm");

  function handleStaffChange(buildingId: string, requestedStaff: number) {
    setGameState((previousState) =>
      setBuildingStaff(previousState, buildingId, requestedStaff),
    );
  }

  function handleRunTick() {
    setGameState((previousState) => processGameTick(previousState));
  }

  function handleCreateBuilding() {
    setGameState((previousState) =>
      createBuilding(previousState, selectedBuildingType),
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
                Build farms and mills in a small production chain.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This baseline has one resource type, one building type, one recipe,
                and one inventory where production is stored. Buildings now also
                have a size and staffing capacity.
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
                <option value="mill">Mill</option>
              </select>
              <Button size="lg" variant="outline" onClick={handleCreateBuilding}>
                Build building
              </Button>
              <Button size="lg" onClick={handleRunTick}>
                Run 1 tick
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {gameState.buildings.map((building) => {
                const maxStaff = calculateMaxStaff(building.type, building.size);
                const recipe = RECIPE_BY_TYPE[building.recipeType];
                const effectiveWorkThisTick =
                  calculateEffectiveBuildingWorkPerTick(building);

                return (
                  <Card key={building.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize">
                        {building.type} ({building.id})
                      </CardTitle>
                      <CardDescription>
                        Recipe: {recipe.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm leading-6">
                      <p>Building size: {building.size}</p>
                      <p>
                        Min workers: {getMinimumWorkersForBuildingType(building.type)}
                      </p>
                      <p>Max staff: {maxStaff}</p>
                      <p>Current staff: {building.currentStaff}</p>
                      <p>
                        Previous efficiency: {building.previousEfficiency.toFixed(3)}
                      </p>
                      <p>
                        Current efficiency: {building.currentEfficiency.toFixed(3)}
                      </p>
                      <p>Target efficiency: {building.targetEfficiency.toFixed(3)}</p>
                      <p>Work required: {recipe.workRequired}</p>
                      <p>Effective work this tick: {effectiveWorkThisTick.toFixed(3)}</p>
                      <p>
                        Current recipe work progress: {building.currentRecipeWorkProgress.toFixed(3)}
                      </p>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Simulation state</CardTitle>
              <CardDescription>Global resources and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6">
              <p>Current tick: {gameState.tick}</p>
              <p>Money: EUR {gameState.money}</p>
              <p>Buildings count: {gameState.buildings.length}</p>
              <p>Grain in inventory: {gameState.inventory.grain}</p>
              <p>Flour in inventory: {gameState.inventory.flour}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
