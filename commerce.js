import { INTEGRATION_PLANS } from "./acquisitions.js?v=50124d33bf5b";
import { nextTaxMonth, taxLiability } from "./tax.js?v=50124d33bf5b";
import { receiveStock, consumeStock } from "./inventory.js?v=50124d33bf5b";
import { TYPES } from "./catalog.js?v=50124d33bf5b";
export const SUPPLY_HOUSES = [
  {
    id: "cooperative",
    name: "Regional cooperative",
    price: 1.02,
    reliability: 0.98,
    deposit: 0.15,
    terms: [0, 1],
    desc: "Reliable local delivery; modest discounts and short credit.",
  },
  {
    id: "global",
    name: "Global bulk exchange",
    price: 0.85,
    reliability: 0.86,
    deposit: 0.3,
    terms: [0, 1, 2],
    desc: "Cheap bulk materials; interruptions can leave production lines idle.",
  },
  {
    id: "industrial",
    name: "Industrial partners",
    price: 0.96,
    reliability: 0.94,
    deposit: 0.2,
    terms: [0, 1, 2, 3],
    desc: "Flexible trade credit with a larger interest premium.",
  },
  {
    id: "assured",
    name: "Assured supply network",
    price: 1.14,
    reliability: 0.995,
    deposit: 0.1,
    terms: [0, 1],
    desc: "Expensive continuity protection and low collateral requirements.",
  },
];
export const CHAINS = {
  farm: ["bakery", "restaurant", "coffee", "hotel"],
  recycling: ["factory", "construction", "semiconductor"],
  factory: ["shop", "construction", "energy", "water"],
  semiconductor: ["datacenter", "telecom", "software"],
  energy: ["factory", "semiconductor", "datacenter", "water"],
  datacenter: ["software", "gaming", "media"],
  logistics: ["shop", "factory", "bakery"],
};
export function commerce(s) {
  return (s.commerce ??= {
    nextId: 1,
    agreements: [],
    payables: [],
    routes: [],
    shipments: [],
    reports: [],
    expense: 0,
    badDebt: 0,
    factoring: 0,
    collections: 0,
    customerPolicy: "standard",
  });
}
const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
const type = (b) => TYPES.find((t) => t.id === b.type);
function report(s, text) {
  const c = commerce(s);
  c.reports.unshift({ month: s.month, text });
  if (text.startsWith("Unpaid supplier") || text.includes("defaulted;")) {
    s.news.unshift({
      month: s.month,
      title: "Commercial credit warning",
      text,
    });
    s.news = s.news.slice(0, 15);
  }
  c.reports = c.reports.slice(0, 60);
}
export function tradeLiabilities(s) {
  return sum(commerce(s).payables, (p) => p.amount);
}
export function commercialAssets(s) {
  const c = commerce(s);
  return (
    sum(c.agreements, (a) => a.deposit) +
    sum(c.shipments, (x) => x.value) -
    tradeLiabilities(s)
  );
}
export function creditLimit(s, b) {
  return type(b).cost * b.level * (0.25 + b.reputation / 200);
}
export function quoteSupply(s, b, supplier, units, months, terms, baseUnit) {
  const v = SUPPLY_HOUSES.find((v) => v.id === supplier);
  if (
    !v ||
    !Number.isInteger(units) ||
    units < 1 ||
    units > type(b).capacity * b.level * 10 ||
    ![6, 12, 24].includes(months) ||
    !v.terms.includes(terms) ||
    !Number.isFinite(baseUnit) ||
    baseUnit <= 0
  )
    return null;
  const price =
    baseUnit *
    v.price *
    (1 + terms * 0.025) *
    (months === 24 ? 0.93 : months === 12 ? 0.97 : 1);
  return {
    price,
    deposit: price * units * v.deposit,
    commitment: price * units,
  };
}
export function signSupply(s, b, supplier, units, months, terms, baseUnit) {
  const c = commerce(s),
    q = quoteSupply(s, b, supplier, units, months, terms, baseUnit);
  if (
    !q ||
    c.agreements.some((a) => a.businessId === b.id) ||
    s.cash < q.deposit ||
    (terms && q.commitment > creditLimit(s, b))
  )
    return false;
  s.cash -= q.deposit;
  c.agreements.push({
    id: c.nextId++,
    businessId: b.id,
    supplier,
    units,
    months,
    terms,
    price: q.price,
    deposit: q.deposit,
    start: s.month,
    remaining: months,
    status: "active",
    fallback: true,
    delivered: 0,
    missed: 0,
  });
  report(
    s,
    `${b.name} signed ${months} months of supply at a fixed unit price.`,
  );
  return true;
}
export function terminationFee(a) {
  return a.price * a.units * a.remaining * 0.08;
}
export function cancelSupply(s, id) {
  const c = commerce(s),
    a = c.agreements.find((a) => a.id === id);
  if (!a || c.payables.some((p) => p.agreementId === id)) return false;
  const fee = terminationFee(a);
  if (s.cash + a.deposit < fee) return false;
  s.cash += a.deposit - fee;
  c.agreements = c.agreements.filter((x) => x !== a);
  report(s, `Supply agreement ended. Termination cost: $${Math.round(fee)}.`);
  return true;
}
export function payInvoice(s, id) {
  const c = commerce(s),
    p = c.payables.find((p) => p.id === id);
  if (!p || s.cash < p.amount) return false;
  s.cash -= p.amount;
  c.payables = c.payables.filter((x) => x !== p);
  return true;
}
export function beginCommerceMonth(s) {
  commerce(s).expense = 0;
}
export function beforeCommerceMonth(s) {
  const c = commerce(s);
  for (const p of [...c.payables].sort((a, b) => a.due - b.due)) {
    if (p.due > s.month) continue;
    if (payInvoice(s, p.id)) continue;
    const fee = p.amount * 0.02;
    p.amount += fee;
    c.expense += fee;
    const a = c.agreements.find((a) => a.id === p.agreementId);
    if (a) a.status = "suspended";
    report(
      s,
      `Unpaid supplier invoice: $${Math.round(p.amount)}. Deliveries suspended; 2% monthly arrears fee accrued.`,
    );
  }
  for (const a of [...c.agreements]) {
    if (a.remaining <= 0 && !c.payables.some((p) => p.agreementId === a.id)) {
      s.cash += a.deposit;
      c.agreements = c.agreements.filter((x) => x !== a);
      report(s, "A completed supply agreement released its collateral.");
    } else if (
      !c.payables.some((p) => p.agreementId === a.id && p.due <= s.month)
    )
      a.status = "active";
  }
  for (const shipment of c.shipments.filter((x) => x.due <= s.month)) {
    const b = s.businesses.find((b) => b.id === shipment.to);
    if (b) {
      receiveStock(b, shipment.units, shipment.value);
      report(s, `${b.name} received ${shipment.units} internal input units.`);
    } else {
      s.cash += shipment.value * 0.8;
      c.expense += shipment.value * 0.2;
    }
  }
  c.shipments = c.shipments.filter((x) => x.due > s.month);
}
export function procureSupply(s, b, baseUnit, random) {
  const c = commerce(s),
    a = c.agreements.find((a) => a.businessId === b.id);
  if (!a || a.remaining <= 0) return { units: 0, fallback: true };
  a.remaining--;
  a.delivered = 0;
  if (a.status === "suspended") {
    a.missed++;
    return { units: 0, fallback: a.fallback };
  }
  const v = SUPPLY_HOUSES.find((v) => v.id === a.supplier),
    outage = random(s) > v.reliability;
  let units = outage ? Math.floor(a.units * (0.2 + random(s) * 0.35)) : a.units;
  if (a.terms === 0)
    units = Math.min(units, Math.max(0, Math.floor(s.cash / a.price)));
  else
    units = Math.min(
      units,
      Math.max(
        0,
        Math.floor(
          (creditLimit(s, b) -
            sum(
              c.payables.filter((p) => p.businessId === b.id),
              (p) => p.amount,
            )) /
            a.price,
        ),
      ),
    );
  const cost = units * a.price;
  if (units) {
    if (a.terms)
      c.payables.push({
        id: c.nextId++,
        agreementId: a.id,
        businessId: b.id,
        amount: cost,
        due: s.month + a.terms,
      });
    else s.cash -= cost;
    receiveStock(b, units, cost);
  }
  a.delivered = units;
  if (units < a.units) {
    a.missed++;
    report(
      s,
      `${b.name}: received ${units}/${a.units} contracted units${outage ? " after a supplier disruption" : ""}.`,
    );
  }
  return { units, fallback: a.fallback };
}
export function routeAllowed(source, target) {
  return (
    source.id !== target.id && (CHAINS[source.type] || []).includes(target.type)
  );
}
export function addRoute(s, source, target, units) {
  const c = commerce(s);
  if (
    !routeAllowed(source, target) ||
    !Number.isInteger(units) ||
    units < 1 ||
    units > type(source).capacity * source.level * 5 ||
    c.routes.some((r) => r.from === source.id) ||
    c.routes.length >= 100
  )
    return false;
  c.routes.push({
    id: c.nextId++,
    from: source.id,
    to: target.id,
    units,
    enabled: true,
    lastSent: 0,
    lastReceived: 0,
  });
  return true;
}
export function routeProduction(s, b, capacity, unitCost) {
  const c = commerce(s),
    r = c.routes.find((r) => r.from === b.id && r.enabled);
  if (!r) return 0;
  const target = s.businesses.find((b) => b.id === r.to);
  if (!target) return 0;
  const quantity = Math.min(r.units, capacity, b.inventory),
    value = quantity * unitCost,
    freight = value * 0.025;
  const converted = Math.floor((value * 0.9) / type(target).unit);
  r.lastSent = 0;
  r.lastReceived = 0;
  if (!converted || s.cash < freight) return 0;
  const actualCost = consumeStock(b, quantity);
  s.cash -= freight;
  const shipmentValue = actualCost + freight;
  c.shipments.push({
    id: c.nextId++,
    from: b.id,
    to: target.id,
    units: converted,
    value: shipmentValue,
    due: s.month + 1,
  });
  r.lastSent = quantity;
  r.lastReceived = converted;
  return quantity;
}
export function commercialBlock(s, b) {
  const c = commerce(s);
  return (
    c.agreements.some((a) => a.businessId === b.id) ||
    c.payables.some((p) => p.businessId === b.id) ||
    c.routes.some((r) => r.from === b.id || r.to === b.id) ||
    c.shipments.some((r) => r.from === b.id || r.to === b.id)
  );
}
export function factorInvoice(s, index) {
  const inv = s.world.receivables[index];
  if (!inv || inv.due <= s.month || inv.late) return false;
  const fee = Math.min(0.2, 0.025 + 0.015 * (inv.due - s.month));
  s.cash += inv.amount * (1 - fee);
  commerce(s).factoring += inv.amount * fee;
  s.world.receivables.splice(index, 1);
  report(
    s,
    `Invoice sold without recourse for $${Math.round(inv.amount * (1 - fee))}; fee $${Math.round(inv.amount * fee)}.`,
  );
  return true;
}
export function settleCustomers(s, random) {
  const c = commerce(s),
    remaining = [];
  for (const inv of s.world.receivables) {
    if (inv.due > s.month) {
      remaining.push(inv);
      continue;
    }
    // Legacy invoices keep their original guarantee; new invoices carry a disclosed risk tier.
    const risk = inv.risk ?? 0;
    if (risk && random(s) < risk * (s.economy < 0.95 ? 1.6 : 1)) {
      if ((inv.late || 0) < 2) {
        inv.late = (inv.late || 0) + 1;
        inv.due = s.month + 1;
        remaining.push(inv);
        report(
          s,
          `${inv.client} missed payment; collection attempt ${inv.late}/2.`,
        );
      } else {
        const recovery = inv.amount * 0.3;
        s.cash += recovery;
        c.badDebt += inv.amount - recovery;
        c.expense += inv.amount - recovery;
        report(
          s,
          `${inv.client} defaulted; recovered 30% and wrote off $${Math.round(inv.amount - recovery)}.`,
        );
      }
    } else {
      s.cash += inv.amount;
      c.collections += inv.amount;
      report(s, `${inv.client} paid $${Math.round(inv.amount)}.`);
    }
  }
  s.world.receivables = remaining;
}
export function invoicePolicy(s) {
  const p = commerce(s).customerPolicy;
  return p === "strict"
    ? { risk: 0.02, price: 0.97 }
    : p === "growth"
      ? { risk: 0.18, price: 1.06 }
      : { risk: 0.07, price: 1 };
}

// A commitments-only calendar: sales and operating overhead are deliberately excluded.
export function commitmentCalendar(s, months = 6) {
  const c = commerce(s);
  return Array.from({ length: months }, (_, i) => {
    const month = s.month + i + 1;
    let supplier = c.payables
        .filter((p) => (i === 0 ? p.due <= month : p.due === month))
        .reduce((n, p) => n + p.amount, 0),
      construction = 0,
      integration = 0;
    for (const b of s.businesses) {
      const x = b.integration;
      if (x?.status === "active" && i < x.remaining)
        integration += x.price * INTEGRATION_PLANS[x.plan].cost;
    }
    for (const a of c.agreements) {
      const delivery = month - a.terms;
      if (delivery > s.month && delivery <= s.month + a.remaining)
        supplier += a.price * a.units;
    }
    for (const b of s.businesses)
      for (const p of b.facility?.projects || []) {
        if (i < p.remaining) construction += (p.cost - p.funded) / p.remaining;
      }
    const receivables = s.world.receivables
      .filter((p) => (i === 0 ? p.due <= month : p.due === month))
      .reduce((n, p) => n + p.amount, 0);
    let debtService = 0;
    for (const b of s.bondMarket?.bonds || []) {
      const due = Math.max(s.month + 1, b.maturity);
      if (month <= due) debtService += (b.balance * b.coupon) / 12;
      if (month === due) debtService += b.balance;
    }
    for (const loan of s.world.bonds || []) {
      const balance = Math.max(0, loan.balance - i * loan.payment);
      debtService +=
        Math.min(balance, loan.payment) + (balance * loan.rate) / 12;
    }
    for (const note of s.deals?.notes || []) {
      const balance = Math.max(0, note.balance - i * note.payment);
      debtService +=
        Math.min(balance, note.payment) + (balance * note.rate) / 12;
    }
    const termDebt = (s.world.bonds || []).reduce((n, b) => n + b.balance, 0);
    debtService += (Math.max(0, s.debt - termDebt) * s.rate) / 12;
    const tax = month === nextTaxMonth(s) ? taxLiability(s) : 0;
    return {
      month,
      tax,
      debtService,
      supplier,
      construction,
      integration,
      receivables,
      net:
        receivables - supplier - construction - debtService - tax - integration,
    };
  });
}
