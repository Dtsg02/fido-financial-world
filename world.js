import { TYPES, INDUSTRY } from "./catalog.js?v=20261026-industry";
// Interconnected strategy systems. All randomness uses the save's seeded generator.
export const CITIES = [
  {
    id: "brookhaven",
    name: "Brookhaven",
    region: "Home market",
    demand: 1,
    wages: 1,
    rent: 1,
    setup: 0,
    desc: "A balanced local economy. Low barriers, familiar customers.",
  },
  {
    id: "newford",
    name: "Newford",
    region: "Financial capital",
    demand: 1.7,
    wages: 1.4,
    rent: 1.8,
    setup: 18000,
    desc: "Affluent customers and intense competition. Premium services thrive.",
  },
  {
    id: "portazure",
    name: "Port Azure",
    region: "Trade gateway",
    demand: 1.25,
    wages: 1.05,
    rent: 1.15,
    setup: 12000,
    desc: "Reliable logistics and cheaper imports. Retail and manufacturing flourish.",
  },
  {
    id: "siliconbay",
    name: "Silicon Bay",
    region: "Innovation district",
    demand: 1.45,
    wages: 1.6,
    rent: 1.5,
    setup: 24000,
    desc: "Demand for technology, a deep talent pool, and expensive engineers.",
  },
  {
    id: "sunvale",
    name: "Sunvale",
    region: "Emerging market",
    demand: 1.1,
    wages: 0.75,
    rent: 0.7,
    setup: 9000,
    desc: "Affordable production and growing energy demand. Price-sensitive customers.",
  },
];
export const SUPPLIERS = [
  {
    id: "spot",
    name: "Spot market",
    cost: 0.87,
    reliability: 0.8,
    carbon: 1.3,
    desc: "Low prices, unpredictable deliveries. Exposed to commodity shocks.",
  },
  {
    id: "standard",
    name: "Regional partner",
    cost: 1,
    reliability: 0.96,
    carbon: 1,
    desc: "Balanced cost and reliability.",
  },
  {
    id: "premium",
    name: "Guaranteed supply",
    cost: 1.18,
    reliability: 1,
    carbon: 0.85,
    desc: "Full deliveries even during supply shocks. Higher material costs.",
  },
  {
    id: "green",
    name: "Circular sourcing",
    cost: 1.12,
    reliability: 0.94,
    carbon: 0.4,
    desc: "Low emissions and a reputation benefit with sustainability-focused customers.",
  },
];
export const COMMODITIES = [
  { id: "food", name: "Food & agriculture", base: 100, vol: 0.14 },
  { id: "materials", name: "Industrial materials", base: 100, vol: 0.12 },
  { id: "power", name: "Energy", base: 100, vol: 0.2 },
  { id: "compute", name: "Cloud & compute", base: 100, vol: 0.1 },
];
export const SECTOR_COMMODITY = Object.fromEntries(
  Object.entries(INDUSTRY).map(([k, v]) => [k, v.commodity]),
);
export const PROJECTS = [
  {
    id: "product",
    name: "New product line",
    cost: 12000,
    months: 3,
    desc: "Add 18% demand and 5% pricing power per completed product. Max 4 per business.",
  },
  {
    id: "efficiency",
    name: "Process redesign",
    cost: 9000,
    months: 2,
    desc: "Cut material consumption by 8% per completion. Max 4 per business.",
  },
  {
    id: "resilience",
    name: "Business continuity",
    cost: 7500,
    months: 2,
    desc: "Permanently halve operational incident probability. One per business.",
  },
];
export function rng(s) {
  s.seed = (s.seed * 16807) % 2147483647;
  return (s.seed - 1) / 2147483646;
}
export function city(b) {
  return CITIES.find((c) => c.id === b.city) || CITIES[0];
}
export function supplier(b) {
  return SUPPLIERS.find((p) => p.id === b.supplier) || SUPPLIERS[1];
}
export function initBusiness(b) {
  let defaults = {
    city: "brookhaven",
    supplier: "standard",
    morale: 75,
    skill: 1,
    salary: 1,
    training: 0,
    maintenance: 200,
    insured: false,
    products: 0,
    efficiency: 0,
    resilient: false,
    project: null,
    arrears: 0,
    contractSold: 0,
    lastIncident: "None",
    lastSupply: 100,
  };
  for (let [k, v] of Object.entries(defaults)) if (b[k] === undefined) b[k] = v;
  return b;
}
export function ensureWorld(s) {
  if (!s.world) {
    s.world = {
      commodities: [100, 100, 100, 100],
      commodityHistory: [[100], [100], [100], [100]],
      rivals: [
        {
          id: "r1",
          name: "Copper Cup Co.",
          type: "coffee",
          city: "brookhaven",
          power: 1.1,
          price: 7.8,
          reputation: 72,
          value: 34000,
        },
        {
          id: "r2",
          name: "Studio Meridian",
          type: "studio",
          city: "newford",
          power: 1.2,
          price: 950,
          reputation: 80,
          value: 76000,
        },
        {
          id: "r3",
          name: "Parcel & Pine",
          type: "shop",
          city: "portazure",
          power: 1,
          price: 62,
          reputation: 68,
          value: 54000,
        },
        {
          id: "r4",
          name: "Nimbus Systems",
          type: "software",
          city: "siliconbay",
          power: 1.4,
          price: 52,
          reputation: 82,
          value: 185000,
        },
        {
          id: "r5",
          name: "Ironwood Works",
          type: "factory",
          city: "sunvale",
          power: 1,
          price: 175,
          reputation: 65,
          value: 270000,
        },
        {
          id: "r6",
          name: "Helio Grid",
          type: "energy",
          city: "sunvale",
          power: 1.2,
          price: 118,
          reputation: 75,
          value: 540000,
        },
      ],
      offers: [],
      contracts: [],
      receivables: [],
      bonds: [],
      reports: [],
      policy: { tax: 0.2, carbon: 0, subsidy: 0 },
      sentiment: 60,
      unemployment: 5,
      creditScore: 700,
      monthCosts: 0,
      monthRevenue: 0,
      delivered: 0,
      failed: 0,
      scenario: "balanced",
    };
  }
  s.businesses.forEach(initBusiness);
  if (!s.world.offers.length && !s.world.contracts.length)
    s.world.offers = makeOffers(s);
  return s.world;
}
export function makeOffers(s) {
  return Array.from({ length: 8 }, (_, i) => {
    let t =
      i < s.businesses.length
        ? TYPES.find((t) => t.id === s.businesses[i].type)
        : TYPES[Math.floor(rng(s) * TYPES.length)];
    let units = Math.max(1, Math.round(t.capacity * (0.8 + rng(s) * 1.8)));
    let price = Math.round(t.price * (1.08 + rng(s) * 0.2) * 100) / 100;
    return {
      id: `bid-${s.month}-${i}`,
      client: [
        "City Council",
        "Atlas Hospitality",
        "Greenline Group",
        "University District",
        "Northstar Retail",
        "Meridian Holdings",
        "Public Infrastructure Office",
        "Horizon Industries",
      ][i],
      type: t.id,
      units,
      price,
      deadline: s.month + 3 + Math.floor(rng(s) * 4),
      terms: 1 + Math.floor(rng(s) * 3),
      minRep: 50 + Math.floor(rng(s) * 30),
      deposit: Math.round(units * price * 0.1),
      penalty: Math.round(units * price * 0.15),
    };
  });
}
export function demandFactor(s, b) {
  ensureWorld(s);
  let c = city(b);
  let rivals = s.world.rivals.filter(
    (r) => r.type === b.type && r.city === b.city,
  );
  let competition = 1 / (1 + rivals.reduce((n, r) => n + r.power * 0.12, 0));
  let own = s.businesses.filter(
    (x) => x.type === b.type && x.city === b.city,
  ).length;
  let specialization =
    b.city === "siliconbay" && b.type === "software"
      ? 1.3
      : b.city === "newford" && b.type === "studio"
        ? 1.25
        : b.city === "sunvale" && b.type === "energy"
          ? 1.3
          : 1;
  return (
    ((c.demand * competition) / (1 + Math.max(0, own - 1) * 0.15)) *
    (1 + b.products * 0.18) *
    specialization *
    (b.supplier === "green" ? 1.05 : 1)
  );
}
export function productivity(b) {
  initBusiness(b);
  return Math.max(
    0.55,
    Math.min(1.5, 0.7 + b.morale / 250 + (b.skill - 1) * 0.1),
  );
}
export function materialFactor(s, b) {
  let index = SECTOR_COMMODITY[b.type];
  let integrated =
    s.businesses.some((x) => x.type === "factory" && b.type === "shop") ||
    s.businesses.some((x) => x.type === "energy" && b.type !== "energy");
  return (
    (s.world.commodities[index] / 100) *
    supplier(b).cost *
    (1 - b.efficiency * 0.08) *
    (integrated ? 0.92 : 1) *
    (b.city === "portazure" ? 0.92 : 1)
  );
}
export function companyOverhead(s, b) {
  return (
    b.training +
    b.maintenance +
    (b.insured ? 250 * b.level : 0) +
    s.world.policy.carbon * supplier(b).carbon * b.level
  );
}
export function beforeMonth(s) {
  ensureWorld(s);
  let w = s.world;
  w.monthCosts = 0;
  w.monthRevenue = 0;
  for (let i = 0; i < 4; i++) {
    w.commodities[i] = Math.max(
      45,
      Math.min(
        240,
        w.commodities[i] *
          (1 + (rng(s) - 0.5) * COMMODITIES[i].vol + (s.economy - 1) * 0.025),
      ),
    );
    w.commodityHistory[i].push(w.commodities[i]);
    w.commodityHistory[i] = w.commodityHistory[i].slice(-24);
  }
  for (let r of w.rivals) {
    r.power = Math.max(0.5, Math.min(2.5, r.power + (rng(s) - 0.45) * 0.12));
    r.price = Math.max(1, r.price * (1 + (rng(s) - 0.5) * 0.08));
    r.reputation = Math.max(
      40,
      Math.min(95, r.reputation + (rng(s) - 0.5) * 5),
    );
    r.value *= 1 + (rng(s) - 0.4) * 0.05;
  }
  for (let inv of w.receivables.filter((x) => x.due <= s.month)) {
    s.cash += inv.amount;
    w.reports.unshift({
      month: s.month,
      text: `${inv.client} paid an invoice of $${Math.round(inv.amount).toLocaleString()}.`,
    });
  }
  w.receivables = w.receivables.filter((x) => x.due > s.month);
  for (let bond of w.bonds) {
    let interest = (bond.balance * bond.rate) / 12;
    let principal = Math.min(bond.balance, bond.payment);
    s.cash -= interest + principal;
    s.debt -= principal;
    bond.balance -= principal;
    w.monthCosts += interest;
  }
  w.bonds = w.bonds.filter((x) => x.balance > 0.01);
  s.debt = Math.max(0, s.debt);
  for (let b of s.businesses) {
    initBusiness(b);
    b.contractSold = 0;
    b.lastIncident = "None";
    let growth =
      (b.salary - 1) * 14 +
      (b.training > 0 ? 1.5 : 0) -
      1 -
      (b.staff > b.level * 4 ? 2 : 0);
    b.morale = Math.max(20, Math.min(100, b.morale + growth));
    b.skill = Math.min(3, b.skill + b.training / Math.max(1, b.staff) / 12000);
    if (b.morale < 35 && b.staff > 1 && rng(s) < 0.3) {
      b.staff--;
      b.lastIncident = "An employee resigned";
      report(s, `${b.name}: an employee resigned after prolonged low morale.`);
    }
    if (b.project) {
      b.project.remaining--;
      if (b.project.remaining <= 0) {
        if (b.project.kind === "product") b.products++;
        if (b.project.kind === "efficiency") b.efficiency++;
        if (b.project.kind === "resilience") b.resilient = true;
        report(
          s,
          `${b.name} completed ${PROJECTS.find((p) => p.id === b.project.kind).name}.`,
        );
        b.project = null;
      }
    }
    let chance =
      Math.max(0.015, 0.11 - b.maintenance / 10000) * (b.resilient ? 0.5 : 1);
    b.incidentFactor = 1;
    if (rng(s) < chance) {
      let loss = Math.round((1000 + b.level * 1500) * (b.insured ? 0.15 : 1));
      s.cash -= loss;
      w.monthCosts += loss;
      b.incidentFactor = 0.65;
      b.lastIncident = b.insured
        ? "Insured breakdown · 15% deductible"
        : "Equipment breakdown";
      report(
        s,
        `${b.name}: equipment failure reduced capacity 35% and cost $${loss.toLocaleString()}${b.insured ? " after insurance" : ""}.`,
      );
    }
    let p = supplier(b);
    b.supplyFactor = rng(s) <= p.reliability ? 1 : 0.45 + rng(s) * 0.3;
    b.lastSupply = Math.round(b.supplyFactor * 100);
    if (b.supplyFactor < 1)
      report(
        s,
        `${b.name}: supplier delivered only ${b.lastSupply}% of requested materials.`,
      );
  }
  if (s.month % 6 === 0) {
    let policy = Math.floor(rng(s) * 3);
    if (policy === 0) {
      w.policy.tax = 0.18 + rng(s) * 0.07;
      report(
        s,
        `Tax policy changed: ${(w.policy.tax * 100).toFixed(1)}% on positive taxable income.`,
      );
    } else if (policy === 1) {
      w.policy.carbon = Math.round(rng(s) * 140);
      report(
        s,
        `A carbon levy of $${w.policy.carbon} per location level now applies, adjusted for supplier emissions.`,
      );
    } else {
      w.policy.subsidy = Math.round(100 + rng(s) * 350);
      report(
        s,
        `Clean-energy operators now receive $${w.policy.subsidy} per business level each month.`,
      );
    }
  }
  w.sentiment = Math.round(
    Math.max(20, Math.min(90, 60 + (s.economy - 1) * 100)),
  );
  w.unemployment = Math.max(2, Math.min(12, 5 - (s.economy - 1) * 10));
}
export function fulfill(s, b, capacity) {
  let revenue = 0,
    units = 0;
  for (let c of s.world.contracts.filter(
    (x) => x.businessId === b.id && x.status === "active",
  )) {
    let n = Math.min(
      c.units - c.delivered,
      b.inventory,
      Math.max(0, capacity - units),
    );
    if (n <= 0) continue;
    b.inventory -= n;
    c.delivered += n;
    units += n;
    let amount = n * c.price;
    revenue += amount;
    s.world.receivables.push({
      client: c.client,
      amount,
      due: s.month + c.terms,
    });
    if (c.delivered >= c.units) {
      c.status = "completed";
      s.world.delivered++;
      b.reputation = Math.min(100, b.reputation + 6);
      s.cash += c.deposit;
      report(
        s,
        `${b.name} completed the ${c.client} contract. Deposit returned; invoices are due in ${c.terms} months.`,
      );
    }
  }
  b.contractSold = units;
  return { revenue, units };
}
export function afterMonth(s) {
  let w = s.world;
  for (let c of w.contracts.filter(
    (x) => x.status === "active" && x.deadline <= s.month,
  )) {
    c.status = "failed";
    w.failed++;
    s.cash -= c.penalty;
    w.monthCosts += c.penalty;
    let b = s.businesses.find((x) => x.id === c.businessId);
    if (b) b.reputation = Math.max(20, b.reputation - 15);
    report(
      s,
      `${c.client} contract missed its deadline. Deposit forfeited and $${c.penalty.toLocaleString()} penalty charged.`,
    );
  }
  if (s.month % 2 === 0) w.offers = makeOffers(s);
  w.creditScore = Math.round(
    Math.max(
      300,
      Math.min(
        850,
        700 +
          w.delivered * 8 -
          w.failed * 25 -
          (s.debt > Math.max(s.cash * 4, 50000) ? 80 : 0) +
          (s.profit > 0 ? 30 : 0),
      ),
    ),
  );
  w.reports = w.reports.slice(0, 50);
  w.contracts = w.contracts.filter(
    (c) => c.status === "active" || c.deadline > s.month - 12,
  );
}
export function report(s, text) {
  s.world.reports.unshift({ month: s.month, text });
}
export function acceptContract(s, offerId, businessId) {
  ensureWorld(s);
  let c = s.world.offers.find((x) => x.id === offerId),
    b = s.businesses.find((x) => x.id === businessId);
  if (
    !c ||
    !b ||
    b.type !== c.type ||
    b.reputation < c.minRep ||
    s.cash < c.deposit ||
    s.world.contracts.filter(
      (x) => x.businessId === b.id && x.status === "active",
    ).length >= 2
  )
    return false;
  s.cash -= c.deposit;
  s.world.contracts.push({ ...c, businessId, status: "active", delivered: 0 });
  s.world.offers = s.world.offers.filter((x) => x !== c);
  return true;
}
export function launchProject(s, b, id) {
  let p = PROJECTS.find((x) => x.id === id);
  if (
    !p ||
    b.project ||
    s.cash < p.cost ||
    (id === "product" && b.products >= 4) ||
    (id === "efficiency" && b.efficiency >= 4) ||
    (id === "resilience" && b.resilient)
  )
    return false;
  s.cash -= p.cost;
  b.project = { kind: id, remaining: p.months };
  return true;
}
export function canSell(s, b) {
  return !s.world.contracts.some(
    (c) => c.businessId === b.id && c.status === "active",
  );
}
export function financeLoan(s, amount, term) {
  ensureWorld(s);
  if (
    !Number.isFinite(amount) ||
    amount < 1000 ||
    amount > Math.max(25000, s.cash * 0.7) - s.debt ||
    ![12, 24, 36].includes(term)
  )
    return false;
  let rate = s.rate + (700 - s.world.creditScore) / 10000 + 0.01;
  rate = Math.max(0.04, rate);
  s.world.bonds.push({ balance: amount, payment: amount / term, rate, term });
  s.cash += amount;
  s.debt += amount;
  return true;
}
