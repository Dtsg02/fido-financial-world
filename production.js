import { facilityLimits } from "./facilities.js?v=8218e214890d";
import { recipePlan } from "./recipes.js?v=8218e214890d";
import { warehouseValues, receiveStock } from "./inventory.js?v=8218e214890d";
export const BATCH_METHODS = {
  standard: {
    name: "Standard batch",
    months: 2,
    materials: 0.75,
    conversion: 0.08,
    yield: 0.98,
  },
  lean: {
    name: "Lean batch",
    months: 3,
    materials: 0.65,
    conversion: 0.04,
    yield: 0.96,
  },
};
export function production(b) {
  return (b.production ??= {
    nextId: 1,
    allocation: 0.5,
    jobs: [],
    lastWork: 0,
    lastCompleted: 0,
  });
}
export function workInProgress(s) {
  return s.businesses.reduce(
    (n, b) => n + (b.production?.jobs || []).reduce((v, j) => v + j.cost, 0),
    0,
  );
}
export function quoteBatch(s, b, units, method) {
  if (
    !Object.hasOwn(BATCH_METHODS, method) ||
    !Number.isInteger(units) ||
    units < 2 ||
    units > 1000000 ||
    !b.recipe?.installed
  )
    return null;
  const p = recipePlan(s, b),
    m = BATCH_METHODS[method];
  if (!p) return null;
  const lots = p.lots.map((q) => q * m.materials * units),
    conversion = p.replacementCost * m.materials * units * m.conversion;
  return {
    units,
    output: Math.floor(units * m.yield),
    storage: facilityLimits(b, 0).storage,
    lots,
    conversion,
    months: m.months,
    method,
    available: lots.every((q, i) => q <= s.empire.warehouse[i] + 1e-8),
    due: s.month + m.months,
  };
}
export function orderBatch(s, b, units, method) {
  const q = quoteBatch(s, b, units, method),
    p = production(b);
  if (
    !q ||
    !q.available ||
    q.output < 1 ||
    p.jobs.length >= 5 ||
    s.cash < q.conversion
  )
    return false;
  const basis = warehouseValues(s);
  let cost = q.conversion;
  for (let i = 0; i < 4; i++) {
    const value = s.empire.warehouse[i]
      ? basis[i] * Math.min(1, q.lots[i] / s.empire.warehouse[i])
      : 0;
    basis[i] = Math.max(0, basis[i] - value);
    s.empire.warehouse[i] = Math.max(0, s.empire.warehouse[i] - q.lots[i]);
    cost += value;
  }
  s.cash -= q.conversion;
  p.jobs.push({
    id: p.nextId++,
    method,
    units,
    output: q.output,
    cost,
    remainingWork: units,
    due: q.due,
    created: s.month,
    expedited: false,
  });
  return true;
}
export function processBatches(s, b, capacity) {
  const p = production(b);
  p.lastWork = 0;
  p.lastCompleted = 0;
  let budget = Math.max(0, Math.floor(capacity * p.allocation));
  for (const job of p.jobs) {
    if (job.created >= s.month) continue;
    const work = Math.min(job.remainingWork, budget);
    job.remainingWork -= work;
    budget -= work;
    p.lastWork += work;
    if (job.remainingWork === 0 && job.due <= s.month) {
      receiveStock(b, job.output, job.cost);
      p.lastCompleted += job.output;
    }
  }
  p.jobs = p.jobs.filter(
    (j) => j.remainingWork > 0 || j.due > s.month || j.created >= s.month,
  );
  return p.lastWork;
}
export function setProductionAllocation(b, allocation) {
  if (![0, 0.25, 0.5, 0.75, 1].includes(allocation)) return false;
  production(b).allocation = allocation;
  return true;
}
export function cancelBatch(s, b, id) {
  const p = production(b),
    j = p.jobs.find((j) => j.id === id);
  if (!j) return false;
  s.cash += j.cost * 0.5;
  p.jobs = p.jobs.filter((x) => x !== j);
  return true;
}
export function expediteBatch(s, b, id) {
  const j = production(b).jobs.find((j) => j.id === id);
  if (!j || j.expedited || j.due <= s.month + 1 || s.cash < j.cost * 0.1)
    return false;
  const fee = j.cost * 0.1;
  s.cash -= fee;
  j.cost += fee;
  j.due--;
  j.expedited = true;
  return true;
}
