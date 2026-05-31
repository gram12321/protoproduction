import { useState } from "react";
import { Button } from "@/components/ui";
import { createInitialGameLoopState, processGameTick } from "@/lib/services";

export function GameShellPage() {
  const [gameState, setGameState] = useState(createInitialGameLoopState);

  function handleRunTick() {
    setGameState((previousState) => processGameTick(previousState));
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
                One farm produces grain every tick.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This baseline has one resource type, one building type, one recipe,
                and one inventory where production is stored.
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
                <p>Building type: {gameState.buildings[0]?.type}</p>
                <p>Recipe: Produce Grain (1 tick)</p>
                <p>Grain in inventory: {gameState.inventory.grain}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
