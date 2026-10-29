import { taxClose, taxLiability } from "./tax.js?v=14dae22974bb";
import { purchasePlan, closeAccounts } from "./accounts.js?v=14dae22974bb";
import {
  stockValue,
  receiveStock,
  consumeStock,
  warehouseValues,
} from "./inventory.js?v=14dae22974bb";
import { bondDebt, bondMarket, beforeBondMonth } from "./bonds.js?v=14dae22974bb";
import {
  generateDecision,
  beforeDecisionMonth,
  decisionModifiers,
  resolveDecision,
} from "./decisions.js?v=14dae22974bb";
import {
  facility,
  facilityAssets,
  facilityLimits,
  facilityOverhead,
  beforeFacilityMonth,
  enforceStorage,
} from "./facilities.js?v=14dae22974bb";
import {
  commerce,
  commercialAssets,
  beginCommerceMonth,
  beforeCommerceMonth,
  procureSupply,
  routeProduction,
} from "./commerce.js?v=14dae22974bb";
import {
  sectorEffects,
  sectorDemand,
  beforeSectorMonth,
  afterSectorBusiness,
} from "./sectors.js?v=14dae22974bb";
import { validateAdvanced } from "./advanced-validation.js?v=14dae22974bb";
import {
  ensureLate,
  internationalDemand,
  internationalMaterial,
  adminMultiplier,
  fxFactor,
  beforeLateMonth,
  lateAssets,
  completed,
} from "./late.js?v=14dae22974bb";
import {
  ensureEmpire,
  customerMultiplier,
  deepMaterial,
  deepCapacity,
  beforeEmpireMonth,
  afterEmpireMonth,
  warehouseProduction,
  additionalAssets,
  propertyIncome,
  bonus,
  has,
} from "./empire.js?v=14dae22974bb";
import { validateExtra } from "./validation.js?v=14dae22974bb";
import {
  ensureWorld,
  initBusiness,
  city,
  productivity,
  demandFactor,
  materialFactor,
  companyOverhead,
  beforeMonth,
  afterMonth,
  fulfill,
} from "./world.js?v=14dae22974bb";
import { TYPES } from "./catalog.js?v=14dae22974bb";
export { TYPES };
export const ASSETS = [
  { ticker: "WRLD", name: "World index", price: 100, vol: 0.055, div: 0.002 },
  { ticker: "NOVA", name: "Nova Technologies", price: 84, vol: 0.18, div: 0 },
  { ticker: "ROOT", name: "Root Consumer", price: 46, vol: 0.08, div: 0.004 },
  { ticker: "VOLT", name: "Volt Energy", price: 125, vol: 0.12, div: 0.002 },
  { ticker: "BOND", name: "Treasury fund", price: 100, vol: 0.012, div: 0.003 },
];
export const PROPERTIES = [
  { name: "Corner apartment", cost: 90000, rent: 850, upkeep: 180 },
  { name: "High street retail", cost: 210000, rent: 2400, upkeep: 600 },
  { name: "Logistics warehouse", cost: 480000, rent: 5200, upkeep: 1100 },
];
export const TECH = [
  {
    id: "ops",
    name: "Lean operations",
    desc: "Reduce material costs 7% per level.",
    base: 7000,
  },
  {
    id: "brand",
    name: "Brand equity",
    desc: "Increase demand 10% per level.",
    base: 9000,
  },
  {
    id: "automation",
    name: "Smart automation",
    desc: "Increase employee capacity 15% per level.",
    base: 14000,
  },
];
export function fresh() {
  return {
    version: 1,
    month: 0,
    cash: 25000,
    debt: 0,
    businesses: [],
    holdings: {},
    properties: [],
    tech: { ops: 0, brand: 0, automation: 0 },
    prices: ASSETS.map((a) => a.price),
    marketHistory: ASSETS.map((a) => [a.price]),
    history: [{ month: 0, worth: 25000, cash: 25000, profit: 0 }],
    ledger: [],
    news: [
      {
        title: "A new chapter starts here",
        text: "You have $25,000, a clean slate, and a world of possibilities.",
        month: 0,
      },
    ],
    economy: 1,
    inflation: 1,
    rate: 0.08,
    profit: 0,
    revenue: 0,
    event: null,
    achievements: [],
    seed: Math.floor(Math.random() * 2147483646) + 1,
    loanAge: 0,
  };
}
export function rand(s) {
  s.seed = (s.seed * 16807) % 2147483647;
  return (s.seed - 1) / 2147483646;
}
export function type(b) {
  return TYPES.find((t) => t.id === b.type);
}
export function worth(s) {
  return (
    s.cash -
    s.debt -
    bondDebt(s) -
    taxLiability(s) +
    additionalAssets(s) +
    lateAssets(s) +
    commercialAssets(s) +
    s.businesses.reduce(
      (v, b) =>
        v + type(b).cost * b.level * 0.75 + stockValue(b) + facilityAssets(b),
      0,
    ) +
    (s.world?.receivables || []).reduce((n, r) => n + r.amount, 0) +
    (s.world?.contracts || [])
      .filter((c) => c.status === "active")
      .reduce((n, c) => n + c.deposit, 0) +
    s.prices.reduce((v, p, i) => v + p * (s.holdings[i] || 0), 0) +
    s.properties.reduce(
      (v, p) =>
        v +
        PROPERTIES[p.kind].cost * p.factor * (1 + ((p.level || 1) - 1) * 0.15),
      0,
    )
  );
}
export function log(s, text, amount = 0) {
  s.ledger.unshift({ month: s.month, text, amount });
  s.ledger = s.ledger.slice(0, 160);
}
export function start(s, id, name) {
  let t = TYPES.find((t) => t.id === id);
  if (!t || s.cash < t.cost) return false;
  s.cash -= t.cost;
  s.businesses.push(
    initBusiness({
      id: Date.now() + Math.floor(rand(s) * 100000),
      type: id,
      name: name || t.name,
      level: 1,
      staff: 1,
      price: t.price,
      marketing: 0,
      inventory: 0,
      auto: true,
      quality: 1,
      reputation: 65,
      lastRevenue: 0,
      lastProfit: 0,
      sold: 0,
      lost: 0,
    }),
  );
  log(s, "Founded " + (name || t.name), -t.cost);
  return true;
}
export function transact(s, index, qty) {
  if (!Number.isInteger(qty) || !qty) return false;
  let cost = s.prices[index] * qty;
  if (
    (qty > 0 && cost > s.cash) ||
    (qty < 0 && (s.holdings[index] || 0) < -qty)
  )
    return false;
  s.cash -= cost;
  s.holdings[index] = (s.holdings[index] || 0) + qty;
  log(
    s,
    (qty > 0 ? "Bought " : "Sold ") +
      Math.abs(qty) +
      " " +
      ASSETS[index].ticker,
    -cost,
  );
  return true;
}
export function forecast(s, b) {
  ensureLate(s);
  initBusiness(b);
  let t = type(b),
    c = city(b);
  const sector = sectorEffects(s, b);
  const decision = decisionModifiers(s, b);
  let capacity = Math.floor(
    t.capacity *
      b.staff *
      (1 + 0.15 * s.tech.automation) *
      productivity(b) *
      deepCapacity(s) *
      adminMultiplier(s) *
      sector.capacity *
      decision.capacity,
  );
  const facilityPlan = facilityLimits(b, capacity);
  capacity = facilityPlan.capacity;
  let demand = Math.floor(
    t.demand *
      s.economy *
      (1 + 0.1 * s.tech.brand) *
      (b.reputation / 65) *
      Math.pow(
        (t.price * (1 + b.products * 0.05)) / b.price,
        has(s, "pricing") ? 1.36 : 1.6,
      ) *
      (1 + Math.sqrt(b.marketing / 1000) * 0.3) *
      (1 + (b.quality - 1) * 0.13) *
      demandFactor(s, b) *
      customerMultiplier(s, b) *
      internationalDemand(s, b) *
      sector.demand *
      decision.demand,
  );
  demand = sectorDemand(b, demand);
  let units = Math.min(capacity, demand);
  let unit =
    t.unit *
    s.inflation *
    (1 - 0.07 * s.tech.ops) *
    (1 + (b.quality - 1) * 0.15) *
    materialFactor(s, b) *
    deepMaterial(s, b) *
    internationalMaterial(s, b) *
    sector.unit;
  const salePrice = b.price * sector.price;
  let revenue = units * salePrice;
  let overhead =
    b.staff * t.wage * s.inflation * c.wages * b.salary * fxFactor(s, b) +
    t.rent * b.level * s.inflation * c.rent * fxFactor(s, b) +
    facilityOverhead(s, b) +
    sector.overhead +
    b.marketing +
    companyOverhead(s, b) +
    b.compliance +
    b.brandInvestment -
    (completed(s, "ocean") ? s.world.policy.carbon * 0.5 : 0);
  let expense = units * unit + overhead;
  return {
    facilityPlan,
    salePrice,
    capacity,
    demand,
    units,
    unit,
    revenue,
    expense,
    overhead,
    profit: revenue - expense,
  };
}
export function advance(s) {
  const openingCash = s.cash;
  for (const b of s.businesses) {
    stockValue(b);
    b.stockWriteoff = 0;
  }
  ensureLate(s);
  warehouseValues(s);
  s.month++;
  s.loanAge++;
  let cycle = Math.sin(s.month / 7) * 0.12;
  s.economy = Math.max(0.65, Math.min(1.4, 1 + cycle + (rand(s) - 0.5) * 0.12));
  s.inflation *= 1.002;
  s.rate = Math.max(0.04, Math.min(0.14, 0.08 + (s.economy - 1) * 0.1));
  beginCommerceMonth(s);
  beforeMonth(s);
  beforeCommerceMonth(s);
  beforeBondMonth(s, worth(s));
  beforeEmpireMonth(s);
  beforeLateMonth(s);
  beforeSectorMonth(s, rand);
  beforeFacilityMonth(s, rand);
  beforeDecisionMonth(s, rand);
  let revenue = 0,
    operating = 0;
  let details = [];
  for (let b of s.businesses) {
    let t = type(b),
      f = forecast(s, b);
    let demand = Math.max(0, Math.floor(f.demand * (0.85 + rand(s) * 0.3)));
    let capacity = Math.floor(f.capacity * (b.incidentFactor || 1));
    let contractNeed = s.world.contracts
      .filter((c) => c.businessId === b.id && c.status === "active")
      .reduce((n, c) => n + c.units - c.delivered, 0);
    const routeNeed =
      commerce(s).routes.find((r) => r.from === b.id && r.enabled)?.units || 0;
    let target = Math.min(demand + contractNeed + routeNeed, capacity);
    const agreement = procureSupply(s, b, f.unit, rand);
    if (b.auto && agreement.fallback) {
      let buy = Math.max(0, target - b.inventory);
      let warehouse = warehouseProduction(s, b, buy, f.unit);
      receiveStock(b, warehouse.units, warehouse.cost);
      buy -= warehouse.units;
      if (b.warehouse && !b.warehouseFallback) buy = 0;
      buy =
        b.warehouse && !b.warehouseFallback
          ? 0
          : purchasePlan(s, b, target, f.unit, f.facilityPlan.storage);
      buy = Math.floor(buy * (b.supplyFactor || 1));
      s.cash -= buy * f.unit;
      receiveStock(b, buy, buy * f.unit);
    }
    b.stockWriteoff += enforceStorage(b, f.unit);
    let contract = fulfill(s, b, capacity);
    const routed = routeProduction(
      s,
      b,
      Math.max(0, capacity - contract.units),
      f.unit,
    );
    let sold = Math.min(
      demand,
      Math.max(0, capacity - contract.units - routed),
      b.inventory,
    );
    const costOfSales = consumeStock(b, sold) + contract.cost;
    facility(b).lastUtilization = capacity
      ? Math.min(1, (sold + contract.units + routed) / capacity)
      : 0;
    let sales = sold * f.salePrice + contract.revenue;
    let overhead = f.overhead;
    let subsidy = b.type === "energy" ? s.world.policy.subsidy * b.level : 0;
    let profit = sales - costOfSales - b.stockWriteoff - overhead + subsidy;
    b.lastAccounts = {
      month: s.month,
      revenue: sales,
      costOfSales,
      overhead,
      subsidy,
      writeoffs: b.stockWriteoff,
      gross: sales - costOfSales,
      profit,
      inventory: stockValue(b),
    };
    s.cash += sold * f.salePrice - overhead + subsidy;
    b.lastRevenue = sales;
    b.lastProfit = profit;
    b.sold = sold;
    b.lost = Math.max(0, demand - sold);
    b.reputation = Math.max(
      30,
      Math.min(
        100,
        b.reputation + (sold >= demand ? 2 : -1) + (b.quality - 1) * 0.5,
      ),
    );
    afterSectorBusiness(s, b, demand, sold);
    revenue += sales;
    operating += profit;
    details.push(b.name + ": " + Math.round(profit));
  }
  operating -= commerce(s).expense + bondMarket(s).expense;
  let dividend = 0;
  s.prices = s.prices.map((p, i) => {
    let a = ASSETS[i];
    dividend += p * (s.holdings[i] || 0) * a.div;
    let next = Math.max(
      1,
      p * (1 + 0.004 + (s.economy - 1) * 0.1 + (rand(s) - 0.5) * a.vol * 2),
    );
    s.marketHistory[i].push(next);
    s.marketHistory[i] = s.marketHistory[i].slice(-24);
    return next;
  });
  let rent = 0;
  for (let p of s.properties) {
    let t = PROPERTIES[p.kind];
    p.factor *= 1.002 + (rand(s) - 0.5) * 0.01;
    let propertyResult = propertyIncome(s, p, t);
    rent +=
      propertyResult.net +
      (completed(s, "city") ? propertyResult.gross * 0.2 : 0);
  }
  afterMonth(s);
  let termDebt = s.world.bonds.reduce((n, b) => n + b.balance, 0);
  let interest =
    ((Math.max(0, s.debt - termDebt) * s.rate) / 12) *
      (1 - bonus(s, "cfo") * 0.2) *
      (completed(s, "exchange") ? 0.9 : 1) +
    s.world.monthCosts +
    s.empire.monthExpense;
  const taxResult = taxClose(
    s,
    operating + s.empire.monthIncome + dividend + rent - interest,
  );
  let tax = taxResult.provision;
  let living = 650 * s.inflation;
  let passive = dividend + rent - interest - tax - living;
  s.cash +=
    passive + s.world.monthCosts + s.empire.monthExpense + tax - taxResult.paid;
  s.profit = operating + s.empire.monthIncome + passive;
  s.revenue = revenue + dividend + Math.max(0, rent);
  s.lastCosts = {
    operating,
    revenue,
    dividend,
    rent,
    interest,
    tax,
    living,
    corporate: s.empire.monthIncome,
  };
  let beforeCosts = s.empire.monthExpense;
  afterEmpireMonth(s);
  s.profit -= s.empire.monthExpense - beforeCosts;
  log(s, "Month closed: operating profit", operating);
  if (commerce(s).expense)
    log(s, "Trade credit losses and financing charges", -commerce(s).expense);
  log(s, "Portfolio income and rent", dividend + rent);
  log(s, "Tax, interest and living costs", -interest - tax - living);
  if (s.cash < 0) {
    let needed = -s.cash + 1000;
    s.debt += needed;
    s.cash += needed;
    log(s, "Emergency credit (liquidity rescue)", needed);
    s.news.unshift({
      title: "Emergency credit activated",
      text: "A cash shortfall triggered a loan. Reduce expenses or sell assets before advancing again.",
      month: s.month,
    });
  }
  let headlines =
    s.economy > 1.07
      ? [
          "Consumer confidence is climbing",
          "More customers are spending. A good moment to test your capacity.",
        ]
      : s.economy < 0.94
        ? [
            "Households tighten their budgets",
            "Demand is softening. Healthy cash reserves matter more than ever.",
          ]
        : [
            "Markets find their rhythm",
            "The economy is stable. Build carefully and keep an eye on your margins.",
          ];
  s.news.unshift({ title: headlines[0], text: headlines[1], month: s.month });
  s.news = s.news.slice(0, 15);
  if (s.month % 3 === 0) {
    let events = [
      {
        title: "A local festival is coming",
        text: "Sponsor the event for $1,500 to gain 12 reputation at every business.",
        cost: 1500,
        kind: "festival",
      },
      {
        title: "An equipment auction",
        text: "Buy a training package for $2,000. Every business gains one quality level, up to level 3.",
        cost: 2000,
        kind: "training",
      },
      {
        title: "A surprise maintenance bill",
        text: "Pay $900 for preventive repairs or lose 8 reputation at every business.",
        cost: 900,
        kind: "repair",
      },
    ];
    if (!s.event)
      s.event =
        generateDecision(s, rand) ||
        events[Math.floor(rand(s) * events.length)];
  }
  let checks = [
    ["founder", s.businesses.length >= 1],
    ["diversified", s.businesses.length >= 3],
    ["investor", Object.values(s.holdings).some((v) => v > 0)],
    ["landlord", s.properties.length > 0],
    ["sixfigures", worth(s) >= 100000],
    ["millionaire", worth(s) >= 1000000],
    ["year", s.month >= 12],
    ["profit", s.profit >= 10000],
    ["researcher", Object.values(s.tech).some((v) => v >= 3)],
  ];
  for (let [id, ok] of checks)
    if (ok && !s.achievements.includes(id)) s.achievements.push(id);
  s.history.push({
    month: s.month,
    worth: worth(s),
    cash: s.cash,
    profit: s.profit,
  });
  s.history = s.history.slice(-60);
  closeAccounts(s, openingCash);
  return details;
}
export function resolve(s, accept) {
  let e = s.event;
  if (!e) return false;
  if (e.kind === "decision") return resolveDecision(s, accept ? 0 : 2, rand);
  if (accept && s.cash < e.cost) return false;
  if (accept) {
    s.cash -= e.cost;
    log(s, e.title, -e.cost);
    for (let b of s.businesses) {
      if (e.kind === "festival")
        b.reputation = Math.min(100, b.reputation + 12);
      if (e.kind === "training") b.quality = Math.min(3, b.quality + 1);
    }
  } else if (e.kind === "repair")
    for (let b of s.businesses) b.reputation = Math.max(30, b.reputation - 8);
  s.event = null;
  return true;
}
export function valid(s) {
  try {
    return !!(
      s &&
      validateExtra(s) &&
      validateAdvanced(s) &&
      s.version === 1 &&
      Number.isInteger(s.month) &&
      s.month >= 0 &&
      Number.isFinite(s.cash) &&
      s.cash >= 0 &&
      Number.isFinite(s.debt) &&
      s.debt >= 0 &&
      Array.isArray(s.businesses) &&
      s.businesses.every(
        (b) =>
          TYPES.some((t) => t.id === b.type) &&
          Number.isFinite(b.price) &&
          b.price > 0 &&
          Number.isInteger(b.staff) &&
          b.staff > 0 &&
          b.staff <= b.level * 5 &&
          Number.isFinite(b.inventory) &&
          b.inventory >= 0 &&
          (b.inventoryCost === undefined ||
            (Number.isFinite(b.inventoryCost) &&
              b.inventoryCost >= 0 &&
              (b.inventory > 0 || b.inventoryCost === 0))),
      ) &&
      Array.isArray(s.prices) &&
      s.prices.length === 5 &&
      s.prices.every((p) => Number.isFinite(p) && p > 0) &&
      Array.isArray(s.properties) &&
      s.properties.every(
        (p) => PROPERTIES[p.kind] && Number.isFinite(p.factor) && p.factor > 0,
      ) &&
      s.tech &&
      TECH.every(
        (t) =>
          Number.isInteger(s.tech[t.id]) &&
          s.tech[t.id] >= 0 &&
          s.tech[t.id] <= 5,
      ) &&
      s.holdings &&
      Object.entries(s.holdings).every(
        ([i, n]) => ASSETS[i] && Number.isInteger(n) && n >= 0,
      ) &&
      Array.isArray(s.history) &&
      Array.isArray(s.ledger) &&
      Array.isArray(s.news) &&
      Array.isArray(s.achievements) &&
      Array.isArray(s.marketHistory) &&
      s.marketHistory.length === 5 &&
      s.marketHistory.every(
        (a) => Array.isArray(a) && a.every(Number.isFinite),
      ) &&
      Number.isFinite(s.seed) &&
      Number.isFinite(s.economy) &&
      s.economy > 0 &&
      Number.isFinite(s.inflation) &&
      s.inflation > 0 &&
      Number.isFinite(s.rate) &&
      Number.isFinite(s.profit) &&
      Number.isFinite(s.revenue)
    );
  } catch {
    return false;
  }
}
