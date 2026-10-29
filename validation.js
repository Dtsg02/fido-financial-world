import { CITIES } from "./world.js?v=50124d33bf5b";
import { TYPES } from "./catalog.js?v=50124d33bf5b";
// Save files are untrusted input. Reject malformed state before replacing a game.
const finite = (n) => typeof n === "number" && Number.isFinite(n);
const num = (n, min = 0, max = 1e100) => finite(n) && n >= min && n <= max;
const integer = (n, min = 0, max = 1e9) =>
  Number.isInteger(n) && n >= min && n <= max;
const str = (x) => typeof x === "string" && x.length < 10000;
const list = (a, fn, max = 10000) =>
  Array.isArray(a) && a.length <= max && a.every(fn);
const sectors = TYPES.map((t) => t.id);
const cities = { includes: (id) => CITIES.some((c) => c.id === id) };
const supply = ["spot", "standard", "premium", "green"];
const contract = (c) =>
  c &&
  str(c.id) &&
  str(c.client) &&
  sectors.includes(c.type) &&
  integer(c.units, 1) &&
  num(c.price, 0.01) &&
  integer(c.deadline) &&
  integer(c.terms, 1, 3) &&
  num(c.minRep, 0, 100) &&
  num(c.deposit) &&
  num(c.penalty);
export function validateExtra(s) {
  try {
    if (
      !list(
        s.businesses,
        (b) =>
          b &&
          str(b.name) &&
          num(b.id) &&
          integer(b.level, 1, 10) &&
          num(b.marketing, 0, 100000) &&
          [1, 2, 3].includes(b.quality) &&
          num(b.reputation, 0, 100) &&
          typeof b.auto === "boolean" &&
          finite(b.lastProfit) &&
          num(b.lastRevenue) &&
          integer(b.sold) &&
          integer(b.lost) &&
          (!b.city || cities.includes(b.city)) &&
          (!b.supplier || supply.includes(b.supplier)) &&
          (b.salary === undefined || [0.8, 1, 1.15, 1.3].includes(b.salary)) &&
          (b.morale === undefined || num(b.morale, 0, 100)) &&
          (b.skill === undefined || num(b.skill, 1, 3)) &&
          (b.training === undefined || num(b.training, 0, 20000)) &&
          (b.maintenance === undefined || num(b.maintenance, 0, 2000)) &&
          (b.products === undefined || integer(b.products, 0, 4)) &&
          (b.efficiency === undefined || integer(b.efficiency, 0, 4)) &&
          (!b.project ||
            (["product", "efficiency", "resilience"].includes(b.project.kind) &&
              integer(b.project.remaining, 1, 3))),
      )
    )
      return false;
    if (
      !list(
        s.history,
        (h) =>
          h &&
          integer(h.month) &&
          finite(h.worth) &&
          finite(h.cash) &&
          finite(h.profit),
        60,
      ) ||
      !list(
        s.ledger,
        (l) => l && integer(l.month) && str(l.text) && finite(l.amount),
        160,
      ) ||
      !list(
        s.news,
        (n) => n && str(n.title) && str(n.text) && integer(n.month),
        30,
      ) ||
      !list(s.achievements, str, 100)
    )
      return false;
    if (
      s.event &&
      (!["festival", "training", "repair", "decision"].includes(s.event.kind) ||
        !str(s.event.title) ||
        !str(s.event.text) ||
        !num(s.event.cost))
    )
      return false;
    if (!s.world) return true;
    let w = s.world;
    return (
      list(w.commodities, (n) => num(n, 1, 10000), 4) &&
      w.commodities.length === 4 &&
      list(w.commodityHistory, (a) => list(a, (n) => num(n), 24), 4) &&
      w.commodityHistory.length === 4 &&
      list(
        w.rivals,
        (r) =>
          r &&
          str(r.id) &&
          str(r.name) &&
          sectors.includes(r.type) &&
          cities.includes(r.city) &&
          num(r.power, 0.1, 10) &&
          num(r.price, 0.01) &&
          num(r.reputation, 0, 100) &&
          num(r.value),
        100,
      ) &&
      list(w.offers, contract, 20) &&
      list(
        w.contracts,
        (c) =>
          contract(c) &&
          num(c.businessId) &&
          ["active", "completed", "failed"].includes(c.status) &&
          integer(c.delivered, 0, c.units) &&
          (c.status !== "active" ||
            s.businesses.some((b) => b.id === c.businessId)),
        1000,
      ) &&
      list(
        w.receivables,
        (r) => r && str(r.client) && num(r.amount) && integer(r.due),
        10000,
      ) &&
      list(
        w.bonds,
        (b) =>
          b &&
          num(b.balance) &&
          num(b.payment, 0.01) &&
          num(b.rate, 0, 1) &&
          [12, 24, 36].includes(b.term),
        1000,
      ) &&
      w.bonds.reduce((n, b) => n + b.balance, 0) <= s.debt + 0.01 &&
      list(w.reports, (r) => r && str(r.text) && integer(r.month), 100) &&
      w.policy &&
      num(w.policy.tax, 0, 1) &&
      num(w.policy.carbon) &&
      num(w.policy.subsidy) &&
      num(w.creditScore, 300, 850) &&
      num(w.sentiment, 0, 100) &&
      num(w.unemployment, 0, 100) &&
      num(w.delivered) &&
      num(w.failed) &&
      num(w.monthCosts)
    );
  } catch {
    return false;
  }
}
