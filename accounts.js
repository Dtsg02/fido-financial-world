import { workInProgress } from "./production.js?v=8218e214890d";
import { stockValue, warehouseValues } from "./inventory.js?v=8218e214890d";
import { tradeLiabilities, commerce, commitmentCalendar } from "./commerce.js?v=8218e214890d";
export function purchasing(b) {
  return (b.purchasing ??= { buffer: 0, reserve: 0, batch: 1 });
}
export function setPurchasing(b, buffer, reserve, batch) {
  if (
    !Number.isFinite(buffer) ||
    buffer < 0 ||
    buffer > 3 ||
    !Number.isFinite(reserve) ||
    reserve < 0 ||
    reserve > 1e12 ||
    !Number.isInteger(batch) ||
    batch < 1 ||
    batch > 10000
  )
    return false;
  b.purchasing = { buffer, reserve, batch };
  return true;
}
export function purchasePlan(s, b, target, unit, storage) {
  const p = purchasing(b);
  const desired = Math.min(storage, Math.ceil(target * (1 + p.buffer)));
  const shortage = Math.max(0, desired - b.inventory);
  const lots = Math.ceil(shortage / p.batch) * p.batch;
  return Math.max(
    0,
    Math.floor(
      Math.min(
        lots,
        Math.max(0, storage - b.inventory),
        Math.max(0, s.cash - p.reserve) / unit,
      ) / p.batch,
    ) * p.batch,
  );
}
export function workingCapital(s) {
  const invoices = s.world?.receivables || [];
  const aging = [0, 0, 0, 0];
  for (const r of invoices) {
    const age = s.month - r.due;
    aging[age <= 0 ? 0 : age === 1 ? 1 : age === 2 ? 2 : 3] += r.amount;
  }
  const stock = s.businesses.reduce((n, b) => n + stockValue(b), 0);
  const raw = s.empire ? warehouseValues(s).reduce((n, v) => n + v, 0) : 0;
  const transit =
    commerce(s).shipments.reduce((n, x) => n + x.value, 0) +
    (s.empire?.shipments || []).reduce((n, x) => n + x.cost + x.freight, 0);
  const receivables = aging.reduce((n, v) => n + v, 0),
    payables = tradeLiabilities(s);
  return {
    aging,
    stock,
    raw,
    transit,
    receivables,
    payables,
    workInProgress: workInProgress(s),
    tiedUp: stock + raw + transit + receivables - payables + workInProgress(s),
  };
}
export function closeAccounts(s, openingCash) {
  const rows = s.businesses.map((b) => ({
    ...b.lastAccounts,
    name: b.name,
    id: b.id,
  }));
  const sum = (key) => rows.reduce((n, r) => n + (r[key] || 0), 0);
  const record = {
    month: s.month,
    openingCash,
    closingCash: s.cash,
    cashChange: s.cash - openingCash,
    profit: s.profit,
    revenue: sum("revenue"),
    cogs: sum("costOfSales"),
    writeoffs: sum("writeoffs"),
    overhead: sum("overhead"),
    gross: sum("gross"),
    workingCapital: workingCapital(s).tiedUp,
  };
  s.accounts ??= { history: [] };
  s.accounts.history.push(record);
  s.accounts.history = s.accounts.history.slice(-120);
}

// A contractual liquidity drill, not a prediction of future operating cash flow.
export function liquidityDrill(s, collectionRate = 1) {
  if (
    !Number.isFinite(collectionRate) ||
    collectionRate < 0 ||
    collectionRate > 1
  )
    throw new Error("Invalid collection rate");
  let cash = s.cash,
    minimum = cash,
    firstGap = null;
  const rows = commitmentCalendar(s, 12).map((r) => {
    cash +=
      r.receivables * collectionRate -
      r.supplier -
      r.construction -
      r.debtService -
      r.tax -
      r.integration;
    minimum = Math.min(minimum, cash);
    if (cash < 0 && firstGap === null) firstGap = r.month;
    return { ...r, cash };
  });
  return { rows, minimum, firstGap, fundingGap: Math.max(0, -minimum) };
}
