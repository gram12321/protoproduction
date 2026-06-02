export interface WorkerRuntime {
  id: string;
  baseWorkPerTick: number;
  workModifier: number;
}