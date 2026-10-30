export const INTEGRATION_PLANS = {
  preserve: {
    name: "Preserve the team",
    months: 6,
    cost: 0.002,
    capacity: 0.92,
    demand: 0.97,
    finalCapacity: 1,
    finalDemand: 1,
    overhead: 1,
    desc: "Keep the operating model. Six months of transition, modest disruption, no permanent efficiency bonus.",
  },
  consolidate: {
    name: "Consolidate operations",
    months: 9,
    cost: 0.006,
    capacity: 0.8,
    demand: 0.9,
    finalCapacity: 1.08,
    finalDemand: 1,
    overhead: 0.92,
    desc: "Nine months of systems and process work. Afterwards: +8% workforce capacity and −8% operating overhead.",
  },
  transform: {
    name: "Rebuild the platform",
    months: 12,
    cost: 0.012,
    capacity: 0.65,
    demand: 0.85,
    finalCapacity: 1.18,
    finalDemand: 1.12,
    overhead: 0.94,
    desc: "Twelve months of heavy disruption and investment. Afterwards: +18% workforce capacity, +12% demand and −6% overhead.",
  },
};
export function deals(s) {
  return (s.deals ??= { nextId: 1, notes: [], interest: 0 });
}
export function sellerDebt(s) {
  return (s.deals?.notes || []).reduce((n, x) => n + x.balance, 0);
}
export function acquisitionQuote(r, plan, financing) {
  const p = INTEGRATION_PLANS[plan];
  if (
    !r ||
    !Number.isFinite(r.value) ||
    r.value <= 0 ||
    !Object.hasOwn(INTEGRATION_PLANS, plan) ||
    !["cash", "seller"].includes(financing)
  )
    return null;
  const note = financing === "seller" ? r.value * 0.4 : 0;
  return {
    price: r.value,
    upfront: r.value - note,
    note,
    payment: note / 12,
    rate: 0.1,
    integrationMonthly: r.value * p.cost,
    integrationTotal: r.value * p.cost * p.months,
    months: p.months,
  };
}
export function recordAcquisition(s, b, price, plan, financing) {
  const q = acquisitionQuote({ value: price }, plan, financing);
  if (!q || b.integration) return false;
  b.integration = {
    plan,
    price,
    remaining: q.months,
    funded: 0,
    status: "active",
    stalled: 0,
    monthCost: 0,
  };
  b.morale = Math.max(
    20,
    b.morale - (plan === "transform" ? 12 : plan === "consolidate" ? 6 : 2),
  );
  if (q.note)
    deals(s).notes.push({
      id: deals(s).nextId++,
      businessId: b.id,
      balance: q.note,
      payment: q.payment,
      rate: q.rate,
    });
  return true;
}
export function integrationEffects(b) {
  const x = b.integration;
  if (!x || x.status === "abandoned")
    return { capacity: 1, demand: 1, overhead: 1 };
  const p = INTEGRATION_PLANS[x.plan];
  return x.status === "complete"
    ? { capacity: p.finalCapacity, demand: p.finalDemand, overhead: p.overhead }
    : { capacity: p.capacity, demand: p.demand, overhead: 1 };
}
export function beforeAcquisitionMonth(s) {
  const d = deals(s);
  d.interest = 0;
  for (const n of d.notes) {
    const interest = (n.balance * n.rate) / 12,
      principal = Math.min(n.balance, n.payment);
    s.cash -= interest + principal;
    n.balance = Math.max(0, n.balance - principal);
    d.interest += interest;
  }
  d.notes = d.notes.filter((n) => n.balance > 1e-7);
  for (const b of s.businesses) {
    const x = b.integration;
    if (!x) continue;
    x.monthCost = 0;
    if (x.status === "complete" || x.status === "abandoned") continue;
    const cost = x.price * INTEGRATION_PLANS[x.plan].cost;
    if (x.status === "paused" || s.cash < cost) {
      x.stalled++;
      b.morale = Math.max(20, b.morale - 2);
      continue;
    }
    s.cash -= cost;
    x.monthCost = cost;
    x.funded += cost;
    x.remaining--;
    if (x.remaining <= 0) {
      x.status = "complete";
      b.morale = Math.min(100, b.morale + 10);
      b.reputation = Math.min(100, b.reputation + 3);
      s.news.unshift({
        month: s.month,
        title: "Acquisition integrated",
        text: b.name + " completed its integration plan.",
      });
      s.news = s.news.slice(0, 15);
    }
  }
}
export function settleSellerNote(s, id) {
  const d = deals(s),
    n = d.notes.find((n) => n.id === id);
  if (!n || s.cash < n.balance) return false;
  s.cash -= n.balance;
  d.notes = d.notes.filter((x) => x !== n);
  return true;
}
export function integrationBlock(s, b) {
  return !!(
    (b.integration && ["active", "paused"].includes(b.integration.status)) ||
    (s.deals?.notes || []).some((n) => n.businessId === b.id)
  );
}

export function integrationBudget(b) {
  const x = b.integration;
  return x?.status === "active" ? x.price * INTEGRATION_PLANS[x.plan].cost : 0;
}
