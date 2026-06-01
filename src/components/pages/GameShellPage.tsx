import { useState } from "react";
import { Button } from "@/components/ui";
import { RECIPE_BY_TYPE } from "@/lib/constants";
import {
  calculateMaxStaff,
  calculateEffectiveBuildingWorkPerTick,
  createInitialGameLoopState,
  decreaseBuildingSize,
  getMinimumWorkersForBuildingType,
  increaseBuildingSize,
  processGameTick,
  setBuildingStaff,
} from "@/lib/services";

export function GameShellPage() {
  const [gameState, setGameState] = useState(createInitialGameLoopState);
  const primaryBuilding = gameState.buildings[0];
  const primaryRecipe = primaryBuilding
    ? RECIPE_BY_TYPE[primaryBuilding.recipeType]
    : undefined;
  const primaryWorkPerTick = primaryBuilding
    ? calculateEffectiveBuildingWorkPerTick(primaryBuilding)
    : 0;

  function handleStaffChange(buildingId: string, requestedStaff: number) {
    setGameState((previousState) =>
      setBuildingStaff(previousState, buildingId, requestedStaff),
    );
  }

  function handleRunTick() {
    setGameState((previousState) => processGameTick(previousState));
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
                One farm converts work into grain output.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This baseline has one resource type, one building type, one recipe,
                and one inventory where production is stored. Buildings now also
                have a size and staffing capacity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleRunTick}>
                Run 1 tick
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Simulation state
                </p>
                <p className="mt-1 text-2xl font-semibold">Single-loop baseline</p>
              </div>

              <div className="space-y-3 text-sm leading-6">
                <p>Current tick: {gameState.tick}</p>
                <p>Money: EUR {gameState.money}</p>
                <p>Building type: {primaryBuilding?.type}</p>
                <p>Building size: {primaryBuilding?.size}</p>
                <p>
                  Min workers:{" "}
                  {primaryBuilding
                    ? getMinimumWorkersForBuildingType(primaryBuilding.type)
                    : 0}
                </p>
                <p>
                  Max staff: {" "}
                  {primaryBuilding
                    ? calculateMaxStaff(primaryBuilding.type, primaryBuilding.size)
                    : 0}
                </p>
                <p>Current staff: {primaryBuilding?.currentStaff ?? 0}</p>
                <p>
                  Previous efficiency:{" "}
                  {(primaryBuilding?.previousEfficiency ?? 0).toFixed(3)}
                </p>
                <p>
                  Current efficiency:{" "}
                  {(primaryBuilding?.currentEfficiency ?? 0).toFixed(3)}
                </p>
                <p>
                  Target efficiency:{" "}
                  {(primaryBuilding?.targetEfficiency ?? 0).toFixed(3)}
                </p>
                <p>Recipe: {primaryRecipe?.name}</p>
                <p>
                  Work required: {primaryRecipe?.workRequired ?? 0}
                </p>
                <p>
                  Effective work this tick: {primaryWorkPerTick.toFixed(3)}
                </p>
                <p>
                  Current recipe work progress:{" "}
                  {(primaryBuilding?.currentRecipeWorkProgress ?? 0).toFixed(3)}
                </p>
                <p>Grain in inventory: {gameState.inventory.grain}</p>
              </div>

              <div className="space-y-3 rounded-md border p-4">
                <p className="text-sm font-medium">Hire staff</p>
                {gameState.buildings.map((building) => {
                  const maxStaff = calculateMaxStaff(building.type, building.size);

                  return (
                    <div key={building.id} className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {building.type} ({building.size})
                      </p>
                      <label
                        htmlFor={`staff-slider-${building.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Staff: {building.currentStaff} / {maxStaff}
                      </label>
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
