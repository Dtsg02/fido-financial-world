import { consumeStock } from "./inventory.js?v=830bc158a7cf";
import { TYPES } from "./catalog.js?v=830bc158a7cf";
// Every industry uses one operating model, with persistent state and explicit tradeoffs.
export const MODELS = {
  subscription: {
    name: "Subscription network",
    types: ["software", "telecom", "gaming", "datacenter"],
    metric: "Active subscribers",
    desc: "Recurring customers survive between months. Unserved subscribers churn; support and reliability protect retention.",
    policies: ["Acquire rapidly", "Balanced growth", "Retention first"],
  },
  hospitality: {
    name: "Reservations & service",
    types: ["hotel", "restaurant", "coffee"],
    metric: "Guest satisfaction",
    desc: "Service quality builds repeat visits. Overcrowding damages satisfaction; premium service uses more capacity per guest.",
    policies: ["High throughput", "Balanced service", "Concierge service"],
  },
  production: {
    name: "Industrial production",
    types: ["factory", "semiconductor", "recycling"],
    metric: "Equipment condition",
    desc: "Running equipment wears it down. Defects consume materials without producing sellable output. Maintenance trades current throughput for future yield.",
    policies: [
      "Maximum output",
      "Balanced production",
      "Preventive maintenance",
    ],
  },
  agriculture: {
    name: "Crop cycles",
    types: ["farm"],
    metric: "Soil fertility",
    desc: "A three-month planting cycle concentrates output in harvest months. Intensive farming depletes soil; regeneration sacrifices output to restore it.",
    policies: ["Intensive crop", "Crop rotation", "Regenerative farming"],
  },
  professional: {
    name: "Client delivery",
    types: ["studio", "consultancy", "construction"],
    metric: "Client trust",
    desc: "Delivery quality builds referrals. Excess bookings create service failures; specialist work improves trust but consumes more delivery capacity.",
    policies: ["Volume contracts", "Balanced delivery", "Specialist practice"],
  },
  regulated: {
    name: "Regulated services",
    types: ["clinic", "biotech", "security", "education"],
    metric: "Accreditation",
    desc: "Accreditation earns demand. Low standards raise incident risk; certification programs lower risk and improve reputation at a recurring cost.",
    policies: ["Rapid expansion", "Standard assurance", "Rigorous assurance"],
  },
  infrastructure: {
    name: "Infrastructure network",
    types: ["energy", "water", "logistics"],
    metric: "Network reliability",
    desc: "Overloading the network increases throughput and wear. Reliability determines delivered capacity; resilience investment protects against outages.",
    policies: ["Peak utilization", "Balanced network", "Resilient network"],
  },
  retail: {
    name: "Retail & audience",
    types: ["shop", "bakery", "media"],
    metric: "Audience loyalty",
    desc: "Promotions lift demand but weaken loyalty. Curated offerings build repeat visits. Food inventory spoils; stale products lose appeal.",
    policies: ["Mass promotions", "Balanced assortment", "Curated experience"],
  },
};
export const PRODUCT_TIERS = [
  {
    name: "Everyday",
    cost: 0.08,
    months: 2,
    demand: 0.13,
    margin: 0.015,
    upkeep: 0.001,
    desc: "Fast, affordable launch; broad appeal.",
  },
  {
    name: "Signature",
    cost: 0.22,
    months: 4,
    demand: 0.19,
    margin: 0.045,
    upkeep: 0.002,
    desc: "More development, stronger pricing power.",
  },
  {
    name: "Flagship",
    cost: 0.55,
    months: 7,
    demand: 0.24,
    margin: 0.09,
    upkeep: 0.004,
    desc: "Long development and expensive support; needs a level-3 business.",
  },
];
export const SEGMENTS = ["Value seekers", "Mainstream", "Premium buyers"];
export function model(b) {
  return (
    Object.values(MODELS).find((x) => x.types.includes(b.type)) || MODELS.retail
  );
}
export function sectorState(b) {
  b.sectorState ??= {
    policy: 1,
    score: 75,
    customers: 0,
    churn: 0,
    development: [],
    nextId: 1,
    upgrades: { process: 0, service: 0, resilience: 0 },
    history: [],
    incident: "No sector incidents yet.",
    spoiled: 0,
    pricePressure: 1,
  };
  return b.sectorState;
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function launchProduct(s, b, name, tier, segment) {
  const q = sectorState(b),
    t = TYPES.find((t) => t.id === b.type),
    p = PRODUCT_TIERS[tier];
  if (
    !p ||
    !Number.isInteger(segment) ||
    segment < 0 ||
    segment > 2 ||
    q.development.length >= 8 ||
    q.development.filter((x) => x.status === "development").length >= 2 ||
    (tier === 2 && b.level < 3)
  )
    return false;
  const cost = t.cost * p.cost * (1 + q.development.length * 0.1);
  if (s.cash < cost) return false;
  s.cash -= cost;
  q.development.push({
    id: q.nextId++,
    name: String(name || p.name + " " + (q.nextId - 1))
      .trim()
      .slice(0, 60),
    tier,
    segment,
    status: "development",
    remaining: p.months,
    age: 0,
    appeal: 1,
    invested: cost,
  });
  return true;
}
export function refreshProduct(s, b, id) {
  const q = sectorState(b),
    p = q.development.find((x) => x.id === id);
  if (!p || p.status !== "active" || p.age < 6) return false;
  const cost = p.invested * 0.35;
  if (s.cash < cost) return false;
  s.cash -= cost;
  p.age = 0;
  p.appeal = 1;
  return true;
}
export function retireProduct(b, id) {
  const q = sectorState(b),
    p = q.development.find((x) => x.id === id);
  if (!p) return false;
  q.development = q.development.filter((x) => x.id !== id);
  return true;
}
export function upgradeSector(s, b, key) {
  const q = sectorState(b);
  if (!Object.hasOwn(q.upgrades, key) || q.upgrades[key] >= 5) return false;
  const cost =
    TYPES.find((t) => t.id === b.type).cost *
    0.18 *
    (q.upgrades[key] + 1) ** 1.65;
  if (s.cash < cost) return false;
  s.cash -= cost;
  q.upgrades[key]++;
  return true;
}
export function productEffects(b) {
  const q = sectorState(b),
    active = q.development.filter((p) => p.status === "active");
  let demand = 1,
    price = 1,
    upkeep = 0;
  for (const p of active) {
    const t = PRODUCT_TIERS[p.tier],
      crowd = active.filter((x) => x.segment === p.segment).length;
    demand += (t.demand * p.appeal) / Math.sqrt(crowd);
    price += (t.margin * p.appeal) / (1 + 0.3 * (crowd - 1));
    upkeep += TYPES.find((t) => t.id === b.type).cost * t.upkeep;
  }
  return { demand, price, upkeep };
}
export function sectorEffects(s, b) {
  const q = sectorState(b),
    m = model(b),
    p = q.policy,
    e = productEffects(b),
    u = q.upgrades;
  let capacity = 1 + u.process * 0.045,
    demand = e.demand,
    unit = 1,
    overhead = e.upkeep;
  const t = TYPES.find((t) => t.id === b.type);
  overhead += t.cost * (u.service * 0.001 + u.resilience * 0.0008);
  if (m === MODELS.subscription) {
    demand *= [1.2, 1, 0.88][p];
    overhead += t.cost * [0.002, 0.003, 0.006][p];
  }
  if (m === MODELS.hospitality) {
    capacity *= [1.18, 1, 0.82][p];
    demand *= 0.65 + q.score / 160;
    unit *= [0.95, 1, 1.15][p];
  }
  if (m === MODELS.production) {
    capacity *= [1.22, 1, 0.86][p] * (0.55 + q.score / 200);
    unit *= 1 + (100 - q.score) / 180;
  }
  if (m === MODELS.agriculture) {
    capacity *=
      (s.month % 3 === 0 ? 2.2 : 0.55) *
      [1.2, 1, 0.8][p] *
      (0.5 + q.score / 150);
    unit *= [1.08, 1, 0.92][p];
  }
  if (m === MODELS.professional) {
    capacity *= [1.2, 1, 0.8][p];
    demand *= 0.6 + q.score / 150;
  }
  if (m === MODELS.regulated) {
    demand *= 0.65 + q.score / 160;
    overhead += t.cost * [0, 0.003, 0.008][p];
    capacity *= [1.15, 1, 0.9][p];
  }
  if (m === MODELS.infrastructure) {
    capacity *= [1.25, 1, 0.9][p] * (0.6 + q.score / 200);
    overhead += t.cost * [0, 0.002, 0.005][p];
  }
  if (m === MODELS.retail) {
    demand *= [1.2, 1, 0.9][p] * (0.75 + q.score / 250);
    unit *= [1.05, 1, 1.08][p];
  }
  demand *= q.pricePressure;
  return { capacity, demand, unit, overhead, price: e.price };
}
export function sectorDemand(b, demand) {
  const q = sectorState(b);
  if (model(b) !== MODELS.subscription) return demand;
  // Subscribers are billed only when served; new cohorts enter gradually.
  return Math.floor(q.customers * (1 - q.churn) + demand * 0.28);
}
export function beforeSectorMonth(s, random) {
  for (const b of s.businesses) {
    const q = sectorState(b),
      m = model(b),
      t = TYPES.find((t) => t.id === b.type);
    for (const p of q.development) {
      if (p.status === "development") {
        p.remaining--;
        if (p.remaining <= 0) {
          p.status = "active";
          p.age = 0;
          p.appeal = 1;
        }
      } else {
        p.age++;
        p.appeal = Math.max(0.18, 1 - Math.max(0, p.age - 12) * 0.025);
      }
    }
    const rival = s.world.rivals.filter(
      (r) => r.type === b.type && r.city === b.city,
    );
    q.pricePressure = 1;
    for (const r of rival) {
      if (b.price < t.price * 0.85) {
        r.price = Math.max(t.price * 0.55, r.price * 0.98);
        r.power = clamp(r.power + 0.015, 0.5, 2.5);
      } else if (b.lastProfit > t.cost * 0.035) {
        r.power = clamp(r.power + 0.025, 0.5, 2.5);
      }
      q.pricePressure *= clamp(
        0.95 + (r.price / b.price - 1) * 0.08,
        0.85,
        1.04,
      );
    }
    q.pricePressure = clamp(q.pricePressure, 0.65, 1.12);
    q.incident = "Operations stable.";
    const chance = Math.max(
      0.005,
      (100 - q.score) / 650 - q.upgrades.resilience * 0.008,
    );
    if (
      [MODELS.production, MODELS.regulated, MODELS.infrastructure].includes(
        m,
      ) &&
      random(s) < chance
    ) {
      b.incidentFactor = Math.min(
        b.incidentFactor || 1,
        0.65 + q.upgrades.resilience * 0.04,
      );
      b.reputation = Math.max(30, b.reputation - 3);
      q.incident =
        m === MODELS.regulated
          ? "Standards review: capacity reduced this month."
          : "Equipment outage: capacity reduced this month.";
    }
    q.spoiled = 0;
    if (["farm", "bakery", "restaurant", "coffee"].includes(b.type)) {
      q.spoiled = Math.floor(
        b.inventory * Math.max(0.02, 0.14 - q.upgrades.resilience * 0.02),
      );
      b.stockWriteoff = (b.stockWriteoff || 0) + consumeStock(b, q.spoiled);
    }
  }
}
export function afterSectorBusiness(s, b, demand, sold) {
  const q = sectorState(b),
    m = model(b),
    fill = demand ? Math.min(1, sold / demand) : 1;
  const service = q.upgrades.service * 0.35;
  let change = [-2, 0.3, 2][q.policy] + service;
  if ([MODELS.hospitality, MODELS.professional, MODELS.retail].includes(m))
    change += (fill - 0.9) * 8 + (b.quality - 1) * 0.35;
  if (m === MODELS.production || m === MODELS.infrastructure)
    change += q.upgrades.resilience * 0.3 - 0.4;
  q.score = clamp(q.score + change, 15, 100);
  if (m === MODELS.subscription) {
    q.churn = clamp(
      [0.11, 0.065, 0.03][q.policy] +
        (1 - fill) * 0.3 -
        (q.score - 75) * 0.0004 -
        q.upgrades.service * 0.004,
      0.01,
      0.5,
    );
    q.customers = sold;
  }
  q.history.push({
    month: s.month,
    score: q.score,
    customers: q.customers,
    churn: q.churn,
    sold,
  });
  q.history = q.history.slice(-24);
}
