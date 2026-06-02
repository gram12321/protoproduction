import type { Building, Inventory, ProductionRecipe } from "@/lib/types";

export function canStartRecipeFromInventory(
  building: Building,
  recipe: ProductionRecipe,
  inventory: Inventory,
): boolean {
  if (!recipe.input?.length) {
    return true;
  }

  if (building.currentRecipeWorkProgress > 0) {
    return true;
  }

  return recipe.input.every(
    (requiredInput) =>
      inventory[requiredInput.resource] >= requiredInput.amount,
  );
}

export function formatRecipeInputRequirements(recipe: ProductionRecipe): string {
  if (!recipe.input?.length) {
    return "";
  }

  return recipe.input
    .map(
      (requiredInput) =>
        `${requiredInput.amount} ${requiredInput.resource}`,
    )
    .join(", ");
}
