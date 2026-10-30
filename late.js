import { warehouseValues } from "./inventory.js?v=4ae5ac115653";
import { commerce } from "./commerce.js?v=4ae5ac115653";
import { TYPES, INDUSTRY } from "./catalog.js?v=4ae5ac115653";
import { CITIES, rng, city, report } from "./world.js?v=4ae5ac115653";
import { ensureEmpire, has } from "./empire.js?v=4ae5ac115653";
export const REGIONS = [
  {
    id: "home",
    name: "Home Union",
    currency: -1,
    tariff: 0.02,
    growth: 1,
    risk: 0.03,
    desc: "A mature home market with predictable trading rules.",
  },
  {
    id: "euro",
    name: "Continental Accord",
    currency: 0,
    tariff: 0.045,
    growth: 1.06,
    risk: 0.04,
    desc: "Strong consumer markets and higher compliance standards.",
  },
  {
    id: "sterling",
    name: "Atlantic Compact",
    currency: 1,
    tariff: 0.035,
    growth: 1.04,
    risk: 0.04,
    desc: "Premium professional services and global finance.",
  },
  {
    id: "pacific",
    name: "Pacific Federation",
    currency: 2,
    tariff: 0.06,
    growth: 1.12,
    risk: 0.06,
    desc: "Advanced manufacturing and technology supply chains.",
  },
  {
    id: "frontier",
    name: "Frontier Coalition",
    currency: 3,
    tariff: 0.09,
    growth: 1.2,
    risk: 0.1,
    desc: "Fast growth with more volatile trade and labor conditions.",
  },
];
export const CITY_REGION = {
  brookhaven: "home",
  newford: "home",
  portazure: "home",
  siliconbay: "home",
  sunvale: "home",
  verdant: "euro",
  meridian: "euro",
  crownport: "sterling",
  northbridge: "sterling",
  kaizen: "pacific",
  seishin: "pacific",
  aurora: "frontier",
  copperdelta: "frontier",
};
const NEW_CITIES = [
  {
    id: "verdant",
    name: "Verdant",
    region: "Continental Accord",
    demand: 1.6,
    wages: 1.2,
    rent: 1.4,
    setup: 42000,
    desc: "A sustainability-focused market for agriculture and circular industry.",
  },
  {
    id: "meridian",
    name: "Meridian",
    region: "Continental Accord",
    demand: 1.8,
    wages: 1.5,
    rent: 1.6,
    setup: 55000,
    desc: "Established healthcare, biotech, and education customers.",
  },
  {
    id: "crownport",
    name: "Crownport",
    region: "Atlantic Compact",
    demand: 2,
    wages: 1.8,
    rent: 2.1,
    setup: 70000,
    desc: "Premium clients, international finance, and formidable overhead.",
  },
  {
    id: "northbridge",
    name: "Northbridge",
    region: "Atlantic Compact",
    demand: 1.6,
    wages: 1.25,
    rent: 1.3,
    setup: 38000,
    desc: "A productive industrial base and reliable service economy.",
  },
  {
    id: "kaizen",
    name: "Kaizen",
    region: "Pacific Federation",
    demand: 2.1,
    wages: 1.45,
    rent: 1.7,
    setup: 75000,
    desc: "Deep demand for precision manufacturing and chips.",
  },
  {
    id: "seishin",
    name: "Seishin",
    region: "Pacific Federation",
    demand: 1.9,
    wages: 1.4,
    rent: 1.6,
    setup: 65000,
    desc: "Digital entertainment, software, and connected infrastructure.",
  },
  {
    id: "aurora",
    name: "Aurora",
    region: "Frontier Coalition",
    demand: 1.65,
    wages: 0.8,
    rent: 0.95,
    setup: 35000,
    desc: "Young consumers and rapid growth in connectivity and healthcare.",
  },
  {
    id: "copperdelta",
    name: "Copper Delta",
    region: "Frontier Coalition",
    demand: 1.5,
    wages: 0.7,
    rent: 0.8,
    setup: 30000,
    desc: "An export-oriented resource and logistics center.",
  },
];
for (let c of NEW_CITIES)
  if (!CITIES.some((x) => x.id === c.id)) CITIES.push(c);
export const MEGAPROJECTS = [
  {
    id: "port",
    name: "Intercontinental logistics hub",
    cost: 1500000,
    months: 12,
    material: 1400,
    requires: ["routing"],
    industries: ["logistics"],
    income: 18000,
    effect: "Shipping fees −50%; all material costs −4%.",
  },
  {
    id: "research",
    name: "Global research campus",
    cost: 2500000,
    months: 16,
    material: 1800,
    requires: ["digitaltwin"],
    industries: ["education", "software"],
    income: 30000,
    effect: "Corporate research advances one extra month every other month.",
  },
  {
    id: "grid",
    name: "Continental supergrid",
    cost: 4000000,
    months: 20,
    material: 3200,
    requires: ["grid"],
    industries: ["energy", "water"],
    income: 55000,
    effect: "Group material costs −8%; utility demand +20%.",
  },
  {
    id: "city",
    name: "Carbon-neutral smart city",
    cost: 7500000,
    months: 24,
    material: 5000,
    requires: ["grid", "routing"],
    industries: ["construction", "energy", "telecom"],
    income: 100000,
    effect: "Every owned property earns +20% gross rent.",
  },
  {
    id: "foundry",
    name: "Next-generation chip complex",
    cost: 11000000,
    months: 28,
    material: 7000,
    requires: ["frontier"],
    industries: ["semiconductor", "datacenter"],
    income: 150000,
    effect: "Advanced manufacturing and digital-sector demand +25%.",
  },
  {
    id: "health",
    name: "Universal health network",
    cost: 6000000,
    months: 22,
    material: 2500,
    requires: ["analytics", "audit"],
    industries: ["clinic", "biotech"],
    income: 80000,
    effect: "Healthcare demand +30%; all business audit risk −30%.",
  },
  {
    id: "orbital",
    name: "Orbital communications array",
    cost: 18000000,
    months: 32,
    material: 10000,
    requires: ["frontier", "digitaltwin"],
    industries: ["telecom", "semiconductor", "software"],
    income: 260000,
    effect: "Global demand +10%; FX trading fees halved.",
  },
  {
    id: "ocean",
    name: "Ocean restoration enterprise",
    cost: 9500000,
    months: 26,
    material: 4000,
    requires: ["grid", "coldchain"],
    industries: ["water", "recycling", "farm"],
    income: 130000,
    effect: "Food spoilage eliminated; carbon levies halved.",
  },
  {
    id: "exchange",
    name: "Global capital exchange",
    cost: 15000000,
    months: 30,
    material: 3500,
    requires: ["analytics", "pricing"],
    industries: ["software", "security"],
    income: 220000,
    effect:
      "Group borrowing rates discounted 10%; bank loan interest income +10%.",
  },
  {
    id: "fusion",
    name: "Fusion demonstration network",
    cost: 30000000,
    months: 36,
    material: 15000,
    requires: ["frontier", "grid"],
    industries: ["energy", "biotech", "semiconductor"],
    income: 450000,
    effect: "Group material costs −15% and production capacity +10%.",
  },
  {
    id: "habitat",
    name: "Autonomous habitat program",
    cost: 60000000,
    months: 42,
    material: 24000,
    requires: ["frontier", "digitaltwin", "grid"],
    industries: ["construction", "water", "energy", "logistics"],
    income: 900000,
    effect: "Group demand +15%; unlocks the global steward title.",
  },
  {
    id: "legacy",
    name: "The century endowment",
    cost: 100000000,
    months: 48,
    material: 0,
    requires: ["patents", "brandhouse"],
    industries: [],
    income: 1500000,
    effect:
      "A permanent source of cash flow and +50 dynasty prestige at succession.",
  },
];
export const VENTURE_SECTORS = [
  { name: "Quantum orchard", type: "farm", risk: 0.035, growth: 0.09 },
  { name: "Neuron Harbor", type: "software", risk: 0.065, growth: 0.16 },
  { name: "Lattice Health", type: "biotech", risk: 0.08, growth: 0.2 },
  { name: "Volt Nest", type: "energy", risk: 0.05, growth: 0.13 },
  { name: "Copper Finch", type: "semiconductor", risk: 0.065, growth: 0.16 },
  { name: "Open Classroom", type: "education", risk: 0.025, growth: 0.07 },
  { name: "Clear Current", type: "water", risk: 0.035, growth: 0.09 },
  { name: "Pixel Orchard", type: "gaming", risk: 0.085, growth: 0.2 },
];
export const SCENARIOS = [
  {
    id: "founder",
    name: "The first $25,000",
    cash: 25000,
    debt: 0,
    desc: "A clean slate. Build your first company from savings.",
  },
  {
    id: "bootstrap",
    name: "From the kitchen table",
    cash: 15000,
    debt: 0,
    desc: "A tight budget. Make every early decision count.",
  },
  {
    id: "heir",
    name: "The reluctant heir",
    cash: 300000,
    debt: 180000,
    desc: "Capital and debt arrive together. Repair the balance sheet.",
  },
  {
    id: "industrial",
    name: "Industrial revival",
    cash: 700000,
    debt: 300000,
    desc: "Start with capital for manufacturing and infrastructure.",
  },
  {
    id: "investor",
    name: "The family office",
    cash: 1500000,
    debt: 0,
    desc: "An investment-focused start with access to private markets.",
  },
  {
    id: "tycoon",
    name: "Late-game laboratory",
    cash: 25000000,
    debt: 0,
    desc: "A sandbox for large projects, banking, and international expansion.",
  },
];
export const DYNASTY_UPGRADES = [
  {
    id: "network",
    name: "A trusted name",
    cost: 10,
    desc: "New runs start with +10 reputation at newly founded companies.",
  },
  {
    id: "capital",
    name: "Family capital",
    cost: 15,
    desc: "New runs start with an additional $50,000.",
  },
  {
    id: "knowledge",
    name: "Inherited knowledge",
    cost: 20,
    desc: "New runs begin with customer intelligence and routing research.",
  },
  {
    id: "talent",
    name: "An enduring culture",
    cost: 15,
    desc: "All companies gain +5 morale when first initialized.",
  },
  {
    id: "procurement",
    name: "Generational relationships",
    cost: 25,
    desc: "All material costs are permanently 5% lower.",
  },
  {
    id: "legacy",
    name: "Institutional memory",
    cost: 35,
    desc: "New runs begin with operations, brand, and automation at level 1.",
  },
];
export function ensureLate(s) {
  ensureEmpire(s);
  if (!s.late) {
    s.late = {
      version: 1,
      regions: REGIONS.map((r) => ({
        ...r,
        stability: 80,
        access: r.id === "home",
        treaty: 0,
      })),
      projects: [],
      ventures: [],
      ventureOffers: [],
      bank: null,
      headquarters: { level: 1, policy: "balanced", budget: 0 },
      dynasty: {
        generation: 1,
        prestige: 0,
        totalPrestige: 0,
        upgrades: [],
        records: [],
      },
      scenario: "founder",
      archive: [],
      monthIncome: 0,
      monthExpense: 0,
      exits: 0,
      bankruptcies: 0,
    };
    let missing = TYPES.filter(
      (t) => !s.world.rivals.some((r) => r.type === t.id),
    );
    for (let t of missing) {
      let c = CITIES[Math.floor(rng(s) * CITIES.length)];
      s.world.rivals.push({
        id: "sector-" + t.id,
        name:
          ["Aster", "Keystone", "Summit", "Redwood"][Math.floor(rng(s) * 4)] +
          " " +
          t.sector,
        type: t.id,
        city: c.id,
        power: 0.8 + rng(s) * 0.8,
        price: t.price * (0.85 + rng(s) * 0.3),
        reputation: 55 + rng(s) * 30,
        value: t.cost * (1.6 + rng(s)),
      });
    }
  }
  if (!s.late.ventureOffers.length) s.late.ventureOffers = makeVentures(s);
  for (let b of s.businesses) {
    if (b.generationInit === undefined) {
      b.generationInit = true;
      if (s.late.dynasty.upgrades.includes("network"))
        b.reputation = Math.min(100, b.reputation + 10);
      if (s.late.dynasty.upgrades.includes("talent"))
        b.morale = Math.min(100, b.morale + 5);
    }
  }
  return s.late;
}
export function regionFor(s, b) {
  let id = CITY_REGION[b.city] || "home";
  return s.late.regions.find((r) => r.id === id);
}
export function fxFactor(s, b) {
  let r = regionFor(s, b);
  return r.currency < 0
    ? 1
    : s.empire.fx[r.currency] / [1.08, 1.26, 0.0067, 0.42][r.currency];
}
export function completed(s, id) {
  return s.late.projects.some((p) => p.id === id && p.status === "complete");
}
export function internationalDemand(s, b) {
  let r = regionFor(s, b);
  let sector = 1;
  if (
    ["kaizen"].includes(b.city) &&
    ["factory", "semiconductor"].includes(b.type)
  )
    sector = 1.2;
  if (
    b.city === "meridian" &&
    ["clinic", "biotech", "education"].includes(b.type)
  )
    sector = 1.2;
  if (b.city === "verdant" && ["farm", "recycling", "energy"].includes(b.type))
    sector = 1.2;
  return (
    r.growth *
    (0.8 + r.stability / 400) *
    sector *
    (completed(s, "orbital") ? 1.1 : 1) *
    (completed(s, "habitat") ? 1.15 : 1) *
    (completed(s, "foundry") &&
    ["semiconductor", "software", "datacenter"].includes(b.type)
      ? 1.25
      : 1) *
    (completed(s, "health") && ["clinic", "biotech"].includes(b.type)
      ? 1.3
      : 1) *
    (completed(s, "grid") && ["energy", "water"].includes(b.type) ? 1.2 : 1)
  );
}
export function internationalMaterial(s, b) {
  let r = regionFor(s, b);
  return (
    (1 + r.tariff * (r.treaty > 0 ? 0.5 : 1)) *
    (completed(s, "port") ? 0.96 : 1) *
    (completed(s, "grid") ? 0.92 : 1) *
    (completed(s, "fusion") ? 0.85 : 1) *
    (s.late.dynasty.upgrades.includes("procurement") ? 0.95 : 1)
  );
}
export function adminMultiplier(s) {
  let l = s.late,
    load = Math.max(0, s.businesses.length - l.headquarters.level * 4);
  return (
    Math.max(0.6, 1 - load * 0.015) *
    (l.headquarters.policy === "decentralized" ? 1.05 : 1) *
    (completed(s, "fusion") ? 1.1 : 1)
  );
}
export function openRegion(s, id) {
  ensureLate(s);
  let r = s.late.regions.find((r) => r.id === id);
  let fee = REGIONS.findIndex((x) => x.id === id) * 25000 + 25000;
  if (!r || r.access || s.cash < fee) return false;
  s.cash -= fee;
  r.access = true;
  return true;
}
export function tradeTreaty(s, id) {
  let r = s.late.regions.find((r) => r.id === id);
  let cost = 50000;
  if (!r || !r.access || r.treaty > 0 || s.cash < cost) return false;
  s.cash -= cost;
  r.treaty = 24;
  return true;
}
export function canStartMega(s, id) {
  ensureLate(s);
  let p = MEGAPROJECTS.find((x) => x.id === id);
  return (
    !!p &&
    !s.late.projects.some((x) => x.id === id) &&
    p.requires.every((t) => has(s, t)) &&
    p.industries.every((t) => s.businesses.some((b) => b.type === t)) &&
    s.late.projects.filter(
      (p) => p.status === "building" || p.status === "awaiting",
    ).length < 3
  );
}
export function megaStageCost(p, stage) {
  return p.cost * [0.15, 0.25, 0.35, 0.25][stage];
}
export function startMega(s, id) {
  let p = MEGAPROJECTS.find((x) => x.id === id);
  if (!canStartMega(s, id) || s.cash < megaStageCost(p, 0)) return false;
  let cost = megaStageCost(p, 0);
  s.cash -= cost;
  s.late.projects.push({
    id,
    stage: 0,
    remaining: Math.ceil(p.months / 4),
    status: "building",
    invested: cost,
  });
  return true;
}
export function fundMega(s, id) {
  let p = MEGAPROJECTS.find((x) => x.id === id),
    q = s.late.projects.find((x) => x.id === id);
  if (!p || !q || q.status !== "awaiting" || q.stage >= 3) return false;
  let next = q.stage + 1,
    cost = megaStageCost(p, next),
    materials = p.material / 3;
  if (s.cash < cost || s.empire.warehouse[1] + 1e-8 < materials) return false;
  const basis = warehouseValues(s);
  const materialCost = s.empire.warehouse[1]
    ? basis[1] * Math.min(1, materials / s.empire.warehouse[1])
    : 0;
  basis[1] = Math.max(0, basis[1] - materialCost);
  s.cash -= cost;
  s.empire.warehouse[1] = Math.max(0, s.empire.warehouse[1] - materials);
  q.stage = next;
  q.remaining = Math.ceil(p.months / 4);
  q.status = "building";
  q.invested += cost + materialCost;
  return true;
}
export function makeVentures(s) {
  return VENTURE_SECTORS.map((v, i) => ({
    ...v,
    id: `venture-${s.month}-${i}`,
    valuation: Math.round((50000 + rng(s) * 300000) / 1000) * 1000,
    minimum: 10000,
    window: s.month + 6,
  }));
}
export function investVenture(s, id, amount) {
  ensureLate(s);
  let v = s.late.ventureOffers.find((v) => v.id === id);
  if (
    !v ||
    !Number.isFinite(amount) ||
    amount < 10000 ||
    amount > v.valuation * 0.5 ||
    s.cash < amount
  )
    return false;
  s.cash -= amount;
  s.late.ventures.push({
    ...v,
    stake: amount / (v.valuation + amount),
    valuation: v.valuation + amount,
    invested: amount,
    age: 0,
    status: "active",
    runway: 12,
    round: 0,
  });
  s.late.ventureOffers = s.late.ventureOffers.filter((x) => x !== v);
  return true;
}
export function followVenture(s, id) {
  let v = s.late.ventures.find((x) => x.id === id),
    amount = v ? v.valuation * 0.08 : 0;
  if (!v || v.status !== "active" || s.cash < amount) return false;
  s.cash -= amount;
  v.stake = (v.stake * v.valuation + amount) / (v.valuation + amount);
  v.valuation += amount;
  v.invested += amount;
  v.runway += 8;
  v.round++;
  return true;
}
export function sellVenture(s, id) {
  let v = s.late.ventures.find((x) => x.id === id);
  if (!v || v.status !== "active") return false;
  let proceeds = v.valuation * v.stake * 0.8;
  s.cash += proceeds;
  v.status = "sold";
  v.realized = proceeds;
  return true;
}
export function bankEquity(b) {
  return b ? b.cash + b.loans - b.deposits : 0;
}
export function charterBank(s) {
  ensureLate(s);
  if (
    s.late.bank ||
    s.cash < 500000 ||
    s.month < 12 ||
    s.empire.corporate.rounds < 1
  )
    return false;
  s.cash -= 500000;
  s.late.bank = {
    cash: 500000,
    loans: 0,
    deposits: 0,
    depositRate: 0.025,
    loanRate: 0.095,
    underwriting: "balanced",
    reserve: 0.25,
    confidence: 75,
    profit: 0,
    defaults: 0,
    history: [],
    frozen: false,
  };
  return true;
}
export function capitalizeBank(s, amount) {
  let b = s.late.bank;
  if (!b || !Number.isFinite(amount) || amount <= 0 || s.cash < amount)
    return false;
  s.cash -= amount;
  b.cash += amount;
  if (bankEquity(b) > 0 && b.cash >= b.deposits * 0.1) b.frozen = false;
  return true;
}
export function withdrawBank(s, amount) {
  let b = s.late.bank;
  if (
    !b ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    bankEquity(b) - amount < Math.max(250000, b.loans * 0.12) ||
    b.cash - amount < b.deposits * b.reserve
  )
    return false;
  b.cash -= amount;
  s.cash += amount;
  return true;
}
export function setBankPolicy(
  s,
  { depositRate, loanRate, reserve, underwriting },
) {
  let b = s.late.bank;
  if (
    !b ||
    ![depositRate, loanRate, reserve].every(Number.isFinite) ||
    depositRate < 0 ||
    depositRate > 0.1 ||
    loanRate < 0.03 ||
    loanRate > 0.3 ||
    reserve < 0.1 ||
    reserve > 0.8 ||
    !["conservative", "balanced", "aggressive"].includes(underwriting)
  )
    return false;
  Object.assign(b, { depositRate, loanRate, reserve, underwriting });
  return true;
}
export function beforeLateMonth(s) {
  ensureLate(s);
  let l = s.late;
  l.monthIncome = 0;
  l.monthExpense = 0;
  for (let r of l.regions) {
    r.stability = Math.max(35, Math.min(95, r.stability + (rng(s) - 0.5) * 6));
    r.growth = Math.max(0.8, Math.min(1.5, r.growth + (rng(s) - 0.48) * 0.015));
    if (r.treaty > 0) r.treaty--;
    if (s.month % 6 === 0 && rng(s) < 0.35) {
      r.tariff = Math.max(0, Math.min(0.25, r.tariff + (rng(s) - 0.5) * 0.08));
      report(
        s,
        `${r.name} changed its import tariff to ${(r.tariff * 100).toFixed(1)}%.`,
      );
    }
  }
  let hqCost = (l.headquarters.level - 1) * 2500 + l.headquarters.budget;
  s.cash -= hqCost;
  s.empire.monthExpense += hqCost;
  l.monthExpense += hqCost;
  if (l.headquarters.policy === "people")
    for (let b of s.businesses) b.morale = Math.min(100, b.morale + 1.5);
  if (l.headquarters.budget > 0)
    for (let r of l.regions)
      if (r.access)
        r.stability = Math.min(95, r.stability + l.headquarters.budget / 50000);
  for (let q of l.projects) {
    let p = MEGAPROJECTS.find((x) => x.id === q.id);
    if (q.status === "building") {
      q.remaining--;
      if (q.remaining <= 0) {
        if (q.stage === 3) {
          q.status = "complete";
          report(
            s,
            `MEGAPROJECT COMPLETE: ${p.name}. New income and strategic bonuses are active.`,
          );
        } else {
          q.status = "awaiting";
          report(
            s,
            `${p.name}: stage ${q.stage + 1} complete. Fund the next stage to continue.`,
          );
        }
      }
    }
    if (q.status === "complete") {
      let net = p.income * s.economy;
      s.cash += net;
      s.empire.monthIncome += net;
      l.monthIncome += net;
    }
  }
  if (completed(s, "research") && s.month % 2 === 0)
    for (let p of s.empire.researchProjects) if (p.remaining > 1) p.remaining--;
  if (completed(s, "ocean")) {
    const retained = has(s, "coldchain") ? 0.995 : 0.98;
    const basis = warehouseValues(s);
    commerce(s).expense = Math.max(
      0,
      commerce(s).expense - basis[0] * (1 / retained - 1),
    );
    basis[0] /= retained;
    s.empire.warehouse[0] /= retained;
  }
  for (let v of l.ventures.filter((v) => v.status === "active")) {
    v.age++;
    v.runway--;
    let failure =
      v.risk * (v.runway <= 0 ? 2.5 : 0.5) * (s.economy < 0.95 ? 1.4 : 1);
    if (rng(s) < failure) {
      v.status = "failed";
      v.realized = 0;
      l.bankruptcies++;
      report(
        s,
        `${v.name} shut down. Your venture investment was written off.`,
      );
      continue;
    }
    v.valuation *= Math.max(
      0.6,
      1 + v.growth + (rng(s) - 0.5) * 0.3 + (s.economy - 1) * 0.3,
    );
    if (v.age >= 18 && rng(s) < 0.1) {
      let proceeds = v.valuation * v.stake;
      s.cash += proceeds;
      v.realized = proceeds;
      v.status = "exited";
      l.exits++;
      report(
        s,
        `${v.name} exited. Your stake returned $${Math.round(proceeds).toLocaleString()}.`,
      );
    } else if (v.runway <= 0 && rng(s) < 0.3) {
      v.stake *= 0.8;
      v.runway = 8;
      v.round++;
      report(
        s,
        `${v.name} raised outside capital. Your stake was diluted 20% without a follow-on.`,
      );
    }
  }
  if (s.month % 6 === 0) l.ventureOffers = makeVentures(s);
  let b = l.bank;
  if (b) {
    let beginning = bankEquity(b);
    let attracts = b.frozen
      ? 0
      : Math.max(0, (b.depositRate - 0.01) * 1000000) * (b.confidence / 75);
    let withdrawals = b.deposits * (b.confidence < 40 ? 0.12 : 0.012);
    let paid = Math.min(b.cash, withdrawals);
    b.cash += attracts - paid;
    b.deposits += attracts - paid;
    if (paid < withdrawals) {
      b.confidence = Math.max(0, b.confidence - 15);
      b.frozen = true;
    }
    let rate = { conservative: 0.0015, balanced: 0.004, aggressive: 0.009 }[
      b.underwriting
    ];
    let loss = b.loans * rate * (s.economy < 0.95 ? 1.6 : 1) * (0.5 + rng(s));
    b.loans -= loss;
    b.defaults += loss;
    let income =
        ((b.loans * b.loanRate) / 12) * (completed(s, "exchange") ? 1.1 : 1),
      expense = (b.deposits * b.depositRate) / 12 + 2500;
    b.cash += income - expense;
    let repayments = b.loans / 36;
    b.loans -= repayments;
    b.cash += repayments;
    if (!b.frozen) {
      let liquidity = Math.max(0, b.cash - b.deposits * b.reserve);
      let capitalRoom = Math.max(0, bankEquity(b) / 0.12 - b.loans);
      let loanDemand =
        60000 * Math.max(0.2, 1 - (b.loanRate - 0.06) * 4) * s.economy;
      let newLoans = Math.min(liquidity, capitalRoom, loanDemand);
      b.cash -= newLoans;
      b.loans += newLoans;
    }
    if (b.cash < 0) {
      b.deposits -= b.cash;
      b.cash = 0;
      b.frozen = true;
    }
    b.profit = bankEquity(b) - beginning;
    b.confidence = Math.max(
      0,
      Math.min(100, b.confidence + (b.profit > 0 ? 1 : -1)),
    );
    if (bankEquity(b) < 0) b.frozen = true;
    if (b.profit >= 0) s.empire.monthIncome += b.profit;
    else s.empire.monthExpense -= b.profit;
    b.history.push({
      month: s.month,
      equity: bankEquity(b),
      loans: b.loans,
      deposits: b.deposits,
      profit: b.profit,
    });
    b.history = b.history.slice(-36);
  }
  if (s.month % 12 === 0 && s.world.rivals.length < 40) {
    let t = TYPES[Math.floor(rng(s) * TYPES.length)],
      c = CITIES[Math.floor(rng(s) * CITIES.length)];
    s.world.rivals.push({
      id: `entrant-${s.month}`,
      name: "New Horizon " + t.sector,
      type: t.id,
      city: c.id,
      power: 0.7,
      price: t.price * 0.9,
      reputation: 60,
      value: t.cost * 1.8,
    });
    report(s, `A new competitor entered ${c.name}: ${t.sector}.`);
  }
  l.archive.unshift({
    month: s.month,
    activeCompanies: s.businesses.length,
    employees: s.businesses.reduce((n, b) => n + b.staff, 0),
    projects: l.projects.filter((p) => p.status === "complete").length,
  });
  l.archive = l.archive.slice(0, 120);
}
export function lateAssets(s) {
  if (!s.late) return 0;
  let l = s.late;
  return (
    l.projects.reduce((n, p) => n + p.invested * 0.7, 0) +
    l.ventures
      .filter((v) => v.status === "active")
      .reduce((n, v) => n + v.valuation * v.stake * 0.8, 0) +
    bankEquity(l.bank) +
    (l.headquarters.level - 1) * 50000
  );
}
export function prestigeEarned(s, groupWorth) {
  let l = s.late;
  return (
    Math.max(
      0,
      Math.floor(
        Math.log10(
          Math.max(1, groupWorth / Math.max(25000, s.startCapital || 25000)),
        ) * 10,
      ),
    ) +
    l.projects.filter((p) => p.status === "complete").length * 8 +
    l.exits * 2 +
    Math.floor(s.month / 24) +
    (completed(s, "legacy") ? 50 : 0)
  );
}
export function dynastyUpgrade(s, id) {
  let u = DYNASTY_UPGRADES.find((x) => x.id === id),
    d = s.late.dynasty;
  if (!u || d.upgrades.includes(id) || d.prestige < u.cost) return false;
  d.prestige -= u.cost;
  d.upgrades.push(id);
  return true;
}
export function upgradeHQ(s) {
  let h = s.late.headquarters,
    cost = h.level * 100000;
  if (h.level >= 10 || s.cash < cost) return false;
  s.cash -= cost;
  h.level++;
  return true;
}
