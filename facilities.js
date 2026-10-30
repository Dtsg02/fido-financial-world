import { consumeStock } from "./inventory.js?v=8218e214890d";
import { TYPES } from "./catalog.js?v=8218e214890d";
export const FACILITY_MODULES = [
  {
    id: "equipment",
    name: "Production equipment",
    desc: "+30% equipment throughput per level.",
    cost: 0.22,
    months: 3,
  },
  {
    id: "utilities",
    name: "Utility connection",
    desc: "+30% power/service capacity per level.",
    cost: 0.16,
    months: 4,
  },
  {
    id: "storage",
    name: "Storage & handling",
    desc: "+50% inventory capacity per level.",
    cost: 0.12,
    months: 2,
  },
  {
    id: "backup",
    name: "Backup infrastructure",
    desc: "Reduces outage likelihood and severity.",
    cost: 0.18,
    months: 3,
  },
];
const type = (b) => TYPES.find((t) => t.id === b.type);
export function facility(b) {
  return (b.facility ??= {
    levels: { equipment: 0, utilities: 0, storage: 0, backup: 0 },
    condition: 100,
    shifts: 1,
    maintenance: 1,
    projects: [],
    invested: 0,
    nextId: 1,
    outage: 1,
    overflow: 0,
    lastUtilization: 0,
    report: "Facility ready.",
  });
}
export function facilityQuote(b, key) {
  const f = facility(b),
    m = FACILITY_MODULES.find((m) => m.id === key);
  if (!m || f.levels[key] >= 10) return null;
  return {
    cost: type(b).cost * m.cost * (f.levels[key] + 1) ** 1.55,
    months: m.months + Math.floor(f.levels[key] / 3),
  };
}
export function buildFacility(s, b, key) {
  const f = facility(b),
    q = facilityQuote(b, key);
  if (
    !q ||
    f.projects.length >= 2 ||
    f.projects.some((p) => p.key === key) ||
    s.cash < q.cost * 0.35
  )
    return false;
  s.cash -= q.cost * 0.35;
  f.projects.push({
    id: f.nextId++,
    key,
    cost: q.cost,
    funded: q.cost * 0.35,
    months: q.months,
    remaining: q.months,
    status: "building",
  });
  return true;
}
export function cancelFacility(s, b, id) {
  const f = facility(b),
    p = f.projects.find((p) => p.id === id);
  if (!p) return false;
  s.cash += p.funded * 0.4;
  f.projects = f.projects.filter((x) => x !== p);
  return true;
}
export function facilityAssets(b) {
  const f = facility(b);
  return f.invested * 0.5 + f.projects.reduce((n, p) => n + p.funded * 0.4, 0);
}
export function facilityLimits(b, labor) {
  const f = facility(b),
    t = type(b),
    shift = [1, 1.3, 1.6][f.shifts - 1];
  const workforce = labor * shift,
    equipment =
      t.capacity *
      b.level *
      5 *
      (1 + f.levels.equipment * 0.3) *
      (0.7 + f.condition * 0.003),
    utilities =
      t.capacity * b.level * 5 * (1 + f.levels.utilities * 0.3) * f.outage;
  const limits = { workforce, equipment, utilities };
  const bottleneck = Object.keys(limits).reduce(
    (a, k) => (limits[k] < limits[a] ? k : a),
    "workforce",
  );
  return {
    ...limits,
    capacity: Math.floor(Math.min(...Object.values(limits))),
    bottleneck,
    storage: Math.floor(
      t.capacity * b.level * 6 * (1 + f.levels.storage * 0.5),
    ),
  };
}
export function facilityOverhead(s, b) {
  const f = facility(b),
    t = type(b);
  return (
    t.cost * [0, 0.001, 0.003][f.maintenance] +
    f.invested * 0.001 +
    b.staff * t.wage * s.inflation * [0, 0.35, 0.8][f.shifts - 1]
  );
}
export function beforeFacilityMonth(s, random) {
  for (const b of s.businesses) {
    const f = facility(b);
    f.overflow = 0;
    f.outage = 1;
    f.report = "Facility operating normally.";
    for (const p of [...f.projects]) {
      const installment = (p.cost - p.funded) / p.remaining;
      if (s.cash + 1e-8 < installment) {
        p.status = "funding paused";
        continue;
      }
      s.cash -= installment;
      p.funded += installment;
      p.remaining--;
      p.status = "building";
      if (!p.remaining) {
        f.levels[p.key]++;
        f.invested += p.cost;
        f.projects = f.projects.filter((x) => x !== p);
        f.report =
          "Construction completed: " +
          FACILITY_MODULES.find((m) => m.id === p.key).name +
          ".";
      }
    }
    const wear = 0.7 + f.lastUtilization * 0.8 + (f.shifts - 1) * 0.7;
    f.condition = Math.max(
      20,
      Math.min(100, f.condition + [0, 1.3, 2.8][f.maintenance] - wear),
    );
    if (random(s) < Math.max(0.002, 0.025 - f.levels.backup * 0.003)) {
      f.outage = Math.min(0.95, 0.6 + f.levels.backup * 0.045);
      f.report =
        "Utility interruption reduced available service capacity this month.";
    }
    if (f.shifts > 1) b.morale = Math.max(20, b.morale - (f.shifts - 1) * 0.6);
  }
}
export function enforceStorage(b, unit) {
  const f = facility(b),
    limit = facilityLimits(b, 0).storage;
  f.overflow = Math.max(0, b.inventory - limit);
  if (!f.overflow) return 0;
  const cost = consumeStock(b, f.overflow);
  f.report = `Storage overflow: ${f.overflow} input units written off. Reduce orders or expand storage.`;
  return cost;
}
