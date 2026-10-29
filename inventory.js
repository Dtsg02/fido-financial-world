import { TYPES } from "./catalog.js?v=50124d33bf5b";
// Legacy saves have quantities only; their one-time opening basis uses catalog cost.
export function stockValue(b) {
  if (b.inventoryCost === undefined)
    b.inventoryCost = b.inventory * TYPES.find((t) => t.id === b.type).unit;
  return b.inventoryCost;
}
export function receiveStock(b, quantity, cost) {
  if (
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    !Number.isFinite(cost) ||
    cost < 0
  )
    throw new Error("Invalid stock receipt");
  const previous = stockValue(b);
  b.inventory += quantity;
  b.inventoryCost = previous + cost;
}
export function consumeStock(b, quantity) {
  if (
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    quantity > b.inventory + 1e-8
  )
    throw new Error("Invalid stock consumption");
  const value = stockValue(b),
    cost = b.inventory ? value * Math.min(1, quantity / b.inventory) : 0;
  b.inventory = Math.max(0, b.inventory - quantity);
  b.inventoryCost = b.inventory > 1e-8 ? Math.max(0, value - cost) : 0;
  return cost;
}
export function warehouseValues(s) {
  const e = s.empire;
  if (!e.warehouseCost)
    e.warehouseCost = e.warehouse.map((q, i) => q * s.world.commodities[i]);
  return e.warehouseCost;
}
