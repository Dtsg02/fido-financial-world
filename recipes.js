import { TYPES } from "./catalog.js?v=8218e214890d";
import { warehouseValues } from "./inventory.js?v=8218e214890d";
// Physical lot proportions: food, industrial materials, energy, compute.
export const RECIPES = {
  coffee: [0.8, 0.1, 0.1, 0],
  bakery: [0.7, 0.15, 0.15, 0],
  restaurant: [0.75, 0.1, 0.15, 0],
  farm: [0.3, 0.3, 0.4, 0],
  factory: [0, 0.7, 0.2, 0.1],
  semiconductor: [0, 0.5, 0.3, 0.2],
  datacenter: [0, 0.15, 0.5, 0.35],
  software: [0, 0.05, 0.15, 0.8],
  telecom: [0, 0.35, 0.25, 0.4],
  energy: [0, 0.7, 0.2, 0.1],
  water: [0, 0.45, 0.5, 0.05],
  recycling: [0, 0.45, 0.45, 0.1],
  construction: [0, 0.8, 0.15, 0.05],
};
export function recipeState(b) {
  return (b.recipe ??= {
    installed: false,
    enabled: false,
    remaining: 0,
    invested: 0,
    lastProduced: 0,
    lastCost: 0,
  });
}
export function recipeActive(b) {
  return !!(b.warehouse && b.recipe?.installed && b.recipe.enabled);
}
export function recipePlan(s, b) {
  const shares = RECIPES[b.type];
  if (!shares) return null;
  const base =
    (TYPES.find((t) => t.id === b.type).unit / 100) *
    0.9 *
    (1 + 0.15 * (b.quality - 1)) *
    (1 - 0.07 * s.tech.ops);
  const lots = shares.map((share) => share * base);
  let capacity = Infinity,
    bottleneck = 0;
  for (let i = 0; i < 4; i++)
    if (lots[i]) {
      const possible = Math.floor((s.empire.warehouse[i] + 1e-9) / lots[i]);
      if (possible < capacity) {
        capacity = possible;
        bottleneck = i;
      }
    }
  return {
    lots,
    capacity,
    bottleneck,
    replacementCost: lots.reduce(
      (n, q, i) => n + q * s.world.commodities[i],
      0,
    ),
  };
}
export function configureRecipe(s, b) {
  if (!Object.hasOwn(RECIPES, b.type)) return false;
  const r = recipeState(b);
  if (r.remaining) return false;
  if (r.installed) {
    r.enabled = !r.enabled;
    return true;
  }
  const cost = TYPES.find((t) => t.id === b.type).cost * 0.015;
  if (s.cash < cost) return false;
  s.cash -= cost;
  r.invested = cost;
  r.remaining = 2;
  return true;
}
export function beforeRecipeMonth(s) {
  for (const b of s.businesses) {
    const r = b.recipe;
    if (!r) continue;
    r.lastProduced = 0;
    r.lastCost = 0;
    if (r.remaining > 0 && --r.remaining === 0) {
      r.installed = true;
      r.enabled = true;
    }
  }
}
export function recipeOverhead(b) {
  return recipeActive(b) ? 75 * b.level : 0;
}
export function recipeProduction(s, b, requested) {
  if (!recipeActive(b) || !Number.isFinite(requested) || requested < 0)
    return { units: 0, cost: 0 };
  const plan = recipePlan(s, b),
    units = Math.min(Math.floor(requested), plan.capacity),
    basis = warehouseValues(s);
  let cost = 0;
  for (let i = 0; i < 4; i++) {
    const used = units * plan.lots[i];
    if (!used) continue;
    const value = s.empire.warehouse[i]
      ? basis[i] * Math.min(1, used / s.empire.warehouse[i])
      : 0;
    s.empire.warehouse[i] = Math.max(0, s.empire.warehouse[i] - used);
    basis[i] = Math.max(0, basis[i] - value);
    cost += value;
  }
  const r = recipeState(b);
  r.lastProduced += units;
  r.lastCost += cost;
  return { units, cost };
}
