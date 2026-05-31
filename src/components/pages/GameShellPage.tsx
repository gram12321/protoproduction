import { Boxes, FlaskConical, Hammer } from "lucide-react";
import { Button } from "@/components/ui";

const bootstrapTracks = [
  {
    title: "Core app shell",
    detail: "React 19 + Vite + TypeScript are wired and ready for feature work.",
    icon: Boxes,
  },
  {
    title: "UI foundation",
    detail: "Tailwind and the first ShadCN component are installed with repo aliases.",
    icon: Hammer,
  },
  {
    title: "Testing baseline",
    detail: "Vitest and Testing Library are configured for the service and UI layers.",
    icon: FlaskConical,
  },
] as const;

export function GameShellPage() {
  return (
    <main className="min-h-screen bg-muted/40">
      <div className="container py-16">
        <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
                Repo bootstrap
              </p>
              <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
                Proto Production is ready for the first gameplay systems.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                This starter shell keeps project logic free to land under services,
                database code isolated for later Supabase work, and the UI stack
                aligned with the repo conventions from day one.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg">Start building systems</Button>
              <Button variant="outline" size="lg">
                Review bootstrap structure
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Installed stack
                </p>
                <p className="mt-1 text-2xl font-semibold">Frontend baseline</p>
              </div>

              <div className="space-y-4">
                {bootstrapTracks.map(({ title, detail, icon: Icon }) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
