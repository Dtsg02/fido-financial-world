import { recipeActive, recipeProduction } from "./recipes.js?v=6e353cd01f78";
import { commerce } from "./commerce.js?v=6e353cd01f78";
import { warehouseValues } from "./inventory.js?v=6e353cd01f78";
import { TYPES, INDUSTRY } from "./catalog.js?v=6e353cd01f78";
import { rng, ensureWorld, city, supplier, report } from "./world.js?v=6e353cd01f78";
export const ROLES = [
  {
    id: "coo",
    name: "Chief operating officer",
    effect: "Up to 12% more production capacity.",
    salary: 3200,
  },
  {
    id: "cmo",
    name: "Chief marketing officer",
    effect: "Up to 18% more customer demand.",
    salary: 3000,
  },
  {
    id: "cto",
    name: "Chief technology officer",
    effect: "Up to 15% lower material use and faster projects.",
    salary: 4200,
  },
  {
    id: "cfo",
    name: "Chief financial officer",
    effect: "Up to 20% lower revolving interest expense.",
    salary: 3800,
  },
  {
    id: "people",
    name: "People director",
    effect: "Up to 2 points of employee morale each month.",
    salary: 2600,
  },
  {
    id: "risk",
    name: "Risk director",
    effect: "Up to 60% lower regulatory fine probability.",
    salary: 2900,
  },
];
export const FX = [
  { id: "EUR", name: "Eurozone credit", base: 1.08, vol: 0.04 },
  { id: "GBP", name: "Sterling credit", base: 1.26, vol: 0.05 },
  { id: "JPY", name: "Yen credit", base: 0.0067, vol: 0.06 },
  { id: "EMC", name: "Emerging-market credit", base: 0.42, vol: 0.11 },
];
export const RESEARCH = [
  {
    id: "analytics",
    name: "Customer intelligence",
    cost: 18000,
    months: 3,
    requires: null,
    desc: "+8% demand. Unlocks behavioral segmentation.",
  },
  {
    id: "crm",
    name: "Relationship platform",
    cost: 32000,
    months: 4,
    requires: "analytics",
    desc: "Loyalty grows 50% faster from fulfilled orders.",
  },
  {
    id: "pricing",
    name: "Pricing science",
    cost: 55000,
    months: 5,
    requires: "analytics",
    desc: "Customers become 15% less price-sensitive.",
  },
  {
    id: "robotics",
    name: "Robotic production",
    cost: 45000,
    months: 4,
    requires: null,
    desc: "+12% capacity across your companies.",
  },
  {
    id: "digitaltwin",
    name: "Digital twins",
    cost: 80000,
    months: 6,
    requires: "robotics",
    desc: "Reduce material use by 10% and improve continuity.",
  },
  {
    id: "routing",
    name: "Dynamic freight routing",
    cost: 22000,
    months: 3,
    requires: null,
    desc: "Halve warehouse shipping fees.",
  },
  {
    id: "coldchain",
    name: "Cold-chain storage",
    cost: 38000,
    months: 4,
    requires: "routing",
    desc: "Reduce monthly food warehouse spoilage from 2% to 0.5%.",
  },
  {
    id: "grid",
    name: "Grid optimization",
    cost: 65000,
    months: 5,
    requires: "robotics",
    desc: "Energy and water companies earn 15% more demand.",
  },
  {
    id: "patents",
    name: "Patent portfolio",
    cost: 90000,
    months: 6,
    requires: "analytics",
    desc: "Earn $1,000 per month per completed corporate technology.",
  },
  {
    id: "audit",
    name: "Continuous compliance",
    cost: 28000,
    months: 3,
    requires: null,
    desc: "Reduce audit risk by 60%.",
  },
  {
    id: "brandhouse",
    name: "House of brands",
    cost: 110000,
    months: 6,
    requires: "crm",
    desc: "+12% demand and +10% franchise royalty income.",
  },
  {
    id: "frontier",
    name: "Frontier research lab",
    cost: 200000,
    months: 8,
    requires: "digitaltwin",
    desc: "+20% demand in technology, biotech, and chip manufacturing.",
  },
];
export const MACRO_EVENTS = [
  {
    id: "normal",
    name: "A steady trading environment",
    desc: "No exceptional shock. Focus on execution.",
    months: 3,
    demand: 1,
  },
  {
    id: "tourism",
    name: "The travel boom",
    desc: "Hotel and restaurant demand climbs 30% for four months.",
    months: 4,
    demand: 1,
    boost: ["hotel", "restaurant"],
    mult: 1.3,
  },
  {
    id: "energy",
    name: "Energy squeeze",
    desc: "Energy input index jumps 25%; economy-wide demand falls 4% for three months.",
    months: 3,
    demand: 0.96,
    commodity: 2,
    jump: 1.25,
  },
  {
    id: "digital",
    name: "The digital investment wave",
    desc: "Software, data centers, cybersecurity, and chips see demand rise 25%.",
    months: 4,
    demand: 1,
    boost: ["software", "datacenter", "security", "semiconductor"],
    mult: 1.25,
  },
  {
    id: "credit",
    name: "Credit-market nerves",
    desc: "Demand falls 12%. Risk assets experience a one-off selloff.",
    months: 3,
    demand: 0.88,
    market: 0.87,
  },
  {
    id: "harvest",
    name: "A bumper harvest",
    desc: "Agricultural prices fall 20%; household demand rises 5%.",
    months: 3,
    demand: 1.05,
    commodity: 0,
    jump: 0.8,
  },
  {
    id: "building",
    name: "Infrastructure stimulus",
    desc: "Construction, manufacturing, logistics, and water demand rises 25%.",
    months: 5,
    demand: 1,
    boost: ["construction", "factory", "logistics", "water"],
    mult: 1.25,
  },
  {
    id: "health",
    name: "Public-health spending",
    desc: "Clinics and biotech receive a temporary 30% demand lift.",
    months: 4,
    demand: 1,
    boost: ["clinic", "biotech"],
    mult: 1.3,
  },
  {
    id: "retail",
    name: "Consumer spending surge",
    desc: "Retail, cafés, entertainment, and bakeries see a 20% demand lift.",
    months: 3,
    demand: 1,
    boost: ["shop", "coffee", "gaming", "bakery"],
    mult: 1.2,
  },
  {
    id: "cloud",
    name: "Compute supply shortage",
    desc: "Compute prices jump 30%. Tech margins are under pressure.",
    months: 3,
    demand: 1,
    commodity: 3,
    jump: 1.3,
  },
  {
    id: "green",
    name: "The clean investment cycle",
    desc: "Solar, recycling, and regenerative farms receive 30% more demand.",
    months: 5,
    demand: 1,
    boost: ["energy", "recycling", "farm"],
    mult: 1.3,
  },
];
export const MISSIONS = [
  {
    id: "first",
    name: "First principles",
    desc: "Own one company and complete a month.",
    reward: 1500,
    check: (s) => s.businesses.length > 0 && s.month > 0,
  },
  {
    id: "team",
    name: "Team builder",
    desc: "Employ at least 10 people across the group.",
    reward: 3500,
    check: (s) => s.businesses.reduce((n, b) => n + b.staff, 0) >= 10,
  },
  {
    id: "supply",
    name: "Supply secured",
    desc: "Receive your first warehouse shipment.",
    reward: 2000,
    check: (s) => s.empire.shipmentsReceived > 0,
  },
  {
    id: "client",
    name: "Your word is your bond",
    desc: "Complete three business contracts.",
    reward: 5000,
    check: (s) => s.world.delivered >= 3,
  },
  {
    id: "global",
    name: "Beyond the home market",
    desc: "Operate in three cities at once.",
    reward: 12000,
    check: (s) => new Set(s.businesses.map((b) => b.city)).size >= 3,
  },
  {
    id: "board",
    name: "A team at the top",
    desc: "Hire three executives.",
    reward: 7500,
    check: (s) => s.empire.executives.length >= 3,
  },
  {
    id: "integrated",
    name: "From farm to table",
    desc: "Own a farm and a food-service business.",
    reward: 8000,
    check: (s) =>
      s.businesses.some((b) => b.type === "farm") &&
      s.businesses.some((b) =>
        ["coffee", "bakery", "restaurant"].includes(b.type),
      ),
  },
  {
    id: "inventor",
    name: "Something new",
    desc: "Launch four product lines across the group.",
    reward: 10000,
    check: (s) => s.businesses.reduce((n, b) => n + b.products, 0) >= 4,
  },
  {
    id: "science",
    name: "Research institution",
    desc: "Complete four corporate technologies.",
    reward: 18000,
    check: (s) => s.empire.researched.length >= 4,
  },
  {
    id: "land",
    name: "Property developer",
    desc: "Own three properties, including one level 3 building.",
    reward: 15000,
    check: (s) =>
      s.properties.length >= 3 && s.properties.some((p) => p.level >= 3),
  },
  {
    id: "float",
    name: "Opening bell",
    desc: "Take your holding company public.",
    reward: 25000,
    check: (s) => s.empire.corporate.listed,
  },
  {
    id: "chain",
    name: "A name in every neighborhood",
    desc: "Sign five franchisees.",
    reward: 15000,
    check: (s) => s.empire.franchises.length >= 5,
  },
  {
    id: "fx",
    name: "A global treasury",
    desc: "Hold all four foreign currencies.",
    reward: 6000,
    check: (s) => s.empire.fxHoldings.every((v) => v > 0),
  },
  {
    id: "resilience",
    name: "Built to last",
    desc: "Operate five insured companies with continuity plans.",
    reward: 18000,
    check: (s) =>
      s.businesses.filter((b) => b.insured && b.resilient).length >= 5,
  },
  {
    id: "diversity",
    name: "A true conglomerate",
    desc: "Own businesses in ten different industries.",
    reward: 50000,
    check: (s) => new Set(s.businesses.map((b) => b.type)).size >= 10,
  },
  {
    id: "cash",
    name: "Rainy-day fund",
    desc: "Hold $500,000 in cash.",
    reward: 15000,
    check: (s) => s.cash >= 500000,
  },
  {
    id: "decade",
    name: "The long game",
    desc: "Navigate a decade of monthly decisions.",
    reward: 50000,
    check: (s) => s.month >= 120,
  },
];
export function initDeepBusiness(b) {
  for (let [k, v] of Object.entries({
    segment: "balanced",
    loyalty: 20,
    compliance: 500,
    warehouse: false,
    warehouseFallback: true,
    history: [],
    brandInvestment: 0,
  }))
    if (b[k] === undefined) b[k] = v;
}
export function ensureEmpire(s) {
  ensureWorld(s);
  if (!s.empire)
    s.empire = {
      version: 1,
      warehouse: [0, 0, 0, 0],
      shipments: [],
      shipmentsReceived: 0,
      executives: [],
      candidates: [],
      fx: FX.map((x) => x.base),
      fxHoldings: [0, 0, 0, 0],
      fxHistory: FX.map((x) => [x.base]),
      orders: [],
      shorts: [],
      options: [],
      corporate: {
        name: "Your Holdings",
        founderShares: 1000000,
        publicShares: 0,
        listed: false,
        payout: 0,
        dividendsPaid: 0,
        founderDistributions: 0,
        rounds: 0,
      },
      researched: [],
      researchProjects: [],
      franchises: [],
      claimed: [],
      macro: { ...MACRO_EVENTS[0], remaining: 3 },
      automation: { enabled: false, reserve: 5000, sellStocks: false },
      monthExpense: 0,
      monthIncome: 0,
      tradeSequence: 0,
      control: { difficulty: "standard" },
    };
  let e = s.empire;
  s.businesses.forEach(initDeepBusiness);
  s.properties.forEach((p) => {
    if (p.level === undefined)
      Object.assign(p, {
        level: 1,
        condition: 100,
        tenant: "balanced",
        reserve: 0,
        development: 0,
      });
  });
  if (!e.candidates.length) e.candidates = makeCandidates(s);
  return e;
}
export function makeCandidates(s) {
  let names = [
    "Alex Morgan",
    "Sam Rivera",
    "Robin Park",
    "Jordan Ellis",
    "Taylor Chen",
    "Casey Adeyemi",
    "Noor Hassan",
    "Avery Silva",
    "Jamie Laurent",
    "Sasha Novak",
    "Drew Kim",
    "Riley Okafor",
  ];
  return ROLES.map((r, i) => {
    let skill = 40 + Math.floor(rng(s) * 56);
    return {
      id: `talent-${s.month}-${i}`,
      name: names[Math.floor(rng(s) * names.length)],
      role: r.id,
      skill,
      salary: Math.round(r.salary * (0.7 + skill / 100)),
      signing: Math.round(r.salary * (0.6 + skill / 80)),
    };
  });
}
export function bonus(s, role) {
  return (s.empire.executives.find((e) => e.role === role)?.skill || 0) / 100;
}
export function has(s, tech) {
  return s.empire.researched.includes(tech);
}
export function customerMultiplier(s, b) {
  let t = TYPES.find((t) => t.id === b.type),
    ind = INDUSTRY[b.type];
  let season = 1 + Math.sin(((s.month - 2) / 12) * Math.PI * 2) * ind.season;
  let cycle = Math.max(0.65, 1 + (s.economy - 1) * (ind.cyclical - 1));
  let seg =
    b.segment === "budget"
      ? b.price <= t.price
        ? 1.18
        : 0.9
      : b.segment === "premium"
        ? b.quality >= 2
          ? 1.15
          : 0.85
        : b.segment === "enterprise"
          ? 0.83
          : 1;
  let macro = s.empire.macro;
  let event = macro.demand * (macro.boost?.includes(b.type) ? macro.mult : 1);
  let tech =
    (has(s, "analytics") ? 1.08 : 1) *
    (has(s, "brandhouse") ? 1.12 : 1) *
    (has(s, "frontier") &&
    ["software", "semiconductor", "biotech"].includes(b.type)
      ? 1.2
      : 1) *
    (has(s, "grid") && ["energy", "water"].includes(b.type) ? 1.15 : 1);
  return (
    season *
    cycle *
    seg *
    event *
    tech *
    (1 + bonus(s, "cmo") * 0.18) *
    (1 + b.loyalty * 0.002) *
    (1 + Math.sqrt(b.brandInvestment / 1000) * 0.04) *
    (s.businesses.some((x) => x.type === "media") ? 1.05 : 1)
  );
}
export function deepMaterial(s, b) {
  let synergies = 1;
  if (
    s.businesses.some((x) => x.type === "farm") &&
    INDUSTRY[b.type].commodity === 0
  )
    synergies *= 0.88;
  if (
    s.businesses.some((x) => x.type === "datacenter") &&
    INDUSTRY[b.type].commodity === 3
  )
    synergies *= 0.9;
  if (
    s.businesses.some((x) => x.type === "recycling") &&
    INDUSTRY[b.type].commodity === 1
  )
    synergies *= 0.92;
  return (
    synergies * (1 - bonus(s, "cto") * 0.15) * (has(s, "digitaltwin") ? 0.9 : 1)
  );
}
export function deepCapacity(s) {
  return (1 + bonus(s, "coo") * 0.12) * (has(s, "robotics") ? 1.12 : 1);
}
export function quoteWarehouse(s, index, lots, mode) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index > 3 ||
    !Number.isInteger(lots) ||
    lots < 1 ||
    lots > 100000 ||
    !["standard", "express"].includes(mode)
  )
    return null;
  let material = s.world.commodities[index] * lots;
  let freight =
    material *
    (mode === "express" ? 0.08 : 0.025) *
    (s.late?.projects.some((p) => p.id === "port" && p.status === "complete")
      ? 0.5
      : 1) *
    (has(s, "routing") ? 0.5 : 1) *
    (s.businesses.some((b) => b.type === "logistics") ? 0.6 : 1);
  return {
    material,
    freight,
    total: material + freight,
    eta: s.month + (mode === "express" ? 1 : 2),
  };
}
export function orderMaterials(s, index, lots, mode) {
  ensureEmpire(s);
  let q = quoteWarehouse(s, index, lots, mode);
  if (!q || s.cash < q.total) return false;
  s.cash -= q.total;
  s.empire.shipments.push({
    index,
    lots,
    due: q.eta,
    cost: q.material,
    freight: q.freight,
  });
  report(
    s,
    `Ordered ${lots} lots of materials; arrival in month ${q.eta + 1}.`,
  );
  return true;
}
export function warehouseProduction(s, b, units, unitCost) {
  if (!b.warehouse) return { units: 0, cost: 0 };
  if (recipeActive(b)) return recipeProduction(s, b, units);
  let i = INDUSTRY[b.type].commodity;
  const basis = warehouseValues(s);
  let lotsPerUnit = unitCost / s.world.commodities[i];
  let produced = Math.min(
    units,
    Math.floor(s.empire.warehouse[i] / lotsPerUnit),
  );
  const cost = s.empire.warehouse[i]
    ? basis[i] * ((produced * lotsPerUnit) / s.empire.warehouse[i])
    : 0;
  basis[i] = Math.max(0, basis[i] - cost);
  s.empire.warehouse[i] = Math.max(
    0,
    s.empire.warehouse[i] - produced * lotsPerUnit,
  );
  return { units: produced, cost };
}
export function hire(s, id) {
  ensureEmpire(s);
  let c = s.empire.candidates.find((c) => c.id === id);
  if (
    !c ||
    s.cash < c.signing ||
    s.empire.executives.some((e) => e.role === c.role)
  )
    return false;
  s.cash -= c.signing;
  s.empire.executives.push({ ...c, tenure: 0 });
  s.empire.candidates = s.empire.candidates.filter((x) => x !== c);
  return true;
}
export function dismiss(s, id) {
  let c = s.empire.executives.find((c) => c.id === id);
  if (!c || s.cash < c.salary * 2) return false;
  s.cash -= c.salary * 2;
  s.empire.executives = s.empire.executives.filter((x) => x !== c);
  return true;
}
export function fxTrade(s, index, amount, buy = true) {
  ensureEmpire(s);
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 4 ||
    !num(amount) ||
    amount <= 0
  )
    return false;
  let gross = amount * s.empire.fx[index],
    fee =
      gross *
      0.002 *
      (s.late?.projects.some(
        (p) => p.id === "orbital" && p.status === "complete",
      )
        ? 0.5
        : 1);
  if (buy) {
    if (s.cash < gross + fee) return false;
    s.cash -= gross + fee;
    s.empire.fxHoldings[index] += amount;
  } else {
    if (s.empire.fxHoldings[index] < amount) return false;
    s.empire.fxHoldings[index] -= amount;
    s.cash += gross - fee;
  }
  return true;
}
export function placeOrder(s, asset, side, qty, limit) {
  ensureEmpire(s);
  if (
    !Number.isInteger(asset) ||
    asset < 0 ||
    asset >= 5 ||
    !["buy", "sell"].includes(side) ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    !num(limit) ||
    limit <= 0
  )
    return false;
  s.empire.orders.push({
    id: ++s.empire.tradeSequence,
    asset,
    side,
    qty,
    limit,
    expires: s.month + 6,
  });
  return true;
}
export function openShort(s, asset, qty) {
  ensureEmpire(s);
  if (
    !Number.isInteger(asset) ||
    asset < 0 ||
    asset >= 5 ||
    !Number.isInteger(qty) ||
    qty < 1
  )
    return false;
  let collateral = s.prices[asset] * qty * 1.5;
  if (s.cash < collateral) return false;
  s.cash -= collateral;
  s.empire.shorts.push({
    id: ++s.empire.tradeSequence,
    asset,
    qty,
    entry: s.prices[asset],
    collateral,
  });
  return true;
}
export function shortEquity(s, p) {
  return p.collateral + (p.entry - s.prices[p.asset]) * p.qty;
}
export function closeShort(s, id) {
  let p = s.empire.shorts.find((p) => p.id === id);
  if (!p) return false;
  s.cash += shortEquity(s, p);
  s.empire.shorts = s.empire.shorts.filter((x) => x !== p);
  return true;
}
export function optionQuote(s, asset, kind, count, months) {
  if (
    !Number.isInteger(asset) ||
    asset < 0 ||
    asset >= 5 ||
    !["call", "put"].includes(kind) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 1000 ||
    ![1, 3, 6].includes(months)
  )
    return null;
  let volatility = [0.055, 0.18, 0.08, 0.12, 0.012][asset];
  let premium =
    s.prices[asset] * Math.max(0.02, volatility * Math.sqrt(months) * 0.65);
  return {
    strike: s.prices[asset],
    premium,
    total: premium * 10 * count,
    expiry: s.month + months,
  };
}
export function buyOption(s, asset, kind, count, months) {
  ensureEmpire(s);
  let q = optionQuote(s, asset, kind, count, months);
  if (!q || s.cash < q.total) return false;
  s.cash -= q.total;
  s.empire.options.push({
    id: ++s.empire.tradeSequence,
    asset,
    kind,
    count,
    ...q,
  });
  return true;
}
export function optionValue(s, p) {
  let intrinsic = Math.max(
    0,
    (s.prices[p.asset] - p.strike) * (p.kind === "call" ? 1 : -1),
  );
  let remaining = Math.max(0, p.expiry - s.month);
  return (
    (intrinsic +
      (p.premium * remaining) / Math.max(1, p.originalTerm || remaining || 1)) *
    p.count *
    10
  );
}
export function valuation(s, groupWorth) {
  let trailing =
    s.history.slice(-12).reduce((n, h) => n + Math.max(0, h.profit), 0) /
    Math.max(1, Math.min(12, s.history.length));
  return (
    Math.max(10000, groupWorth, Math.max(0, trailing) * 36) *
    (1 + Math.max(0, s.economy - 1))
  );
}
export function equityRaise(s, amount, groupWorth, ipo = false) {
  ensureEmpire(s);
  let c = s.empire.corporate;
  if (
    !num(amount) ||
    amount < 10000 ||
    amount > valuation(s, groupWorth) * 0.4 ||
    (ipo && (s.month < 12 || s.businesses.length < 3 || groupWorth < 250000)) ||
    (ipo && c.listed)
  )
    return false;
  let val = valuation(s, groupWorth),
    shares = Math.ceil(amount / (val / (c.founderShares + c.publicShares)));
  let fee = ipo ? Math.max(5000, amount * 0.05) : amount * 0.04;
  s.cash += amount - fee;
  c.publicShares += shares;
  c.rounds++;
  if (ipo) c.listed = true;
  report(
    s,
    `${ipo ? "IPO completed" : "Equity financing closed"}: raised $${Math.round(amount - fee).toLocaleString()} net; ${shares.toLocaleString()} new shares issued.`,
  );
  return true;
}
export function buyback(s, shares, groupWorth) {
  let c = s.empire.corporate;
  if (!Number.isInteger(shares) || shares < 1 || shares > c.publicShares)
    return false;
  let cost =
    ((shares * valuation(s, groupWorth)) / (c.founderShares + c.publicShares)) *
    1.01;
  if (s.cash < cost) return false;
  s.cash -= cost;
  c.publicShares -= shares;
  return true;
}
export function corporateResearch(s, id) {
  ensureEmpire(s);
  let t = RESEARCH.find((t) => t.id === id);
  if (
    !t ||
    has(s, id) ||
    s.empire.researchProjects.some((p) => p.id === id) ||
    s.empire.researchProjects.length >= 2 ||
    (t.requires && !has(s, t.requires)) ||
    s.cash < t.cost
  )
    return false;
  s.cash -= t.cost;
  s.empire.researchProjects.push({ id, remaining: t.months });
  return true;
}
export function franchise(s, b) {
  ensureEmpire(s);
  if (!b || b.level < 3 || b.reputation < 80 || s.cash < 25000) return false;
  s.cash -= 25000;
  s.empire.franchises.push({
    id: ++s.empire.tradeSequence,
    type: b.type,
    brand: b.name,
    health: 85,
    age: 0,
  });
  return true;
}
export function upgradeProperty(s, index, baseCost) {
  ensureEmpire(s);
  let p = s.properties[index];
  if (!p || p.development || p.level >= 5) return false;
  let cost =
    baseCost *
    0.18 *
    p.level *
    (s.businesses.some((b) => b.type === "construction") ? 0.8 : 1);
  if (s.cash < cost) return false;
  s.cash -= cost;
  p.development = 3;
  return true;
}
export function propertyIncome(s, p, base) {
  let vacancy =
    p.tenant === "corporate" ? 0.03 : p.tenant === "budget" ? 0.04 : 0.08;
  let rentFactor =
    p.tenant === "corporate" ? 0.88 : p.tenant === "budget" ? 0.8 : 1;
  let condition = p.condition / 100;
  let gross = p.development
    ? 0
    : base.rent *
      (1 + (p.level - 1) * 0.24) *
      rentFactor *
      condition *
      (rng(s) < vacancy ? 0 : 1);
  let upkeep =
    base.upkeep * s.inflation * (1 + (p.level - 1) * 0.15) + p.reserve;
  p.condition = Math.max(
    35,
    Math.min(100, p.condition - 1.5 + p.reserve / 120),
  );
  return { gross, upkeep, net: gross - upkeep };
}
export function beforeEmpireMonth(s) {
  ensureEmpire(s);
  let e = s.empire;
  const basis = warehouseValues(s);
  e.monthExpense = 0;
  e.monthIncome = 0;
  for (let shipment of e.shipments.filter((x) => x.due <= s.month)) {
    basis[shipment.index] += shipment.cost + shipment.freight;
    e.warehouse[shipment.index] += shipment.lots;
    e.shipmentsReceived++;
    report(
      s,
      `Warehouse received ${shipment.lots} lots. Procurement value $${Math.round(shipment.cost).toLocaleString()}.`,
    );
  }
  e.shipments = e.shipments.filter((x) => x.due > s.month);
  let storage = e.warehouse.reduce(
    (n, l, i) => n + l * s.world.commodities[i] * 0.005,
    0,
  );
  s.cash -= storage;
  e.monthExpense += storage;
  const retained = has(s, "coldchain") ? 0.995 : 0.98;
  // Noncash loss belongs in operating profit, not the cash-expense addback.
  commerce(s).expense += basis[0] * (1 - retained);
  basis[0] *= retained;
  e.warehouse[0] *= retained;
  for (let x of e.executives) {
    s.cash -= x.salary;
    e.monthExpense += x.salary;
    x.tenure++;
    if (x.tenure % 12 === 0) x.salary = Math.round(x.salary * 1.04);
  }
  for (let b of s.businesses) {
    b.morale = Math.min(100, b.morale + bonus(s, "people") * 2);
    if (
      b.project &&
      bonus(s, "cto") > 0.7 &&
      s.month % 2 === 0 &&
      b.project.remaining > 1
    )
      b.project.remaining--;
    let regulated = [
      "clinic",
      "biotech",
      "water",
      "energy",
      "semiconductor",
    ].includes(b.type);
    let fineChance =
      Math.max(0.005, (regulated ? 0.12 : 0.055) - b.compliance / 15000) *
      (1 - bonus(s, "risk") * 0.6) *
      (has(s, "audit") ? 0.4 : 1) *
      (s.late?.projects.some(
        (p) => p.id === "health" && p.status === "complete",
      )
        ? 0.7
        : 1);
    if (rng(s) < fineChance) {
      let fine = (regulated ? 4500 : 1800) * b.level;
      s.cash -= fine;
      e.monthExpense += fine;
      b.reputation = Math.max(20, b.reputation - 5);
      report(
        s,
        `${b.name} failed a regulatory audit: $${fine.toLocaleString()} fine and a reputation loss.`,
      );
    }
  }
  for (let p of s.properties)
    if (p.development > 0) {
      p.development--;
      if (p.development === 0) {
        p.level++;
        p.condition = 100;
        report(
          s,
          `A property development finished. Building upgraded to level ${p.level}.`,
        );
      }
    }
  for (let p of e.researchProjects) p.remaining--;
  for (let p of e.researchProjects.filter((p) => p.remaining <= 0)) {
    e.researched.push(p.id);
    report(
      s,
      `Corporate research completed: ${RESEARCH.find((t) => t.id === p.id).name}.`,
    );
  }
  e.researchProjects = e.researchProjects.filter((p) => p.remaining > 0);
  if (has(s, "patents")) {
    let income = e.researched.length * 1000;
    s.cash += income;
    e.monthIncome += income;
  }
  for (let f of e.franchises) {
    f.age++;
    f.health = Math.max(0, Math.min(100, f.health + (rng(s) - 0.5) * 12));
    let t = TYPES.find((t) => t.id === f.type),
      income =
        t.cost *
        0.008 *
        s.economy *
        (f.health / 85) *
        (has(s, "brandhouse") ? 1.1 : 1);
    s.cash += income;
    e.monthIncome += income;
  }
  e.macro.remaining--;
  if (e.macro.remaining <= 0) {
    let m = MACRO_EVENTS[Math.floor(rng(s) * MACRO_EVENTS.length)];
    e.macro = { ...m, remaining: m.months };
    if (m.commodity !== undefined)
      s.world.commodities[m.commodity] = Math.min(
        240,
        s.world.commodities[m.commodity] * m.jump,
      );
    if (m.market)
      s.prices = s.prices.map((p, i) => p * (i === 4 ? 1 : m.market));
    report(s, `${m.name}: ${m.desc}`);
  }
  if (s.month % 3 === 0) e.candidates = makeCandidates(s);
  e.fx = e.fx.map((p, i) => {
    let next = Math.max(
      FX[i].base * 0.35,
      Math.min(FX[i].base * 3, p * (1 + (rng(s) - 0.5) * FX[i].vol)),
    );
    e.fxHistory[i].push(next);
    e.fxHistory[i] = e.fxHistory[i].slice(-24);
    return next;
  });
}
export function afterEmpireMonth(s) {
  let e = s.empire;
  for (let o of [...e.orders]) {
    let p = s.prices[o.asset];
    if (o.expires < s.month) {
      e.orders = e.orders.filter((x) => x !== o);
      continue;
    }
    if (o.side === "buy" && p <= o.limit && s.cash >= p * o.qty) {
      s.cash -= p * o.qty;
      s.holdings[o.asset] = (s.holdings[o.asset] || 0) + o.qty;
      e.orders = e.orders.filter((x) => x !== o);
      report(s, `Limit buy filled: ${o.qty} shares at $${p.toFixed(2)}.`);
    } else if (
      o.side === "sell" &&
      p >= o.limit &&
      (s.holdings[o.asset] || 0) >= o.qty
    ) {
      s.cash += p * o.qty;
      s.holdings[o.asset] -= o.qty;
      e.orders = e.orders.filter((x) => x !== o);
      report(s, `Limit sell filled: ${o.qty} shares at $${p.toFixed(2)}.`);
    }
  }
  for (let p of [...e.shorts]) {
    let fee = s.prices[p.asset] * p.qty * 0.003;
    s.cash -= fee;
    e.monthExpense += fee;
    if (shortEquity(s, p) < s.prices[p.asset] * p.qty * 0.3) {
      closeShort(s, p.id);
      report(
        s,
        "A short position breached maintenance margin and was closed automatically.",
      );
    }
  }
  for (let p of e.options.filter((p) => p.expiry <= s.month)) {
    let payout =
      Math.max(
        0,
        (s.prices[p.asset] - p.strike) * (p.kind === "call" ? 1 : -1),
      ) *
      p.count *
      10;
    s.cash += payout;
    report(
      s,
      `An option position expired: cash settlement $${Math.round(payout).toLocaleString()}.`,
    );
  }
  e.options = e.options.filter((p) => p.expiry > s.month);
  let c = e.corporate,
    dividend = Math.max(0, s.profit) * c.payout;
  if (dividend > s.cash) dividend = Math.max(0, s.cash);
  if (dividend > 0) {
    s.cash -= dividend;
    c.dividendsPaid += dividend;
    c.founderDistributions +=
      (dividend * c.founderShares) / (c.founderShares + c.publicShares);
  }
  if (
    e.automation.enabled &&
    e.automation.sellStocks &&
    s.cash < e.automation.reserve
  ) {
    for (let i = 0; i < 5; i++) {
      let qty = Math.min(
        s.holdings[i] || 0,
        Math.ceil((e.automation.reserve - s.cash) / s.prices[i]),
      );
      if (qty > 0) {
        s.holdings[i] -= qty;
        s.cash += qty * s.prices[i];
        report(
          s,
          `Treasury automation sold ${qty} shares to rebuild the cash reserve.`,
        );
      }
      if (s.cash >= e.automation.reserve) break;
    }
  }
  for (let b of s.businesses) {
    let satisfied = b.lost === 0;
    b.loyalty = Math.max(
      0,
      Math.min(
        100,
        b.loyalty + (satisfied ? 1.5 * (has(s, "crm") ? 1.5 : 1) : -0.5),
      ),
    );
    b.history.push({
      month: s.month,
      revenue: b.lastRevenue,
      profit: b.lastProfit,
      loyalty: b.loyalty,
    });
    b.history = b.history.slice(-24);
  }
}
export function additionalAssets(s) {
  if (!s.empire) return 0;
  let e = s.empire;
  return (
    warehouseValues(s).reduce((n, v) => n + v, 0) +
    e.shipments.reduce((n, x) => n + x.cost + x.freight, 0) +
    e.fxHoldings.reduce((n, v, i) => n + v * e.fx[i], 0) +
    e.shorts.reduce((n, p) => n + shortEquity(s, p), 0) +
    e.options.reduce(
      (n, p) =>
        n +
        Math.max(
          0,
          (s.prices[p.asset] - p.strike) * (p.kind === "call" ? 1 : -1),
        ) *
          p.count *
          10,
      0,
    ) +
    e.franchises.length * 15000
  );
}
export function claim(s, id) {
  let m = MISSIONS.find((m) => m.id === id);
  if (!m || s.empire.claimed.includes(id) || !m.check(s)) return false;
  s.cash += m.reward;
  s.empire.claimed.push(id);
  return true;
}
function num(n) {
  return typeof n === "number" && Number.isFinite(n);
}
